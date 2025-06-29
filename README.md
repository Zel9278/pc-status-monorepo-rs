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
- **複数GPU対応**（Intel/AMD/NVIDIA GPU統一監視）
- OS互換性チェック
- 環境変数による設定
- カスタムホスト名設定
- 開発モード対応（重複ホスト名許可）
- rustls使用による安全なTLS通信

### GPU監視機能

このプロジェクトは、Intel、AMD、NVIDIAのGPUを統一的に監視できる包括的なGPU監視システムを提供します。

#### 対応GPU
- **Intel GPU**: 統合グラフィックス（UHD Graphics、Iris等）
- **AMD GPU**: Radeon シリーズ ⚠️ **動作未確認**
- **NVIDIA GPU**: GeForce、RTX、GTX シリーズ ✅ **動作確認済み**

#### プラットフォーム別対応

**Windows** ✅ **対応済み**
- **Intel**: WMI (Windows Management Instrumentation) 経由で検出 ✅ **動作確認済み**
- **AMD**: WMI (Windows Management Instrumentation) 経由で検出 ⚠️ **動作未確認**
- **NVIDIA**: nvidia-smi コマンド経由で検出 ✅ **動作確認済み**
- **動的監視**: 使用率とメモリ使用量のリアルタイム更新

**Linux** ⚠️ **実装済み・動作未確認**
- **Intel**: lspci + intel_gpu_top + /sys/class/drm/ 経由で検出 ⚠️ **動作未確認**
- **AMD**: lspci + radeontop + /sys/class/drm/ 経由で検出 ⚠️ **動作未確認**
- **NVIDIA**: nvidia-smi コマンド経由で検出 ✅ **動作確認済み**

**macOS** ❌ **非対応**

#### 取得情報
- **GPU使用率**: リアルタイムの使用率（%）
- **メモリ使用量**: 使用中/総容量/利用可能容量
- **GPU名**: 正確なGPU名の識別
- **複数GPU**: 複数のGPUを同時に監視・表示

#### Linux環境での推奨パッケージ

最適な動作のために、以下のパッケージのインストールを推奨します：

```bash
# Ubuntu/Debian
sudo apt install pciutils intel-gpu-tools radeontop

# Fedora/RHEL
sudo dnf install pciutils intel-gpu-tools radeontop

# Arch Linux
sudo pacman -S pciutils intel-gpu-tools radeontop
```

**注意**: これらのパッケージがなくても基本的な検出は動作しますが、より詳細な情報取得のために推奨されます。

#### 動作確認状況

⚠️ **重要**: 以下のGPU・プラットフォーム組み合わせは実装済みですが、実際の動作確認が完了していません：

- **AMD GPU**: すべてのプラットフォーム（Windows/Linux）
- **Linux環境**: Intel GPU、AMD GPU

これらの環境での動作報告や問題報告をお待ちしています。Issue報告やPull Requestを歓迎します。

**動作確認済み環境**:
- Windows + Intel GPU（統合グラフィックス）
- Windows/Linux + NVIDIA GPU

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
- `http://localhost:3000/` - ルートエンドポイント（フロントエンド配信）
- `ws://localhost:3000/ws` - WebSocket接続
- `ws://localhost:3000/server` - サーバー用WebSocket接続

#### フロントエンド統合配信

サーバーは自動的にフロントエンドの静的ファイルを配信します。以下の優先順位でディレクトリを検索します：

1. `./frontend` - バイナリと同じディレクトリ
2. `./out` - バイナリと同じディレクトリ
3. `./www` - バイナリと同じディレクトリ
4. `./static` - バイナリと同じディレクトリ
5. `./frontend/out` - 開発時用

**本番環境での使用例:**
```bash
# フロントエンドをビルド
cd frontend
pnpm run export

# ビルド成果物をサーバーバイナリと同じ場所にコピー
cp -r out /path/to/server/frontend

# サーバー起動（フロントエンドも自動配信）
/path/to/server/server
```

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
- **URL**: https://pc-status.net/
- **自動デプロイ**: mainブランチのfrontend/配下の変更時（nextjs.ymlワークフロー）
- **WebSocket接続**: 公式サーバー（wss://www.pc-status.net/server）に接続

#### 環境変数設定
フロントエンドのWebSocket接続先を変更するには：

1. **開発環境**: `frontend/.env.local`ファイルを作成
```bash
# カスタムWebSocketサーバーURL（フロントエンド用は/serverエンドポイント）
NEXT_PUBLIC_WS_URL=ws://your-server-ip:port/server
```

