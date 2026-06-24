use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::path::Path;
use std::str::FromStr;

use crate::error::AppResult;

pub mod app_state;
pub mod collections;
pub mod environments;
pub mod history;
pub mod plugins;
pub mod settings;
pub mod themes;
pub mod workspaces;
/// Opens (creating if necessary) the SQLite database at `db_path` and
/// runs every migration in `migrations/`. Called once from `lib.rs`'s
/// `setup` hook with the app's data directory.
pub async fn init_pool(db_path: &Path) -> AppResult<SqlitePool> {
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let options = SqliteConnectOptions::from_str(&format!("sqlite://{}", db_path.display()))?
        .create_if_missing(true)
        // WAL gives much better concurrent read/write behavior than the
        // default rollback journal, which matters once history writes
        // and sidebar reads start overlapping.
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    Ok(pool)
}

pub fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339()
}

pub fn new_id() -> String {
    uuid::Uuid::new_v4().to_string()
}
