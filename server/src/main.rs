mod websocket;
mod http_server;
mod client_manager;

use anyhow::Result;
use dotenvy::dotenv;
use std::env;
use tokio::net::TcpListener;
use tracing::{debug, info, warn};
use tracing_subscriber;

use crate::websocket::WebSocketServer;
use crate::http_server::create_http_server;
use crate::client_manager::ClientManager;

#[tokio::main]
async fn main() -> Result<()> {
    // 環境変数を読み込み
    dotenv().ok();
    
    // ログ設定
    tracing_subscriber::fmt::init();

    let port = env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse::<u16>()
        .unwrap_or(3000);

    let password = env::var("PASS")
        .expect("PASS environment variable must be set");

    info!("Starting PC Status Server on port {}", port);

    // クライアント管理を初期化
    let client_manager = ClientManager::new();
    
    // WebSocketサーバーを初期化
    let ws_server = WebSocketServer::new(client_manager.clone(), password);

    // 定期的なデータ送信タスクを開始
    let broadcast_sender = ws_server.get_broadcast_sender();
    let client_manager_clone = client_manager.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(1));
        loop {
            interval.tick().await;

            // すべてのクライアントデータを取得してブロードキャスト
            let clients = client_manager_clone.get_all_clients().await;
            if !clients.is_empty() {
                debug!("Broadcasting status data for {} clients", clients.len());
                let message = pc_status_shared::ServerMessage::Status(clients);
                if let Err(e) = broadcast_sender.send(message) {
                    warn!("Failed to broadcast status: {}", e);
                }
            }
        }
    });

    // HTTPサーバーとWebSocketサーバーを統合
    let app = create_http_server(ws_server);

    let listener = TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
    info!("Server listening on http://0.0.0.0:{}", port);

    axum::serve(listener, app).await?;

    Ok(())
}
