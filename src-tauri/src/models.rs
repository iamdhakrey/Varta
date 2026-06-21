use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum HttpMethod {
    #[serde(rename = "GET")]
    Get,
    #[serde(rename = "POST")]
    Post,
    #[serde(rename = "PUT")]
    Put,
    #[serde(rename = "PATCH")]
    Patch,
    #[serde(rename = "DELETE")]
    Delete,
}

impl HttpMethod {
    pub fn as_reqwest(&self) -> reqwest::Method {
        match self {
            HttpMethod::Get => reqwest::Method::GET,
            HttpMethod::Post => reqwest::Method::POST,
            HttpMethod::Put => reqwest::Method::PUT,
            HttpMethod::Patch => reqwest::Method::PATCH,
            HttpMethod::Delete => reqwest::Method::DELETE,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")] // 👈 ADD THIS HERE TOO
pub struct KeyValueRow {
    // pub id: String,
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CookieRow {
    pub id: String,
    pub name: String,
    pub value: String,
    pub domain: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BasicAuth {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BearerAuth {
    pub token: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum ApiKeyTarget {
    Header,
    Query,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeyAuth {
    pub key: String,
    pub value: String,
    pub add_to: ApiKeyTarget,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum AuthType {
    None,
    Basic,
    Bearer,
    ApiKey,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthConfig {
    #[serde(rename = "type")]
    pub auth_type: AuthType,
    pub basic: Option<BasicAuth>,
    pub bearer: Option<BearerAuth>,
    pub api_key: Option<ApiKeyAuth>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UploadedFile {
    pub id: String,
    pub name: String,
    pub size_bytes: u64,
    /// Absolute filesystem path. Populated by the `pick_files` command,
    /// which uses the native file dialog rather than a browser <input>,
    /// so the backend has real disk access for multipart uploads.
    pub path: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum BodyMode {
    Json,
    FormData,
    Urlencoded,
    Raw,
    Multipart,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RequestBody {
    pub mode: Option<BodyMode>,
    pub raw: Option<String>,
    pub form_data: Option<Vec<KeyValueRow>>,
    pub url_encoded: Option<Vec<KeyValueRow>>,
    pub files: Option<Vec<UploadedFile>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiRequest {
    pub id: Option<String>,
    #[serde(default)]
    pub name: String,
    // #[serde(default)]
    pub method: HttpMethod,
    #[serde(default)]
    pub url: String,

    #[serde(default)]
    pub params: Vec<KeyValueRow>,

    #[serde(default)]
    pub headers: Vec<KeyValueRow>,
    #[serde(default)]
    pub cookies: Vec<CookieRow>,

    pub auth: AuthConfig,
    #[serde(default)]
    pub body: RequestBody,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponse {
    pub status: u16,
    pub status_text: String,
    pub time_ms: u128,
    pub size_bytes: u64,
    pub headers: BTreeMap<String, String>,
    pub cookies: Vec<CookieRow>,
    pub body: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectionFolder {
    pub id: String,
    pub name: String,
    pub requests: Vec<ApiRequest>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub folders: Vec<CollectionFolder>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Environment {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub variables: BTreeMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryEntry {
    pub id: String,
    pub method: HttpMethod,
    pub url: String,
    pub status: u16,
    pub timestamp: String,
    pub duration_ms: u128,
}

/// Everything persisted to disk for a workspace: collections, environments
/// and request history. Serialized as a single JSON file under the app's
/// data directory (see `commands::workspace::store_path`).
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WorkspaceStore {
    pub collections: Vec<Collection>,
    pub environments: Vec<Environment>,
    #[serde(default)]
    pub history: Vec<HistoryEntry>,
}
