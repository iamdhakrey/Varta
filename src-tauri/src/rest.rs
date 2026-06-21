use crate::models::{ApiKeyTarget, ApiRequest, ApiResponse, AuthType, BodyMode, CookieRow};
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, CONTENT_TYPE, SET_COOKIE};
use std::collections::BTreeMap;
use std::time::Instant;

/// Executes an `ApiRequest` and returns the resulting `ApiResponse`.
///
/// This is the command the frontend's `sendActiveRequest` (in `store.ts`)
/// calls instead of its mock `setTimeout`. Running the request from Rust
/// rather than the webview means it isn't subject to the browser's CORS
/// restrictions, and lets us read real files from disk for multipart
/// uploads.
#[tauri::command]
pub async fn send_request(request: ApiRequest) -> Result<ApiResponse, String> {
    println!("{:?}", request);
    let client = reqwest::Client::builder()
        .build()
        .map_err(|e| format!("failed to build HTTP client: {e}"))?;

    let url = build_url(&request).map_err(|e| format!("invalid URL: {e}"))?;

    let mut builder = client.request(request.method.as_reqwest(), url);
    builder = apply_headers(builder, &request)?;
    builder = apply_auth(builder, &request);
    builder = apply_body(builder, &request).await?;

    let started = Instant::now();
    let response = builder
        .send()
        .await
        .map_err(|e| format!("request failed: {e}"))?;
    let elapsed = started.elapsed();

    let status = response.status();
    let status_text = status.canonical_reason().unwrap_or("Unknown").to_string();

    let headers = collect_headers(response.headers());
    let cookies = collect_cookies(response.headers());

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("failed to read response body: {e}"))?;
    let size_bytes = bytes.len() as u64;
    let body = String::from_utf8_lossy(&bytes).to_string();

    Ok(ApiResponse {
        status: status.as_u16(),
        status_text,
        time_ms: elapsed.as_millis(),
        size_bytes,
        headers,
        cookies,
        body,
    })
}

fn build_url(request: &ApiRequest) -> Result<reqwest::Url, url::ParseError> {
    let mut url = reqwest::Url::parse(&request.url)?;

    {
        let mut pairs = url.query_pairs_mut();
        for row in request
            .params
            .iter()
            .filter(|r| r.enabled && !r.key.is_empty())
        {
            pairs.append_pair(&row.key, &row.value);
        }
    }

    if request.auth.auth_type == AuthType::ApiKey {
        if let Some(api_key) = &request.auth.api_key {
            if api_key.add_to == ApiKeyTarget::Query && !api_key.key.is_empty() {
                url.query_pairs_mut()
                    .append_pair(&api_key.key, &api_key.value);
            }
        }
    }

    Ok(url)
}

fn apply_headers(
    mut builder: reqwest::RequestBuilder,
    request: &ApiRequest,
) -> Result<reqwest::RequestBuilder, String> {
    for row in request
        .headers
        .iter()
        .filter(|r| r.enabled && !r.key.is_empty())
    {
        let name = HeaderName::from_bytes(row.key.as_bytes())
            .map_err(|e| format!("invalid header name '{}': {e}", row.key))?;
        let value = HeaderValue::from_str(&row.value)
            .map_err(|e| format!("invalid header value for '{}': {e}", row.key))?;
        builder = builder.header(name, value);
    }

    if request.auth.auth_type == AuthType::ApiKey {
        if let Some(api_key) = &request.auth.api_key {
            if api_key.add_to == ApiKeyTarget::Header && !api_key.key.is_empty() {
                builder = builder.header(api_key.key.clone(), api_key.value.clone());
            }
        }
    }

    Ok(builder)
}

fn apply_auth(
    mut builder: reqwest::RequestBuilder,
    request: &ApiRequest,
) -> reqwest::RequestBuilder {
    match request.auth.auth_type {
        AuthType::Basic => {
            if let Some(basic) = &request.auth.basic {
                builder = builder.basic_auth(&basic.username, Some(&basic.password));
            }
        }
        AuthType::Bearer => {
            if let Some(bearer) = &request.auth.bearer {
                builder = builder.bearer_auth(&bearer.token);
            }
        }
        // API key is applied as a header or query param in apply_headers / build_url.
        AuthType::ApiKey | AuthType::None => {}
    }
    builder
}

