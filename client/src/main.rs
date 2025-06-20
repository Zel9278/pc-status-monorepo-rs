#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod gpu;
mod system_info;
mod sysinfo_instance;
mod uptime_formatter;
mod updater;

use anyhow::Result;
use dotenvy::dotenv;
use futures_util::{SinkExt, StreamExt};
use pc_status_shared::{ClientMessage, ServerMessage};
use std::{env, path::Path, process, time::Duration};
use sysinfo::IS_SUPPORTED_SYSTEM;
use tokio::time::sleep;
use tokio_tungstenite::{connect_async, tungstenite::Message};
use tracing::{debug, error, info, warn};
use tracing_subscriber;

use crate::system_info::SystemInfoCollector;

#[tokio::main]
async fn main() -> Result<()> {
    // rustlsのデフォルトCryptoProviderを初期化
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("Failed to install rustls crypto provider");

    // .envファイルの存在確認と読み込み
    let env_exists = Path::new(".env").exists();
    if env_exists {
        dotenv().expect(".env file not found");
    }

    // サポートされているOSかチェック
    if !IS_SUPPORTED_SYSTEM {
        println!("This OS isn't supported (yet?).");
        process::exit(95);
    }

    // パスワード環境変数のチェック
    if env::var("PASS").is_err() {
        println!("The environment variable Password (PASS) is not specified.");
        process::exit(95);
    }

    // ログ設定
    tracing_subscriber::fmt::init();

    // 自動更新チェック
    let _ = updater::update();

    println!("This OS is supported!");
    let server_url = env::var("PCSC_URI")
        .or_else(|_| env::var("SERVER_URL"))
        .unwrap_or_else(|_| "ws://localhost:3001/server".to_string());

    let password = env::var("PASS")
        .expect("PASS environment variable must be set");

    let dev_mode = env::var("DEV_MODE")
        .unwrap_or_else(|_| "false".to_string())
        .parse::<bool>()
        .unwrap_or(false);

    info!("Starting PC Status Client");
    info!("Server URL: {}", server_url);
    info!("Dev mode: {}", dev_mode);

    let mut system_collector = SystemInfoCollector::new();

    loop {
        match connect_to_server(&server_url, &password, dev_mode, &mut system_collector).await {
            Ok(_) => {
                info!("Connection closed normally");
            }
            Err(e) => {
                error!("Connection error: {}", e);
            }
        }

        info!("Reconnecting in 5 seconds...");
        sleep(Duration::from_secs(5)).await;
    }
}

async fn connect_to_server(
    server_url: &str,
    password: &str,
    dev_mode: bool,
    system_collector: &mut SystemInfoCollector,
) -> Result<()> {
    info!("Connecting to server: {}", server_url);
    
    let (ws_stream, _) = connect_async(server_url).await?;
    let (mut write, mut read) = ws_stream.split();

    // 初回接続時にシステム情報を送信
    let mut status_data = system_collector.collect_system_info().await?;
    status_data.dev = Some(dev_mode);
    
    let hi_message = ClientMessage::Hi {
        data: status_data,
        pass: Some(password.to_string()),
    };
    
    let message_json = hi_message.to_json()?;
    write.send(Message::Text(message_json.into())).await?;
    info!("Sent initial system info");

    // 定期的にシステム情報を送信するタスク
    let mut write_for_sync = write;
    let password_clone = password.to_string();
    let sync_task = tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(1));
        let mut collector = SystemInfoCollector::new();
        let mut send_count = 0u64;
        let start_time = std::time::Instant::now();

        loop {
            interval.tick().await;

            match collector.collect_system_info().await {
                Ok(mut status_data) => {
                    status_data.dev = Some(dev_mode);
                    status_data.pass = Some(password_clone.clone());

                    let sync_message = ClientMessage::Sync(status_data);
                    if let Ok(json) = sync_message.to_json() {
                        if write_for_sync.send(Message::Text(json.into())).await.is_ok() {
                            send_count += 1;

                            // 10秒ごとに統計情報をログ出力
                            if send_count % 10 == 0 {
                                let elapsed = start_time.elapsed();
                                let avg_interval = elapsed.as_millis() as f64 / send_count as f64;
                                info!("Client send stats: {} messages in {:.2}s (avg: {:.1}ms interval)",
                                      send_count, elapsed.as_secs_f64(), avg_interval);
                            }
                        } else {
                            break;
                        }
                    }
                }
                Err(e) => {
                    error!("Failed to collect system info: {}", e);
                }
            }
        }
    });

    // サーバーからのメッセージを処理
    while let Some(msg) = read.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                debug!("Received message: {}", text);
                
                match ServerMessage::from_json(&text) {
                    Ok(ServerMessage::Hi(greeting)) => {
                        info!("Server greeting: {}", greeting);
                    }
                    Ok(ServerMessage::Close) => {
                        warn!("Server requested connection close");
                        break;
                    }
                    Ok(ServerMessage::Sync(sync_msg)) => {
                        debug!("Sync message: {}", sync_msg);
                    }
                    Ok(_) => {
                        debug!("Received other message type");
                    }
                    Err(e) => {
                        warn!("Failed to parse server message: {}", e);
                    }
                }
            }
            Ok(Message::Close(_)) => {
                info!("Server closed connection");
                break;
            }
            Err(e) => {
                error!("WebSocket error: {}", e);
                break;
            }
            _ => {}
        }
    }

    sync_task.abort();
    Ok(())
}
