use std::io;

fn main() -> io::Result<()> {
    // Git情報を取得してビルド時に埋め込む
    match get_git_describe_result() {
        Ok(result) => println!("cargo::rustc-env=GIT_DESCRIBE={result}"),
        Err(_) => {
            // Gitリポジトリでない場合やエラーの場合はデフォルト値を設定
            println!("cargo::rustc-env=GIT_DESCRIBE=unknown");
        }
    }

    Ok(())
}

fn get_git_describe_result() -> Result<String, Box<dyn std::error::Error>> {
    use std::process::Command;
    
    let output = Command::new("git")
        .args(&["describe", "--tags", "--always", "--dirty=-dirty"])
        .output()?;
    
    if output.status.success() {
        let result = String::from_utf8(output.stdout)?;
        Ok(result.trim().to_string())
    } else {
        Err("Git command failed".into())
    }
}
