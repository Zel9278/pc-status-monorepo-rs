pub mod types;
pub mod messages;

pub use types::*;
pub use messages::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_status_data_serialization() {
        let status = StatusData {
            pass: Some("test".to_string()),
            dev: Some(true),
            os: "Windows".to_string(),
            hostname: "test-pc".to_string(),
            version: "1.0.0".to_string(),
            cpu: Cpu {
                model: "Intel Core i7".to_string(),
                cpus: vec![CpuData { cpu: 50.0 }],
            },
            ram: Ram { free: 8000, total: 16000 },
            swap: Swap { free: 1000, total: 2000 },
            storages: vec![Storage {
                name: Some("C:".to_string()),
                free: 100000,
                total: 500000,
            }],
            uptime: 3600,
            loadavg: [1.0, 1.5, 2.0],
            gpu: None,
            index: 0,
            histories: vec![],
        };

        let json = serde_json::to_string(&status).unwrap();
        let deserialized: StatusData = serde_json::from_str(&json).unwrap();

        assert_eq!(status.hostname, deserialized.hostname);
        assert_eq!(status.cpu.model, deserialized.cpu.model);
    }

    #[test]
    fn test_client_message_serialization() {
        let message = ClientMessage::Hi {
            data: StatusData {
                pass: Some("test".to_string()),
                dev: Some(false),
                os: "Linux".to_string(),
                hostname: "linux-pc".to_string(),
                version: "1.0.0".to_string(),
                cpu: Cpu {
                    model: "AMD Ryzen".to_string(),
                    cpus: vec![],
                },
                ram: Ram { free: 4000, total: 8000 },
                swap: Swap { free: 0, total: 0 },
                storages: vec![],
                uptime: 7200,
                loadavg: [0.5, 0.7, 0.9],
                gpu: None,
                index: 0,
                histories: vec![],
            },
            pass: Some("password".to_string()),
        };

        let json = message.to_json().unwrap();
        let deserialized = ClientMessage::from_json(&json).unwrap();

        match deserialized {
            ClientMessage::Hi { data, pass } => {
                assert_eq!(data.hostname, "linux-pc");
                assert_eq!(pass, Some("password".to_string()));
            }
            _ => panic!("Wrong message type"),
        }
    }

    #[test]
    fn test_server_message_serialization() {
        let toast = ToastData {
            message: "Test message".to_string(),
            color: "#ff0000".to_string(),
            toast_time: 3000,
        };

        let message = ServerMessage::Toast(toast);
        let json = message.to_json().unwrap();
        let deserialized = ServerMessage::from_json(&json).unwrap();

        match deserialized {
            ServerMessage::Toast(toast_data) => {
                assert_eq!(toast_data.message, "Test message");
                assert_eq!(toast_data.color, "#ff0000");
                assert_eq!(toast_data.toast_time, 3000);
            }
            _ => panic!("Wrong message type"),
        }
    }
}
