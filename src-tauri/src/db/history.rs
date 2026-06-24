use sqlx::SqlitePool;

use crate::db::new_id;
use crate::error::AppResult;
use crate::models::{HistoryEntry, HttpMethod};

#[derive(sqlx::FromRow)]
struct HistoryRow {
    id: String,
    request_id: Option<String>,
    method: String,
    url: String,
    status: i64,
    duration_ms: i64,
    created_at: String,
}

impl HistoryRow {
    fn into_entry(self) -> HistoryEntry {
        let method = match self.method.as_str() {
            "POST" => HttpMethod::Post,
            "PUT" => HttpMethod::Put,
            "PATCH" => HttpMethod::Patch,
            "DELETE" => HttpMethod::Delete,
            _ => HttpMethod::Get,
        };
        HistoryEntry {
            id: self.id,
            request_id: self.request_id,
            method,
            url: self.url,
            status: self.status as u16,
            duration_ms: self.duration_ms,
            created_at: self.created_at,
        }
    }
}

pub async fn add_entry(
    pool: &SqlitePool,
    request_id: Option<&str>,
    method: HttpMethod,
    url: &str,
    status: u16,
    duration_ms: u128,
    request_snapshot: Option<&str>,
    response_snapshot: Option<&str>,
) -> AppResult<HistoryEntry> {
    let entry = HistoryEntry {
        id: new_id(),
        request_id: request_id.map(str::to_string),
        method,
        url: url.to_string(),
        status,
        duration_ms: duration_ms as i64,
        created_at: crate::db::now_iso(),
    };

    sqlx::query(
        "INSERT INTO history \
         (id, request_id, method, url, status, duration_ms, created_at, request_snapshot_json, response_snapshot_json) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&entry.id)
    .bind(&entry.request_id)
    .bind(entry.method.as_str())
    .bind(&entry.url)
    .bind(entry.status as i64)
    .bind(entry.duration_ms)
    .bind(&entry.created_at)
    .bind(request_snapshot)
    .bind(response_snapshot)
    .execute(pool)
    .await?;

    Ok(entry)
}

pub async fn list_history(pool: &SqlitePool, limit: i64) -> AppResult<Vec<HistoryEntry>> {
    let rows = sqlx::query_as::<_, HistoryRow>(
        "SELECT id, request_id, method, url, status, duration_ms, created_at \
         FROM history ORDER BY created_at DESC LIMIT ?",
    )
    .bind(limit)
    .fetch_all(pool)
    .await?;
    Ok(rows.into_iter().map(HistoryRow::into_entry).collect())
}

pub async fn clear_history(pool: &SqlitePool) -> AppResult<()> {
    sqlx::query("DELETE FROM history").execute(pool).await?;
    Ok(())
}
