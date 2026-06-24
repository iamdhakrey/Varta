use sqlx::SqlitePool;

use crate::db::{new_id, now_iso};
use crate::error::AppResult;
use crate::models::Workspace;

pub async fn list_workspaces(pool: &SqlitePool) -> AppResult<Vec<Workspace>> {
    let rows = sqlx::query_as::<_, Workspace>(
        "SELECT id, name, created_at, updated_at FROM workspaces ORDER BY created_at ASC",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create_workspace(pool: &SqlitePool, name: &str) -> AppResult<Workspace> {
    let workspace = Workspace {
        id: new_id(),
        name: name.to_string(),
        created_at: now_iso(),
        updated_at: now_iso(),
    };

    sqlx::query("INSERT INTO workspaces (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)")
        .bind(&workspace.id)
        .bind(&workspace.name)
        .bind(&workspace.created_at)
        .bind(&workspace.updated_at)
        .execute(pool)
        .await?;

    Ok(workspace)
}

pub async fn rename_workspace(pool: &SqlitePool, id: &str, name: &str) -> AppResult<()> {
    sqlx::query("UPDATE workspaces SET name = ?, updated_at = ? WHERE id = ?")
        .bind(name)
        .bind(now_iso())
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn delete_workspace(pool: &SqlitePool, id: &str) -> AppResult<()> {
    // Cascades to collections/environments via ON DELETE CASCADE.
    sqlx::query("DELETE FROM workspaces WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}
