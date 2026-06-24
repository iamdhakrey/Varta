use sqlx::SqlitePool;

pub struct AppState {
    pub pool: SqlitePool,
}