async fn apply_body(
    mut builder: reqwest::RequestBuilder,
    request: &ApiRequest,
) -> Result<reqwest::RequestBuilder, String> {
    let mode = request.body.mode.unwrap_or(BodyMode::Json);

    match mode {
        BodyMode::Json => {
            if let Some(raw) = &request.body.raw {
                if !raw.trim().is_empty() {
                    // Validate so we fail fast with a clear message instead of
                    // sending malformed JSON the server will reject anyway.
                    serde_json::from_str::<serde_json::Value>(raw)
                        .map_err(|e| format!("body is not valid JSON: {e}"))?;
                    builder = builder
                        .header(CONTENT_TYPE, "application/json")
                        .body(raw.clone());
                }
            }
        }
        BodyMode::Raw => {
            if let Some(raw) = &request.body.raw {
                builder = builder.body(raw.clone());
            }
        }
        BodyMode::Urlencoded => {
            let pairs: Vec<(String, String)> = request
                .body
                .url_encoded
                .as_ref()
                .map(|rows| {
                    rows.iter()
                        .filter(|r| r.enabled && !r.key.is_empty())
                        .map(|r| (r.key.clone(), r.value.clone()))
                        .collect()
                })
                .unwrap_or_default();
            builder = builder.form(&pairs);
        }
        BodyMode::FormData | BodyMode::Multipart => {
            let mut form = reqwest::multipart::Form::new();

            if let Some(rows) = &request.body.form_data {
                for row in rows.iter().filter(|r| r.enabled && !r.key.is_empty()) {
                    form = form.text(row.key.clone(), row.value.clone());
                }
            }

            if let Some(files) = &request.body.files {
                for file in files {
                    let file_bytes = tokio::fs::read(&file.path)
                        .await
                        .map_err(|e| format!("failed to read file '{}': {e}", file.name))?;

                    let part =
                        reqwest::multipart::Part::bytes(file_bytes).file_name(file.name.clone());
                    form = form.part(file.name.clone(), part);
                }
            }

            builder = builder.multipart(form);
        }
    }

    Ok(builder)
}

fn collect_headers(headers: &HeaderMap) -> BTreeMap<String, String> {
    let mut out: BTreeMap<String, String> = BTreeMap::new();
    for (name, value) in headers.iter() {
        let value_str = value.to_str().unwrap_or("").to_string();
        out.entry(name.as_str().to_lowercase())
            .and_modify(|existing| {
                existing.push_str(", ");
                existing.push_str(&value_str);
            })
            .or_insert(value_str);
    }
    out
}

/// Parses `Set-Cookie` response headers into the frontend's `CookieRow`
/// shape. This is a pragmatic parser for display purposes (name, value,
/// domain) — it does not implement full RFC 6265 attribute handling
/// (Expires, Max-Age, SameSite, etc.), which isn't needed to show cookies
/// in the response viewer.
fn collect_cookies(headers: &HeaderMap) -> Vec<CookieRow> {
    headers
        .get_all(SET_COOKIE)
        .iter()
        .filter_map(|v| v.to_str().ok())
        .map(|raw| {
            let mut parts = raw.split(';').map(str::trim);
            let (name, value) = parts
                .next()
                .and_then(|kv| kv.split_once('='))
                .unwrap_or(("", ""));

            let domain = parts
                .find(|attr| attr.to_ascii_lowercase().starts_with("domain="))
                .and_then(|attr| attr.split_once('='))
                .map(|(_, v)| v.to_string())
                .unwrap_or_default();

            CookieRow {
                id: uuid::Uuid::new_v4().to_string(),
                name: name.to_string(),
                value: value.to_string(),
                domain,
            }
        })
        .collect()
}
