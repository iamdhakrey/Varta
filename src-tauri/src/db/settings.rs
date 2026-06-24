use sqlx::SqlitePool;

use crate::error::AppResult;
use crate::models::AppSettings;

pub async fn get_settings(pool: &SqlitePool) -> AppResult<AppSettings> {
    let row: Option<(String,)> = sqlx::query_as("SELECT data_json FROM settings WHERE id = 1")
        .fetch_optional(pool)
        .await?;

    match row {
        Some((json,)) => Ok(serde_json::from_str(&json)?),
        None => Ok(AppSettings::default()),
    }
}

pub async fn update_settings(pool: &SqlitePool, settings: &AppSettings) -> AppResult<()> {
    let json = serde_json::to_string(settings)?;
    sqlx::query(
        "INSERT INTO settings (id, data_json) VALUES (1, ?) \
         ON CONFLICT(id) DO UPDATE SET data_json = excluded.data_json",
    )
    .bind(json)
    .execute(pool)
    .await?;
    Ok(())
}
