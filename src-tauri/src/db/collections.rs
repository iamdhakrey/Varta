use sqlx::{QueryBuilder, SqlitePool};
use std::collections::HashMap;

use crate::db::{new_id, now_iso};
use crate::error::{AppError, AppResult};
use crate::models::{
    ApiRequest, AuthConfig, Collection, CollectionTree, CookieRow, Folder, FolderNode, HttpMethod,
    KeyValueRow, RequestBody,
};

/// Flat DB row for a request — JSON sub-objects stay as raw strings here;
/// `into_api_request` parses them into the structured `ApiRequest` the
/// frontend expects.
#[derive(Debug, Clone, sqlx::FromRow)]
struct RequestRow {
    id: String,
    collection_id: String,
    folder_id: Option<String>,
    name: String,
    method: String,
    url: String,
    params_json: String,
    headers_json: String,
    cookies_json: String,
    auth_json: String,
    body_json: String,
}

impl RequestRow {
    fn into_api_request(self) -> AppResult<ApiRequest> {
        let method = match self.method.as_str() {
            "GET" => HttpMethod::Get,
            "POST" => HttpMethod::Post,
            "PUT" => HttpMethod::Put,
            "PATCH" => HttpMethod::Patch,
            "DELETE" => HttpMethod::Delete,
            other => return Err(AppError::Invalid(format!("unknown HTTP method '{other}'"))),
        };

        Ok(ApiRequest {
            id: self.id,
            collection_id: self.collection_id,
            folder_id: self.folder_id,
            name: self.name,
            method,
            url: self.url,
            params: serde_json::from_str::<Vec<KeyValueRow>>(&self.params_json)?,
            headers: serde_json::from_str::<Vec<KeyValueRow>>(&self.headers_json)?,
            cookies: serde_json::from_str::<Vec<CookieRow>>(&self.cookies_json)?,
            auth: serde_json::from_str::<AuthConfig>(&self.auth_json)?,
            body: serde_json::from_str::<RequestBody>(&self.body_json)?,
        })
    }
}

const REQUEST_COLUMNS: &str = "id, collection_id, folder_id, name, method, url, \
    params_json, headers_json, cookies_json, auth_json, body_json";

async fn fetch_requests_for_collection(
    pool: &SqlitePool,
    collection_id: &str,
) -> AppResult<Vec<RequestRow>> {
    // let sql = format!(
    //     "SELECT {REQUEST_COLUMNS} FROM requests WHERE collection_id = ? ORDER BY sort_order ASC"
    // );
    // let rows = sqlx::query_as::<_, RequestRow>(&sql)
    //     .bind(collection_id)
    //     .fetch_all(pool)
    //     .await?;

    let mut query_builder: QueryBuilder<sqlx::Sqlite> = QueryBuilder::new("SELECT ");
    query_builder.push(REQUEST_COLUMNS);
    query_builder.push(" FROM requests WHERE collection_id = ? ORDER BY sort_order ASC");

    let rows = query_builder
        .build_query_as::<RequestRow>()
        .bind(collection_id)
        .fetch_all(pool)
        .await?;

    Ok(rows)
}

/// Returns every collection in a workspace as a fully assembled tree
/// (folders nested under folders, requests nested under both), ready for
/// the sidebar to render in one pass.
pub async fn get_collection_trees(
    pool: &SqlitePool,
    workspace_id: &str,
) -> AppResult<Vec<CollectionTree>> {
    let collections = sqlx::query_as::<_, Collection>(
        "SELECT id, workspace_id, name, sort_order FROM collections \
         WHERE workspace_id = ? ORDER BY sort_order ASC",
    )
    .bind(workspace_id)
    .fetch_all(pool)
    .await?;

    let mut trees = Vec::with_capacity(collections.len());
    for collection in collections {
        let folders = sqlx::query_as::<_, Folder>(
            "SELECT id, collection_id, parent_folder_id, name, sort_order FROM folders \
             WHERE collection_id = ? ORDER BY sort_order ASC",
        )
        .bind(&collection.id)
        .fetch_all(pool)
        .await?;

        let request_rows = fetch_requests_for_collection(pool, &collection.id).await?;
        let mut requests_by_folder: HashMap<Option<String>, Vec<ApiRequest>> = HashMap::new();
        for row in request_rows {
            let folder_id = row.folder_id.clone();
            requests_by_folder
                .entry(folder_id)
                .or_default()
                .push(row.into_api_request()?);
        }

        let folder_nodes = build_folder_tree(&folders, None, &mut requests_by_folder);
        let root_requests = requests_by_folder.remove(&None).unwrap_or_default();

        trees.push(CollectionTree {
            collection,
            folders: folder_nodes,
            requests: root_requests,
        });
    }

    Ok(trees)
}

fn build_folder_tree(
    all_folders: &[Folder],
    parent_id: Option<&str>,
    requests_by_folder: &mut HashMap<Option<String>, Vec<ApiRequest>>,
) -> Vec<FolderNode> {
    all_folders
        .iter()
        .filter(|f| f.parent_folder_id.as_deref() == parent_id)
        .map(|folder| {
            let children =
                build_folder_tree(all_folders, Some(folder.id.as_str()), requests_by_folder);
            let requests = requests_by_folder
                .remove(&Some(folder.id.clone()))
                .unwrap_or_default();
            FolderNode {
                folder: folder.clone(),
                children,
                requests,
            }
        })
        .collect()
}

// -- Collections ---------------------------------------------------------

