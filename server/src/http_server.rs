use axum::{
    routing::get,
    Router,
};
use std::path::Path;
use tower::ServiceBuilder;
use tower_http::{
    cors::{CorsLayer, Any},
    services::ServeDir,
};
use tracing::{info, warn};

use crate::websocket::WebSocketServer;

pub fn create_http_server(ws_server: WebSocketServer) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // フロントエンドの静的ファイルディレクトリを検索
    let static_dir = find_frontend_directory();

    let router = Router::new()
        .route("/ws", get(WebSocketServer::handle_websocket_upgrade))
        .route("/server", get(WebSocketServer::handle_websocket_upgrade))
        .with_state(ws_server)
        .layer(ServiceBuilder::new().layer(cors));

    // 静的ファイルディレクトリが見つかった場合のみfallback_serviceを追加
    if let Some(dir) = static_dir {
        info!("Serving frontend static files from: {}", dir);
        let index_path = format!("{}/index.html", dir);
        router.fallback_service(
            ServeDir::new(&dir).fallback(ServeDir::new(&index_path))
        )
    } else {
        warn!("No frontend static files found. Only WebSocket endpoints will be available.");
        router
    }
}

/// フロントエンドの静的ファイルディレクトリを検索する
/// 優先順位:
/// 1. ./frontend (バイナリと同じディレクトリ)
/// 2. ./out (バイナリと同じディレクトリ)
/// 3. ./www (バイナリと同じディレクトリ)
/// 4. ./static (バイナリと同じディレクトリ)
/// 5. ./frontend/out (開発時用)
fn find_frontend_directory() -> Option<String> {
    let candidates = vec![
        "./frontend",
        "./out",
        "./www",
        "./static",
        "./frontend/out", // 開発時用
    ];

    for dir in candidates {
        if Path::new(dir).exists() {
            // index.htmlが存在するかチェック
            let index_path = format!("{}/index.html", dir);
            if Path::new(&index_path).exists() {
                return Some(dir.to_string());
            }
        }
    }

    None
}


