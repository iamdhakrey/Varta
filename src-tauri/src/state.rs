use std::collections::HashMap;
use std::sync::Arc;

use tokio::sync::Mutex;

use crate::db::DataDir;
use crate::models::WsTx;

/// In-memory map of active WebSocket connections, keyed by connection id.
pub type WsConnections = Arc<Mutex<HashMap<String, WsTx>>>;

pub struct AppState {
    pub data_dir: DataDir,
    pub ws_connections: WsConnections,
}