pub async fn create_collection(
    pool: &SqlitePool,
    workspace_id: &str,
    name: &str,
) -> AppResult<Collection> {
    let collection = Collection {
        id: new_id(),
        workspace_id: workspace_id.to_string(),
        name: name.to_string(),
        sort_order: 0,
    };
    sqlx::query(
        "INSERT INTO collections (id, workspace_id, name, sort_order, created_at, updated_at) \
         VALUES (?, ?, ?, 0, ?, ?)",
    )
    .bind(&collection.id)
    .bind(&collection.workspace_id)
    .bind(&collection.name)
    .bind(now_iso())
    .bind(now_iso())
    .execute(pool)
    .await?;
    Ok(collection)
}

pub async fn rename_collection(pool: &SqlitePool, id: &str, name: &str) -> AppResult<()> {
    sqlx::query("UPDATE collections SET name = ?, updated_at = ? WHERE id = ?")
        .bind(name)
        .bind(now_iso())
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn delete_collection(pool: &SqlitePool, id: &str) -> AppResult<()> {
    sqlx::query("DELETE FROM collections WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

// -- Folders --------------------------------------------------------------

pub async fn create_folder(
    pool: &SqlitePool,
    collection_id: &str,
    parent_folder_id: Option<&str>,
    name: &str,
) -> AppResult<Folder> {
    let folder = Folder {
        id: new_id(),
        collection_id: collection_id.to_string(),
        parent_folder_id: parent_folder_id.map(str::to_string),
        name: name.to_string(),
        sort_order: 0,
    };
    sqlx::query(
        "INSERT INTO folders (id, collection_id, parent_folder_id, name, sort_order, created_at, updated_at) \
         VALUES (?, ?, ?, ?, 0, ?, ?)",
    )
    .bind(&folder.id)
    .bind(&folder.collection_id)
    .bind(&folder.parent_folder_id)
    .bind(&folder.name)
    .bind(now_iso())
    .bind(now_iso())
    .execute(pool)
    .await?;
    Ok(folder)
}

pub async fn delete_folder(pool: &SqlitePool, id: &str) -> AppResult<()> {
    sqlx::query("DELETE FROM folders WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

// -- Requests ---------------------------------------------------------------

pub async fn get_request(pool: &SqlitePool, id: &str) -> AppResult<ApiRequest> {
    // let sql = format!("SELECT {REQUEST_COLUMNS} FROM requests WHERE id = ?");
    // let row = sqlx::query_as::<_, RequestRow>(&sql)
    //     .bind(id)
    //     .fetch_optional(pool)
    //     .await?
    //     .ok_or_else(|| AppError::NotFound(format!("request '{id}'")))?;
    //
    let mut query_builder: QueryBuilder<sqlx::Sqlite> = QueryBuilder::new("SELECT ");
    query_builder.push(REQUEST_COLUMNS);
    query_builder.push(" FROM requests WHERE id = ?");

    let row = query_builder
        .build_query_as::<RequestRow>()
        .bind(id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("request '{id}'")))?;

    row.into_api_request()
}

pub async fn create_request(
    pool: &SqlitePool,
    collection_id: &str,
    folder_id: Option<&str>,
    name: &str,
) -> AppResult<ApiRequest> {
    let request = ApiRequest {
        id: new_id(),
        collection_id: collection_id.to_string(),
        folder_id: folder_id.map(str::to_string),
        name: name.to_string(),
        method: HttpMethod::Get,
        url: String::new(),
        params: vec![],
        headers: vec![],
        cookies: vec![],
        auth: AuthConfig::default(),
        body: RequestBody::default(),
    };
    save_request(pool, &request).await?;
    Ok(request)
}

/// Upsert — used both to create a brand-new request row (frontend
/// generates the id client-side when a tab opens) and to save edits.
pub async fn save_request(pool: &SqlitePool, request: &ApiRequest) -> AppResult<()> {
    let params_json = serde_json::to_string(&request.params)?;
    let headers_json = serde_json::to_string(&request.headers)?;
    let cookies_json = serde_json::to_string(&request.cookies)?;
    let auth_json = serde_json::to_string(&request.auth)?;
    let body_json = serde_json::to_string(&request.body)?;

    sqlx::query(
        "INSERT INTO requests (
            id, collection_id, folder_id, name, method, url,
            params_json, headers_json, cookies_json, auth_json, body_json,
            sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            collection_id = excluded.collection_id,
            folder_id = excluded.folder_id,
            name = excluded.name,
            method = excluded.method,
            url = excluded.url,
            params_json = excluded.params_json,
            headers_json = excluded.headers_json,
            cookies_json = excluded.cookies_json,
            auth_json = excluded.auth_json,
            body_json = excluded.body_json,
            updated_at = excluded.updated_at",
    )
    .bind(&request.id)
    .bind(&request.collection_id)
    .bind(&request.folder_id)
    .bind(&request.name)
    .bind(request.method.as_str())
    .bind(&request.url)
    .bind(params_json)
    .bind(headers_json)
    .bind(cookies_json)
    .bind(auth_json)
    .bind(body_json)
    .bind(now_iso())
    .bind(now_iso())
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn delete_request(pool: &SqlitePool, id: &str) -> AppResult<()> {
    sqlx::query("DELETE FROM requests WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn duplicate_request(pool: &SqlitePool, id: &str) -> AppResult<ApiRequest> {
    let mut original = get_request(pool, id).await?;
    original.id = new_id();
    original.name = format!("{} (copy)", original.name);
    save_request(pool, &original).await?;
    Ok(original)
}
