# PC Status Monitor (Rust Monorepo)

TypeScriptのSocket.IOベースのPC Status MonitorをRustのfastwebsocketsに移植したmonorepoプロジェクトです。

[English README](README.en.md) | 日本語 README

## 構成

このmonorepoは以下のコンポーネントで構成されています：

- **server**: WebSocketサーバー（fastwebsockets使用）
- **client**: システム情報収集クライアント
- **shared**: 共通の型定義とメッセージ定義
- **frontend**: Next.jsフロントエンド（WebSocket対応）

## 機能

### サーバー機能
- WebSocket接続によるリアルタイム通信
- パスワード認証
- 複数クライアントの管理
- 重複ホスト名の処理（開発モード対応）
- 履歴データの管理（最大10件）
- 定期的なデータブロードキャスト
- CORS対応
- rustls使用による安全なTLS通信

### クライアント機能
- システム情報の収集（CPU、メモリ、ディスク、GPU等）
- WebSocket経由でのサーバーへのデータ送信
- 自動再接続機能
- GPU情報の収集（NVIDIA GPU対応）
- OS互換性チェック
- 環境変数による設定
- カスタムホスト名設定
- 開発モード対応（重複ホスト名許可）
- rustls使用による安全なTLS通信

## インストール

詳細なインストール手順については、[インストールガイド](INSTALL.md)を参照してください。

### クイックスタート

1. 前提条件: Rust 1.70以上、Node.js、pnpm
2. リポジトリをクローン: `git clone <repository-url>`
3. 依存関係をインストール: `cargo build && cd frontend && pnpm install`
4. 設定ファイルをコピー: `cp server/.env.example server/.env && cp client/.env.example client/.env`

## 使用方法

### サーバーの起動

```bash
cargo run --bin server
```

サーバーは以下のエンドポイントを提供します：
- `http://localhost:3000/` - ルートエンドポイント
- `ws://localhost:3000/ws` - WebSocket接続
- `ws://localhost:3000/server` - サーバー用WebSocket接続

### クライアントの起動

```bash
cargo run --bin client
```

### フロントエンドの起動

#### ローカル開発
```bash
cd frontend
pnpm install
pnpm run dev
```

フロントエンドは http://localhost:3000 で起動します（Next.jsのデフォルトポート）。

#### GitHub Pages
フロントエンドはGitHub Pagesで自動デプロイされます：
- **URL**: https://your-username.github.io/pc-status-monorepo-rs/
- **自動デプロイ**: mainブランチのfrontend/配下の変更時
- **WebSocket接続**: デフォルトで公式サーバー（wss://pcss.eov2.com/ws）に接続

## API仕様

### WebSocketメッセージ

#### クライアント → サーバー

**接続時（Hi）**
```json
{
  "type": "Hi",
  "data": {
    "data": {StatusData},
    "pass": "password"
  }
}
```

**データ同期（Sync）**
```json
{
  "type": "Sync",
  "data": {StatusData}
}
```

#### サーバー → クライアント

**ステータス更新**
```json
{
  "type": "Status",
  "data": {ClientData}
}
```

**通知**
```json
{
  "type": "Toast",
  "data": {
    "message": "メッセージ",
    "color": "#0508",
    "toast_time": 5000
  }
}
```

## 開発

### テストの実行

```bash
cargo test
```

### ログレベルの設定

環境変数`RUST_LOG`でログレベルを設定できます：
```bash
RUST_LOG=debug cargo run --bin server
```

### CI/CD

GitHub Actionsを使用して以下のプラットフォーム向けに自動ビルドを行います：

- **Apple ARM64** (aarch64-apple-darwin) - macOS M1/M2
- **Windows x64** (x86_64-pc-windows-msvc) - Windows 64-bit
- **Linux x64** (x86_64-unknown-linux-musl) - Linux 64-bit
- **Linux ARM64** (aarch64-unknown-linux-musl) - Linux ARM 64-bit

リリースタグ（`v*`）をプッシュすると、クライアントとバックエンドが別々にビルドされ、GitHubリリースに添付されます：

- **クライアント**: `pc-status-client-{platform}.tar.gz/.zip`
- **バックエンド**: `pc-status-backend-{platform}.tar.gz/.zip`

## 元のTypeScriptプロジェクトからの変更点

### バックエンド
1. **WebSocketライブラリ**: Socket.IO → fastwebsockets
2. **言語**: TypeScript → Rust
3. **アーキテクチャ**: monorepo構造の採用
4. **型安全性**: Rustの型システムによる強化
5. **パフォーマンス**: Rustによる高速化
6. **TLSライブラリ**: OpenSSL → rustls（純粋Rust実装）

### フロントエンド
1. **WebSocket通信**: Socket.IO Client → Native WebSocket API
2. **接続管理**: カスタムWebSocketフック実装
3. **自動再接続**: 接続失敗時の自動リトライ機能
4. **エラーハンドリング**: 接続エラー時の適切な表示

## ライセンス

MIT License？
