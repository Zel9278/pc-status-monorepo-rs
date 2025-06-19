use pc_status_shared::{StatusData, ClientData, HistoriesData};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, info};

#[derive(Clone)]
pub struct ClientManager {
    clients: Arc<RwLock<HashMap<String, StatusData>>>,
}

impl ClientManager {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            clients: Arc::new(RwLock::new(HashMap::new())),
        })
    }

    pub async fn add_client(&self, client_id: &str, mut status_data: StatusData) {
        // 履歴データを初期化
        let history = HistoriesData {
            cpu: status_data.cpu.clone(),
            ram: status_data.ram.clone(),
            swap: status_data.swap.clone(),
            storages: status_data.storages.clone(),
            gpu: status_data.gpu.clone(),
            uptime: status_data.uptime,
        };
        status_data.histories = vec![history];

        let mut clients = self.clients.write().await;
        clients.insert(client_id.to_string(), status_data);
        info!("Added client: {}", client_id);
    }

    pub async fn remove_client(&self, client_id: &str) -> Option<StatusData> {
        let mut clients = self.clients.write().await;
        if let Some(client_data) = clients.remove(client_id) {
            info!("Removed client: {} ({})", client_id, client_data.hostname);
            Some(client_data)
        } else {
            None
        }
    }

    pub async fn update_client(&self, client_id: &str, mut status_data: StatusData) {
        let mut clients = self.clients.write().await;
        
        if let Some(existing_client) = clients.get_mut(client_id) {
            // 既存のクライアントデータを更新
            let _old_hostname = existing_client.hostname.clone();
            
            // インデックスが設定されている場合の処理
            if existing_client.index > 0 {
                if status_data.dev.unwrap_or(false) {
                    status_data.index = existing_client.index;
                    status_data.hostname = format!("[DEV] {}_{}", 
                        status_data.hostname.replace("[DEV] ", "").split('_').next().unwrap_or(&status_data.hostname), 
                        existing_client.index
                    );
                } else {
                    // 開発モードでない場合は切断
                    debug!("Non-dev client trying to sync with index > 0: {}", client_id);
                    return;
                }
            }

            // 履歴を更新
            let history = HistoriesData {
                cpu: status_data.cpu.clone(),
                ram: status_data.ram.clone(),
                swap: status_data.swap.clone(),
                storages: status_data.storages.clone(),
                gpu: status_data.gpu.clone(),
                uptime: status_data.uptime,
            };

            // 履歴の長さを制限（最大10件）
            if existing_client.histories.len() >= 10 {
                existing_client.histories.remove(0);
            }
            existing_client.histories.push(history);

            // その他のフィールドを更新
            existing_client.cpu = status_data.cpu;
            existing_client.ram = status_data.ram;
            existing_client.swap = status_data.swap;
            existing_client.storages = status_data.storages;
            existing_client.gpu = status_data.gpu;
            existing_client.uptime = status_data.uptime;
            existing_client.loadavg = status_data.loadavg;
            existing_client.hostname = status_data.hostname;

            debug!("Updated client: {} ({})", client_id, existing_client.hostname);
        }
    }

    pub async fn get_all_clients(&self) -> ClientData {
        let clients = self.clients.read().await;
        let mut result = HashMap::new();
        
        for (id, mut status) in clients.clone() {
            // パスワードを除去してフロントエンドに送信
            status.pass = None;
            result.insert(id, status);
        }
        
        result
    }

    pub async fn hostname_exists(&self, hostname: &str) -> bool {
        let clients = self.clients.read().await;
        clients.values().any(|client| {
            client.hostname.contains(hostname) || 
            client.hostname.replace("[DEV] ", "").split('_').next().unwrap_or("") == hostname
        })
    }

    pub async fn get_hostname_count(&self, hostname: &str) -> u32 {
        let clients = self.clients.read().await;
        clients.values()
            .filter(|client| {
                client.hostname.contains(hostname) || 
                client.hostname.replace("[DEV] ", "").split('_').next().unwrap_or("") == hostname
            })
            .count() as u32
    }

    pub async fn get_client_count(&self) -> usize {
        let clients = self.clients.read().await;
        clients.len()
    }
}
