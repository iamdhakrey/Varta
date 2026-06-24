use sqlx::SqlitePool;

use crate::db::now_iso;
use crate::error::{AppError, AppResult};
use crate::models::{Theme, ThemeTokens};

#[derive(sqlx::FromRow)]
struct ThemeRow {
    id: String,
    name: String,
    is_builtin: bool,
    tokens_json: String,
}

impl ThemeRow {
    fn into_theme(self) -> AppResult<Theme> {
        Ok(Theme {
            id: self.id,
            name: self.name,
            is_builtin: self.is_builtin,
            tokens: serde_json::from_str::<ThemeTokens>(&self.tokens_json)?,
        })
    }
}

pub async fn list_themes(pool: &SqlitePool) -> AppResult<Vec<Theme>> {
    let rows = sqlx::query_as::<_, ThemeRow>(
        "SELECT id, name, is_builtin, tokens_json FROM themes ORDER BY is_builtin DESC, name ASC",
    )
    .fetch_all(pool)
    .await?;

    rows.into_iter().map(ThemeRow::into_theme).collect()
}

pub async fn get_theme(pool: &SqlitePool, id: &str) -> AppResult<Theme> {
    let row = sqlx::query_as::<_, ThemeRow>(
        "SELECT id, name, is_builtin, tokens_json FROM themes WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("theme '{id}'")))?;
    row.into_theme()
}

pub async fn save_custom_theme(
    pool: &SqlitePool,
    id: Option<&str>,
    name: &str,
    tokens: &ThemeTokens,
) -> AppResult<Theme> {
    let id = id.map(str::to_string).unwrap_or_else(crate::db::new_id);
    let tokens_json = serde_json::to_string(tokens)?;

    sqlx::query(
        "INSERT INTO themes (id, name, is_builtin, tokens_json, created_at, updated_at) \
         VALUES (?, ?, 0, ?, ?, ?) \
         ON CONFLICT(id) DO UPDATE SET \
            name = excluded.name, tokens_json = excluded.tokens_json, updated_at = excluded.updated_at \
         WHERE themes.is_builtin = 0",
    )
    .bind(&id)
    .bind(name)
    .bind(&tokens_json)
    .bind(now_iso())
    .bind(now_iso())
    .execute(pool)
    .await?;

    get_theme(pool, &id).await
}

pub async fn delete_theme(pool: &SqlitePool, id: &str) -> AppResult<()> {
    let theme = get_theme(pool, id).await?;
    if theme.is_builtin {
        return Err(AppError::Invalid(
            "built-in themes can't be deleted".to_string(),
        ));
    }
    sqlx::query("DELETE FROM themes WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}
