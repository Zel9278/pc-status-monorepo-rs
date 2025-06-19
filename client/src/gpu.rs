use cfg_if::cfg_if;
use regex::Regex;
use pc_status_shared::{Gpu, GpuMemory};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::process::Command;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn get_info() -> Option<Gpu> {
    let mut binding = Command::new("nvidia-smi");
    let command = binding.args([
        "--format=csv",
        "--query-gpu=name,utilization.gpu,memory.free,memory.total",
    ]);

    cfg_if! {
        if #[cfg(target_os = "windows")] {
            command.creation_flags(CREATE_NO_WINDOW);
        }
    };

    let output = command.output();
    if output.is_err() {
        return None;
    } else {
        let res = output.expect("process error");

        let split_seperator = Regex::new(r"\r\n|\n").expect("Invalid regex");
        let split_binding = String::from_utf8(res.stdout).unwrap();
        let splited: Vec<_> = split_seperator.split(&split_binding).into_iter().collect();

        if splited.len() < 2 {
            return None;
        }

        let replace_seperator = Regex::new(r" %| MiB| GiB|\r").expect("Invalid regex");
        let split2_seperator = Regex::new(r", ").expect("Invalid regex");
        let replaced = replace_seperator.replace_all(
            splited.get(1).unwrap_or(&""),
            ""
        );
        let splited2: Vec<_> = split2_seperator.split(&replaced).into_iter().collect();

        if splited2.len() < 4 {
            return None;
        }

        let usage: f64 = match splited2[1] {
            "[N/A]" => 0.0,
            _ => splited2[1].parse::<f64>().unwrap_or(0.0),
        };

        let free_memory = splited2[2].parse::<u64>().unwrap_or(0);
        let total_memory = splited2[3].parse::<u64>().unwrap_or(0);

        let result = Some(Gpu {
            name: splited2[0].to_string(),
            usage,
            memory: GpuMemory {
                free: free_memory * 1024 * 1024, // MiBをバイトに変換
                total: total_memory * 1024 * 1024, // MiBをバイトに変換
            },
        });

        return result;
    };
}
