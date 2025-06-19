use anyhow::Result;
use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::Response,
};
use futures_util::{SinkExt, StreamExt};
use pc_status_shared::{ClientMessage, ServerMessage, StatusData};
use std::sync::Arc;
use tokio::sync::broadcast;
use tracing::{debug, error, info, warn};
use uuid::Uuid;

use crate::client_manager::ClientManager;

#[derive(Clone)]
pub struct WebSocketServer {
    client_manager: Arc<ClientManager>,
    password: String,
    broadcast_tx: broadcast::Sender<ServerMessage>,
}

impl WebSocketServer {
    pub fn new(client_manager: Arc<ClientManager>, password: String) -> Self {
        let (broadcast_tx, _) = broadcast::channel(1000);
        
        Self {
            client_manager,
            password,
            broadcast_tx,
        }
    }

    pub fn get_broadcast_sender(&self) -> broadcast::Sender<ServerMessage> {
        self.broadcast_tx.clone()
    }

    pub async fn handle_websocket_upgrade(
        State(server): State<WebSocketServer>,
        ws: WebSocketUpgrade,
    ) -> Response {
        ws.on_upgrade(move |socket| server.handle_websocket(socket))
    }

    async fn handle_websocket(self, socket: WebSocket) {
        let client_id = Uuid::new_v4().to_string();
        info!("New WebSocket connection: {}", client_id);

        let (mut sender, mut receiver) = socket.split();

        // 接続時の挨拶
        if let Err(e) = sender
            .send(Message::Text(
                ServerMessage::Hi("hello".to_string())
                    .to_json()
                    .unwrap_or_default()
                    .into(),
            ))
            .await
        {
            error!("Failed to send hello message: {}", e);
            return;
        }

        // クライアントからのメッセージを処理
        while let Some(msg) = receiver.next().await {
            match msg {
                Ok(Message::Text(text)) => {
                    if let Err(e) = self.handle_text_message(&client_id, &text).await {
                        error!("Error handling message: {}", e);
                        break;
                    }
                }
                Ok(Message::Close(_)) => {
                    info!("WebSocket connection closed: {}", client_id);
                    break;
                }
                Err(e) => {
                    error!("WebSocket error: {}", e);
                    break;
                }
                _ => {}
            }
        }

        // クリーンアップ
        if let Some(client_data) = self.client_manager.remove_client(&client_id).await {
            // 切断通知をブロードキャスト
            let toast = pc_status_shared::ToastData {
                message: format!("{} is disconnected", client_data.hostname),
                color: "#0508".to_string(),
                toast_time: 5000,
            };
            let _ = self.broadcast_tx.send(ServerMessage::Toast(toast));
        }
        info!("Client disconnected: {}", client_id);
    }

    async fn handle_text_message(
        &self,
        client_id: &str,
        text: &str,
    ) -> Result<()> {
        debug!("Received message from {}: {}", client_id, text);

        match ClientMessage::from_json(text) {
            Ok(ClientMessage::Hi { data, pass }) => {
                self.handle_hi_message(client_id, data, pass).await?;
            }
            Ok(ClientMessage::Sync(data)) => {
                self.handle_sync_message(client_id, data).await?;
            }
            Ok(ClientMessage::Only(hostname)) => {
                debug!("Only message for hostname: {}", hostname);
                // TODO: フィルタリング機能を実装
            }
            Err(e) => {
                warn!("Failed to parse message: {}", e);
            }
        }

        Ok(())
    }

    async fn handle_hi_message(
        &self,
        client_id: &str,
        mut data: StatusData,
        pass: Option<String>,
    ) -> Result<()> {
        // パスワード認証
        let provided_pass = data.pass.as_ref().or(pass.as_ref());
        if provided_pass != Some(&self.password) {
            warn!("Invalid password from client: {}", client_id);
            // 認証失敗時はクライアントを切断（実際の切断はWebSocketレベルで処理）
            return Err(anyhow::anyhow!("Authentication failed"));
        }

        // 重複ホスト名の処理
        if self.client_manager.hostname_exists(&data.hostname).await {
            if data.dev.unwrap_or(false) {
                let count = self.client_manager.get_hostname_count(&data.hostname).await;
                data.index = count;
                data.hostname = format!("[DEV] {}_{}", data.hostname, data.index);
            } else {
                // 重複ホスト名で開発モードでない場合は切断
                return Err(anyhow::anyhow!("Duplicate hostname"));
            }
        }

        // 履歴を初期化
        data.histories = vec![];

        // クライアントを登録
        self.client_manager.add_client(client_id, data.clone()).await;

        // 接続通知をブロードキャスト
        let toast = pc_status_shared::ToastData {
            message: format!("{} is connected", data.hostname),
            color: "#0508".to_string(),
            toast_time: 5000,
        };
        let _ = self.broadcast_tx.send(ServerMessage::Toast(toast));

        info!("Client registered: {} ({})", client_id, data.hostname);
        Ok(())
    }

    async fn handle_sync_message(&self, client_id: &str, data: StatusData) -> Result<()> {
        self.client_manager.update_client(client_id, data).await;

        // 同期メッセージをクライアントに送信
        let _ = self.broadcast_tx.send(ServerMessage::Sync("sync".to_string()));

        Ok(())
    }
}
