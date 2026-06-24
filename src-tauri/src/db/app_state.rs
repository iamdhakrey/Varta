use sqlx::SqlitePool;

use crate::error::AppResult;
use crate::models::ActiveState;

pub async fn get_active_state(pool: &SqlitePool) -> AppResult<ActiveState> {
    let row: Option<(Option<String>, Option<String>, Option<String>)> = sqlx::query_as(
        "SELECT active_workspace_id, active_environment_id, active_theme_id \
         FROM app_state WHERE id = 1",
    )
    .fetch_optional(pool)
    .await?;

    Ok(match row {
        Some((workspace, environment, theme)) => ActiveState {
            active_workspace_id: workspace,
            active_environment_id: environment,
            active_theme_id: theme,
        },
        None => ActiveState {
            active_workspace_id: None,
            active_environment_id: None,
            active_theme_id: None,
        },
    })
}

pub async fn set_active_workspace(pool: &SqlitePool, workspace_id: &str) -> AppResult<()> {
    upsert_active_state(pool, Some(workspace_id), None, None).await
}

pub async fn set_active_environment(
    pool: &SqlitePool,
    environment_id: Option<&str>,
) -> AppResult<()> {
    upsert_active_state(pool, None, Some(environment_id), None).await
}

pub async fn set_active_theme(pool: &SqlitePool, theme_id: &str) -> AppResult<()> {
    upsert_active_state(pool, None, None, Some(Some(theme_id))).await
}

/// Each `Option<Option<&str>>` parameter is "leave unchanged" (outer
/// `None`) vs "set to this value, possibly NULL" (outer `Some`) — lets
/// the three setter functions above share one upsert without clobbering
/// the fields they don't care about.
async fn upsert_active_state(
    pool: &SqlitePool,
    workspace_id: Option<&str>,
    environment_id: Option<Option<&str>>,
    theme_id: Option<Option<&str>>,
) -> AppResult<()> {
    let current = get_active_state(pool).await?;

    let next_workspace = workspace_id
        .map(str::to_string)
        .or(current.active_workspace_id);
    let next_environment = environment_id
        .map(|inner| inner.map(str::to_string))
        .unwrap_or(current.active_environment_id);
    let next_theme = theme_id
        .map(|inner| inner.map(str::to_string))
        .unwrap_or(current.active_theme_id);

    sqlx::query(
        "INSERT INTO app_state (id, active_workspace_id, active_environment_id, active_theme_id) \
         VALUES (1, ?, ?, ?) \
         ON CONFLICT(id) DO UPDATE SET \
            active_workspace_id = excluded.active_workspace_id, \
            active_environment_id = excluded.active_environment_id, \
            active_theme_id = excluded.active_theme_id",
    )
    .bind(next_workspace)
    .bind(next_environment)
    .bind(next_theme)
    .execute(pool)
    .await?;

    Ok(())
}
