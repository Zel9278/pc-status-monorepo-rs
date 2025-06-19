use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuData {
    pub cpu: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cpu {
    pub model: String,
    pub cpus: Vec<CpuData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ram {
    pub free: u64,
    pub total: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Swap {
    pub free: u64,
    pub total: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Storage {
    pub name: Option<String>,
    pub free: u64,
    pub total: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuMemory {
    pub free: u64,
    pub total: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Gpu {
    pub name: String,
    pub usage: f64,
    pub memory: GpuMemory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkData {
    pub name: String,
    pub received: u64,
    pub transmitted: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoriesData {
    pub cpu: Cpu,
    pub ram: Ram,
    pub swap: Swap,
    pub storages: Vec<Storage>,
    pub gpu: Option<Gpu>,
    pub uptime: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatusData {
    pub pass: Option<String>,
    pub dev: Option<bool>,
    #[serde(rename = "_os")]
    pub os: String,
    pub hostname: String,
    pub version: String,
    pub cpu: Cpu,
    pub ram: Ram,
    pub swap: Swap,
    pub storages: Vec<Storage>,
    pub uptime: u64,
    pub loadavg: [f64; 3],
    pub gpu: Option<Gpu>,
    pub index: u32,
    pub histories: Vec<HistoriesData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToastData {
    pub message: String,
    pub color: String,
    pub toast_time: u32,
}

pub type ClientData = HashMap<String, StatusData>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientInfo {
    pub id: String,
    pub status: StatusData,
    pub last_seen: chrono::DateTime<chrono::Utc>,
}
