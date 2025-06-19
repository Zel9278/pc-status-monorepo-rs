# インストールガイド

PC Status Monitor (Rust Monorepo) のインストール手順を説明します。

[English Installation Guide](INSTALL_en.md) | 日本語インストールガイド

## 前提条件

### 必須ソフトウェア
- **Rust**: 1.70以上
- **Cargo**: Rustに付属
- **Node.js**: 16.0以上（フロントエンド用）
- **pnpm**: 推奨パッケージマネージャー

### オプション
- **Git**: ソースコードの取得用
- **nvidia-smi**: GPU情報収集用（NVIDIA GPU使用時）

## インストール手順

### 方法1: リリースからのインストール（推奨）

事前にビルドされたバイナリを使用する最も簡単な方法です。

#### 1. リリースのダウンロード

1. [GitHubリリースページ](https://github.com/your-username/pc-status-monorepo-rs/releases)にアクセス
2. 最新リリースを選択
3. 必要なコンポーネントをダウンロード:

**クライアント（システム情報収集）:**
   - **macOS (M1/M2)**: `pc-status-client-macos-arm64.tar.gz`
   - **Windows 64-bit**: `pc-status-client-windows-x64.zip`
   - **Linux 64-bit**: `pc-status-client-linux-x64.tar.gz`
   - **Linux ARM64**: `pc-status-client-linux-arm64.tar.gz`

**バックエンド（サーバー）:**
   - **macOS (M1/M2)**: `pc-status-backend-macos-arm64.tar.gz`
   - **Windows 64-bit**: `pc-status-backend-windows-x64.zip`
   - **Linux 64-bit**: `pc-status-backend-linux-x64.tar.gz`
   - **Linux ARM64**: `pc-status-backend-linux-arm64.tar.gz`

#### 2. ファイルの展開と配置

**Linux/macOS:**
```bash
# クライアントとバックエンドを展開
tar -xzf pc-status-client-linux-x64.tar.gz
tar -xzf pc-status-backend-linux-x64.tar.gz

# バイナリを適切な場所に配置
sudo mkdir -p /opt/pc-status
sudo cp client /opt/pc-status/  # クライアントから
sudo cp server /opt/pc-status/  # バックエンドから
sudo cp *.env.example /opt/pc-status/
sudo cp *.service /opt/pc-status/  # systemdサービスファイル
sudo chmod +x /opt/pc-status/server /opt/pc-status/client

# シンボリックリンクを作成（オプション）
sudo ln -s /opt/pc-status/server /usr/local/bin/pc-status-server
sudo ln -s /opt/pc-status/client /usr/local/bin/pc-status-client
```

**Windows:**
```powershell
# ZIPファイルを展開
Expand-Archive -Path pc-status-client-windows-x64.zip -DestinationPath C:\pc-status\client
Expand-Archive -Path pc-status-backend-windows-x64.zip -DestinationPath C:\pc-status\server

# バイナリを統合
Copy-Item C:\pc-status\client\client.exe C:\pc-status\
Copy-Item C:\pc-status\server\server.exe C:\pc-status\

# 環境変数PATHに追加（オプション）
$env:PATH += ";C:\pc-status"
```

#### 3. 設定ファイルの作成

```bash
cd /opt/pc-status  # Linux/macOS
# または
cd C:\pc-status    # Windows

# 設定ファイルをコピー
cp server.env.example server.env
cp client.env.example client.env

# 設定ファイルを編集（パスワードなど）
nano server.env  # または任意のエディタ
nano client.env
```

### 方法2: ソースからのビルド

開発者向けまたはカスタマイズが必要な場合の方法です。

#### 1. Rustのインストール

#### Windows
```powershell
# Rust公式インストーラーをダウンロードして実行
# https://rustup.rs/ からrustup-init.exeをダウンロード
rustup-init.exe
```

#### Linux/macOS
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### 2. Node.jsとpnpmのインストール

#### Node.js
公式サイトからLTS版をダウンロードしてインストールしてください：
https://nodejs.org/

#### pnpm
pnpmの詳細なインストール手順については、公式インストールガイドを参照してください：
https://pnpm.io/installation

**クイックインストール（Node.js がインストール済みの場合）:**
```bash
npm install -g pnpm
```

### 3. プロジェクトの取得

```bash
git clone <repository-url>
cd pc-status-monorepo-rs
```

### 4. 依存関係のインストール

#### Rust依存関係
```bash
# プロジェクトルートで実行
cargo build
```

#### フロントエンド依存関係
```bash
cd frontend
pnpm install
cd ..
```

## 設定

### 1. サーバー設定

```bash
cd server
cp .env.example .env
```

`.env`ファイルを編集:
```env
# サーバーポート
PORT=3000

# 認証パスワード（公式サーバーと同じパスワード）
PASS=sIvnjGO4eSftbiYh4aL29wlu9DUpnk3yAAaq2aRpbysEFBSYsh5i850HEvvpOPj7wha7jXIMcnWXyn51PKCPSZEOZgXdWRIXLCkAJnVGrtJXZGr0J9C5YiYCQQ4ZBBFz

# ログレベル
RUST_LOG=info
```

### 2. クライアント設定

```bash
cd client
cp .env.example .env
```

`.env`ファイルを編集:
```env
# サーバーURL（PCSC_URIまたはSERVER_URLのどちらでも可）
PCSC_URI=ws://localhost:3000/server
SERVER_URL=ws://localhost:3000/server

# 認証パスワード（サーバーと同じパスワード）
PASS=sIvnjGO4eSftbiYh4aL29wlu9DUpnk3yAAaq2aRpbysEFBSYsh5i850HEvvpOPj7wha7jXIMcnWXyn51PKCPSZEOZgXdWRIXLCkAJnVGrtJXZGr0J9C5YiYCQQ4ZBBFz

# ホスト名（オプション、指定しない場合はシステムから自動取得）
# HOSTNAME=my-custom-hostname

# 開発モード（true/false）
DEV_MODE=false

# 自動更新設定（restart/terminate/none）
PCSC_UPDATED=none

# ログレベル
RUST_LOG=info
```

## 動作確認

### 1. ビルドテスト
```bash
# プロジェクトルートで実行
cargo check
```

### 2. テスト実行
```bash
cargo test
```

### 3. 各コンポーネントの起動テスト

#### サーバー起動
```bash
cargo run --bin server
```
正常に起動すると以下のようなメッセージが表示されます:
```
Server listening on http://0.0.0.0:3000
```

#### クライアント起動（別ターミナル）
```bash
cargo run --bin client
```

#### フロントエンド起動（別ターミナル）
```bash
cd frontend
pnpm run dev
```
http://localhost:3000 でフロントエンドにアクセスできます。

## トラブルシューティング

### よくある問題

#### 1. Rustのコンパイルエラー
```bash
# Rustツールチェーンを最新に更新
rustup update
```

#### 2. 依存関係の問題
```bash
# Cargoキャッシュをクリア
cargo clean
cargo build
```

#### 3. フロントエンドの依存関係エラー
```bash
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 4. ポート競合エラー
- サーバーのポート（デフォルト3000）が使用中の場合
- `.env`ファイルでPORTを変更してください

#### 5. GPU情報が取得できない
- NVIDIA GPUの場合: `nvidia-smi`コマンドが利用可能か確認
- AMD GPUの場合: 現在未対応

### ログの確認

詳細なログを確認したい場合:
```bash
RUST_LOG=debug cargo run --bin server
RUST_LOG=debug cargo run --bin client
```

## systemdサービスの設定（Linux）

Linuxでサービスとして自動起動させる場合の設定方法です。

### 1. サービスファイルの作成

#### サーバー用サービス

```bash
sudo nano /etc/systemd/system/pc-status-server.service
```

以下の内容を記述:
```ini
[Unit]
Description=PC Status Monitor Server
After=network.target
Wants=network.target

[Service]
Type=simple
User=pc-status
Group=pc-status
WorkingDirectory=/opt/pc-status
ExecStart=/opt/pc-status/server
EnvironmentFile=/opt/pc-status/server.env
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# セキュリティ設定
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/pc-status

[Install]
WantedBy=multi-user.target
```

#### クライアント用サービス

```bash
sudo nano /etc/systemd/system/pc-status-client.service
```

以下の内容を記述:
```ini
[Unit]
Description=PC Status Monitor Client
After=network.target pc-status-server.service
Wants=network.target
Requires=pc-status-server.service

[Service]
Type=simple
User=pc-status
Group=pc-status
WorkingDirectory=/opt/pc-status
ExecStart=/opt/pc-status/client
EnvironmentFile=/opt/pc-status/client.env
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# セキュリティ設定
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/pc-status

[Install]
WantedBy=multi-user.target
```

### 2. 専用ユーザーの作成

```bash
# pc-statusユーザーを作成
sudo useradd -r -s /bin/false -d /opt/pc-status pc-status

# ディレクトリの所有権を変更
sudo chown -R pc-status:pc-status /opt/pc-status
```

### 3. サービスの有効化と起動

```bash
# systemdの設定を再読み込み
sudo systemctl daemon-reload

# サービスを有効化（自動起動設定）
sudo systemctl enable pc-status-server
sudo systemctl enable pc-status-client

# サービスを開始
sudo systemctl start pc-status-server
sudo systemctl start pc-status-client

# サービスの状態確認
sudo systemctl status pc-status-server
sudo systemctl status pc-status-client
```

### 4. サービス管理コマンド

```bash
# サービスの停止
sudo systemctl stop pc-status-server
sudo systemctl stop pc-status-client

# サービスの再起動
sudo systemctl restart pc-status-server
sudo systemctl restart pc-status-client

# ログの確認
sudo journalctl -u pc-status-server -f
sudo journalctl -u pc-status-client -f

# サービスの無効化
sudo systemctl disable pc-status-server
sudo systemctl disable pc-status-client
```

## GitHub Pagesでのフロントエンド公開

フロントエンドをGitHub Pagesで公開する場合の設定方法です。

### 1. GitHub Pages の有効化

1. GitHubリポジトリの **Settings** タブに移動
2. 左サイドバーの **Pages** をクリック
3. **Source** で **GitHub Actions** を選択
4. 設定を保存

### 2. 環境変数の設定（オプション）

カスタムWebSocketサーバーを使用する場合：

1. GitHubリポジトリの **Settings** → **Secrets and variables** → **Actions**
2. **Variables** タブで新しい変数を追加：
   - **Name**: `NEXT_PUBLIC_WS_URL`
   - **Value**: `wss://your-server.com/ws`

### 3. デプロイ

mainブランチにfrontend/配下の変更をプッシュすると、自動的にGitHub Pagesにデプロイされます：

```bash
git add frontend/
git commit -m "Update frontend"
git push origin main
```

### 4. アクセス

デプロイ完了後、以下のURLでアクセスできます：
```
https://your-username.github.io/pc-status-monorepo-rs/
```

## 次のステップ

インストールが完了したら、[README.md](README.md)の使用方法セクションを参照してください。

## サポート

問題が発生した場合は、以下を確認してください:
1. 前提条件のソフトウェアが正しくインストールされているか
2. 環境変数が正しく設定されているか
3. ファイアウォールやセキュリティソフトがポートをブロックしていないか