2. **本番環境**: `frontend/.env`ファイルを編集
```bash
# 本番環境用のWebSocketサーバーURL（フロントエンド用は/serverエンドポイント）
NEXT_PUBLIC_WS_URL=wss://www.pc-status.net/server
```

**重要**:
- **フロントエンド**: `/server` エンドポイントに接続（PC情報を受信）
- **クライアント**: `/server` エンドポイントに接続（PC情報を送信）
- `/ws` エンドポイントは将来の拡張用

#### トラブルシューティング

**WebSocket接続エラーが発生する場合:**

1. **サーバーが起動しているか確認**
```bash
cargo run --bin server
```

2. **ポート番号を確認**
- デフォルト: 3000番ポート
- 環境変数: `PORT=3000`

3. **ファイアウォール設定**
- ポート3000番が開放されているか確認
- Windows Defender/ウイルス対策ソフトの設定確認

4. **IPアドレスの確認**
```bash
# Windows
ipconfig

# Linux/macOS
ifconfig
```

5. **接続テスト**
```bash
# curlでHTTPエンドポイントをテスト
curl http://localhost:3000

# WebSocketテスト（ブラウザ開発者ツールで）
new WebSocket('ws://localhost:3000/server')
```

6. **ログレベルの設定**
```bash
# デバッグログを有効にしてサーバー起動
RUST_LOG=debug cargo run --bin server

# クライアントもデバッグログで起動
RUST_LOG=debug cargo run --bin client
```

7. **データフローの確認**
- クライアント → サーバー: PC情報送信
- サーバー → フロントエンド: ブロードキャスト（1秒間隔）
- フロントエンド: リアルタイム表示

#### 開発フロー

**フロントエンド単体テスト:**
```bash
cd frontend
pnpm run export                    # 静的ファイル生成
pnpm dlx serve -p 3000 out        # 静的サーバー起動
```

**統合テスト（推奨）:**
```bash
# ターミナル1: サーバー起動
cargo run --bin server

# ターミナル2: クライアント起動
cargo run --bin client

# ターミナル3: フロントエンド配信
cd frontend
pnpm run export
pnpm dlx serve -p 8080 out
```

**開発時（ホットリロード）:**
```bash
cd frontend
pnpm dev                          # 開発サーバー起動
```

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

GitHub Actionsを使用して以下の自動化を行います：

#### ワークフロー

1. **build.yml** - Rustバイナリのビルドとリリース
   - 4つのプラットフォーム向けビルド
   - クライアントとバックエンドを分離
   - リリースタグ時の自動リリース作成

2. **frontend.yml** - フロントエンドのテストとリンティング
   - pnpmを使用した依存関係管理
   - ESLintとTypeScriptチェック

3. **nextjs.yml** - GitHub Pagesへの自動デプロイ
   - mainブランチのfrontend/変更時にトリガー
   - 静的サイト生成とデプロイ

#### ビルドターゲット

- **Apple ARM64** (aarch64-apple-darwin) - macOS M1/M2
- **Windows x64** (x86_64-pc-windows-msvc) - Windows 64-bit
- **Linux x64** (x86_64-unknown-linux-musl) - Linux 64-bit
- **Linux ARM64** (aarch64-unknown-linux-musl) - Linux ARM 64-bit

#### リリース成果物

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
7. **HTTPルーティング**: Axum 0.8対応（nest → fallback_service）
8. **OS判別**: フィールド名統一（os → _os）とアイコン表示修正
9. **GPU表示**: 二重単位変換を修正（PB表記 → 正常なGB表記）
10. **Uptime表示**: 生秒数から読みやすい形式に修正（例: "1d 2h 30m 45s"）
11. **グラフ最適化**: Chart.js廃止、Canvas独自描画でバンドルサイズ67KB削減、レスポンシブ対応
12. **Focus最適化**: 全PC分のFocus事前生成を廃止、動的表示でメモリ使用量削減
13. **About画面更新**: モノレポ構成に合わせた情報表示、技術スタック明記
14. **複数GPU対応**: Intel/AMD/NVIDIA GPU統一監視、Windows（WMI）/Linux（lspci+sysfs）対応
15. **動的GPU監視**: リアルタイム使用率・メモリ使用量更新、複数GPU同時表示

### フロントエンド
1. **WebSocket通信**: Socket.IO Client → Native WebSocket API
2. **接続管理**: カスタムWebSocketフック実装
3. **自動再接続**: 接続失敗時の自動リトライ機能
4. **エラーハンドリング**: 接続エラー時の適切な表示

## ライセンス

MIT License？
