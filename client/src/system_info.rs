use anyhow::Result;
use cfg_if::cfg_if;
use itertools::Itertools;
use pc_status_shared::{StatusData, Cpu, CpuData, Ram, Swap, Storage};
use std::env;
use sysinfo::System;

use crate::{gpu, sysinfo_instance::SysinfoInstance, updater};

pub struct SystemInfoCollector {
    sysinfo: SysinfoInstance,
}

impl SystemInfoCollector {
    pub fn new() -> Self {
        Self {
            sysinfo: SysinfoInstance::new(),
        }
    }

    pub fn refresh(&mut self) {
        self.sysinfo.refresh();
    }

    pub async fn collect_system_info(&mut self) -> Result<StatusData> {
        // システム情報を更新
        self.sysinfo.refresh();

        let SysinfoInstance { system, disks } = &self.sysinfo;

        // OS情報
        let os_name = System::name().unwrap_or_else(|| "unknown".to_string());
        let os_version = System::os_version()
            .or_else(|| System::kernel_version())
            .unwrap_or_else(|| "unknown".to_string());

        // ホスト名（環境変数から取得、なければシステムから）
        let hostname = env::var("HOSTNAME")
            .unwrap_or_else(|_| System::host_name().unwrap_or_else(|| "unknown".to_string()));

        // バージョン情報
        let version = format!("Rust client {}", updater::get_version());

        // CPU情報
        let cpu_name = if let Some(first_cpu) = system.cpus().first() {
            first_cpu.brand().to_string()
        } else {
            "Unknown CPU".to_string()
        };

        let cpus: Vec<CpuData> = system.cpus()
            .iter()
            .map(|cpu| CpuData {
                cpu: cpu.cpu_usage() as f64,
            })
            .collect();

        let cpu = Cpu {
            model: cpu_name,
            cpus,
        };

        // メモリ情報
        let ram = Ram {
            free: system.available_memory(),
            total: system.total_memory(),
        };

        // スワップ情報
        let swap = Swap {
            free: system.free_swap(),
            total: system.total_swap(),
        };

        // ロードアベレージ（Windowsでは利用不可）
        cfg_if! {
            if #[cfg(target_os = "windows")] {
                let loadavg = [0.0, 0.0, 0.0];
            } else {
                let load_average = System::load_average();
                let loadavg = [load_average.one, load_average.five, load_average.fifteen];
            }
        }

        // アップタイム
        let uptime = System::uptime();

        // ストレージ情報
        let storages: Vec<Storage> = disks
            .iter()
            .filter(|disk| disk.total_space() != 0)
            .map(|disk| Storage {
                name: Some(disk.name().to_string_lossy().to_string()),
                free: disk.available_space(),
                total: disk.total_space(),
            })
            .unique()
            .collect();

        // GPU情報
        let gpu = gpu::get_info();

        Ok(StatusData {
            pass: None, // パスワードは後で設定
            dev: None,  // 開発モードは後で設定
            os: format!("{} {}", os_name, os_version),
            hostname,
            version,
            cpu,
            ram,
            swap,
            storages,
            uptime,
            loadavg,
            gpu,
            index: 0,
            histories: vec![],
        })
    }


}
