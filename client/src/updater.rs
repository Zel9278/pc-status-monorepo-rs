use std::{env, path::PathBuf};

const GIT_DESCRIBE: &str = env!("GIT_DESCRIBE");

fn restart_program(bin_install_path: PathBuf) {
    use std::process::{exit, Command};

    {
        Command::new(bin_install_path)
            .spawn()
            .expect("Failed to restart the program");
    }

    exit(0);
}

pub fn update() -> Result<(), Box<dyn std::error::Error>> {
    // 自動更新機能は現在無効化（必要に応じて有効化）
    // 元のコードではGitHubからの自動更新を行っていたが、
    // 新しいプロジェクトでは手動更新を推奨
    
    println!("Current version: {}", GIT_DESCRIBE);
    println!("Auto-update is disabled. Please update manually if needed.");
    
    Ok(())
}

pub fn get_version() -> &'static str {
    GIT_DESCRIBE
}
