use sqlx::{AssertSqlSafe, QueryBuilder, SqlitePool};

use crate::db::now_iso;
use crate::error::{AppError, AppResult};
use crate::models::{PluginManifest, PluginRecord};

#[derive(sqlx::FromRow)]
struct PluginRow {
    id: String,
    name: String,
    version: String,
    description: String,
    enabled: bool,
    install_path: String,
    manifest_json: String,
    installed_at: String,
}

impl PluginRow {
    fn into_record(self) -> AppResult<PluginRecord> {
        let manifest: PluginManifest = serde_json::from_str(&self.manifest_json)?;
        Ok(PluginRecord {
            id: self.id,
            name: self.name,
            version: self.version,
            description: self.description,
            enabled: self.enabled,
            install_path: self.install_path,
            hooks: manifest.hooks,
            installed_at: self.installed_at,
        })
    }
}

const PLUGIN_COLUMNS: &str =
    "id, name, version, description, enabled, install_path, manifest_json, installed_at";

pub async fn list_plugins(pool: &SqlitePool) -> AppResult<Vec<PluginRecord>> {
    // let sql = format!("SELECT {PLUGIN_COLUMNS} FROM plugins ORDER BY name ASC");
    // let safe_sql = AssertSqlSafe(&sql);
    // let rows = sqlx::query_as::<_, PluginRow>(&safe_sql)
    //     .fetch_all(pool)
    //     .await?;
    //
    let mut query_builder: QueryBuilder<sqlx::Sqlite> = QueryBuilder::new("SELECT ");
    query_builder.push(PLUGIN_COLUMNS);
    query_builder.push(" FROM plugins ORDER BY name ASC");

    // .build_query_as maps the database columns to your PluginRow struct at runtime
    let rows = query_builder
        .build_query_as::<PluginRow>()
        .fetch_all(pool)
        .await?;

    let records = rows
        .into_iter()
        .map(PluginRow::into_record)
        .collect::<Result<Vec<_>, _>>()?;
    Ok(records)
}

pub async fn list_enabled_plugins_with_source(
    pool: &SqlitePool,
) -> AppResult<Vec<(PluginManifest, String)>> {
    // let sql =
    //     format!("SELECT {PLUGIN_COLUMNS} FROM plugins WHERE enabled = 1 ORDER BY installed_at ASC");
    // let rows = sqlx::query_as::<_, PluginRow>(&sql).fetch_all(pool).await?;

    let mut query_builder: QueryBuilder<sqlx::Sqlite> = QueryBuilder::new("SELECT ");
    query_builder.push(PLUGIN_COLUMNS);
    query_builder.push(" FROM plugins WHERE enabled = 1 ORDER BY installed_at ASC");

    // .build_query_as maps the database columns to your PluginRow struct at runtime
    let rows = query_builder
        .build_query_as::<PluginRow>()
        .fetch_all(pool)
        .await?;

    let mut out = Vec::with_capacity(rows.len());
    for row in rows {
        let manifest: PluginManifest = serde_json::from_str(&row.manifest_json)?;
        let entry_path = std::path::Path::new(&row.install_path).join(&manifest.entry);
        let source = std::fs::read_to_string(&entry_path).map_err(|e| {
            AppError::Other(format!(
                "failed to read entry script for plugin '{}' at {}: {e}",
                manifest.id,
                entry_path.display()
            ))
        })?;
        out.push((manifest, source));
    }
    Ok(out)
}

/// Registers a plugin already unpacked on disk at `install_path`
/// (containing `manifest.json`). Re-running with the same manifest id
/// upserts — lets `install_plugin` double as "reinstall/update".
pub async fn upsert_plugin(
    pool: &SqlitePool,
    manifest: &PluginManifest,
    install_path: &str,
) -> AppResult<PluginRecord> {
    let manifest_json = serde_json::to_string(manifest)?;

    sqlx::query(
        "INSERT INTO plugins (id, name, version, description, enabled, install_path, manifest_json, installed_at) \
         VALUES (?, ?, ?, ?, 1, ?, ?, ?) \
         ON CONFLICT(id) DO UPDATE SET \
            name = excluded.name, \
            version = excluded.version, \
            description = excluded.description, \
            install_path = excluded.install_path, \
            manifest_json = excluded.manifest_json",
    )
    .bind(&manifest.id)
    .bind(&manifest.name)
    .bind(&manifest.version)
    .bind(&manifest.description)
    .bind(install_path)
    .bind(&manifest_json)
    .bind(now_iso())
    .execute(pool)
    .await?;

    // let sql = format!("SELECT {PLUGIN_COLUMNS} FROM plugins WHERE id = ?");
    // let row = sqlx::query_as::<_, PluginRow>(&sql)
    //     .bind(&manifest.id)
    //     .fetch_one(pool)
    //     .await?;

    let mut query_builder: QueryBuilder<sqlx::Sqlite> = QueryBuilder::new("SELECT ");
    query_builder.push(PLUGIN_COLUMNS);
    query_builder.push(" FROM plugins WHERE id = ?");

    // .build_query_as maps the database columns to your PluginRow struct at runtime
    let row = query_builder
        .build_query_as::<PluginRow>()
        .fetch_one(pool)
        .await?;

    row.into_record()
}

pub async fn set_plugin_enabled(pool: &SqlitePool, id: &str, enabled: bool) -> AppResult<()> {
    sqlx::query("UPDATE plugins SET enabled = ? WHERE id = ?")
        .bind(enabled)
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn get_plugin_install_path(pool: &SqlitePool, id: &str) -> AppResult<String> {
    let row: (String,) = sqlx::query_as("SELECT install_path FROM plugins WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("plugin '{id}'")))?;
    Ok(row.0)
}

pub async fn delete_plugin(pool: &SqlitePool, id: &str) -> AppResult<()> {
    sqlx::query("DELETE FROM plugins WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}
