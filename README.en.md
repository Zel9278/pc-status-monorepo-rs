# PC Status Monitor (Rust Monorepo)

A PC Status Monitor project ported from TypeScript Socket.IO to Rust fastwebsockets in a monorepo structure.

English README | [日本語 README](README.md)

## Structure

This monorepo consists of the following components:

- **server**: WebSocket server (using fastwebsockets)
- **client**: System information collection client
- **shared**: Common type definitions and message definitions
- **frontend**: Next.js frontend (WebSocket compatible)

## Features

### Server Features
- Real-time communication via WebSocket connections
- Password authentication
- Multiple client management
- Duplicate hostname handling (development mode support)
- Historical data management (up to 10 entries)
- Periodic data broadcasting
- CORS support
- Secure TLS communication using rustls

### Client Features
- System information collection (CPU, memory, disk, GPU, etc.)
- Data transmission to server via WebSocket
- Auto-reconnection functionality
- GPU information collection (NVIDIA GPU support)
- OS compatibility check
- Environment variable configuration
- Custom hostname setting
- Development mode support (allows duplicate hostnames)
- Secure TLS communication using rustls

## Installation

For detailed installation instructions, see the [Installation Guide](INSTALL_en.md).

### Quick Start

1. Prerequisites: Rust 1.70+, Node.js, pnpm
2. Clone repository: `git clone <repository-url>`
3. Install dependencies: `cargo build && cd frontend && pnpm install`
4. Copy config files: `cp server/.env.example server/.env && cp client/.env.example client/.env`

## Usage

### Starting the Server

```bash
cargo run --bin server
```

The server provides the following endpoints:
- `http://localhost:3000/` - Root endpoint
- `ws://localhost:3000/ws` - WebSocket connection
- `ws://localhost:3000/server` - Server WebSocket connection

### Starting the Client

```bash
cargo run --bin client
```

### Starting the Frontend

#### Local Development
```bash
cd frontend
pnpm install
pnpm run dev
```

The frontend starts at http://localhost:3000 (Next.js default port).

#### GitHub Pages
The frontend is automatically deployed to GitHub Pages:
- **URL**: https://your-username.github.io/pc-status-monorepo-rs/
- **Auto-deploy**: On changes to frontend/ in main branch
- **WebSocket connection**: Connects to official server (wss://pcss.eov2.com/ws) by default

## API Specification

### WebSocket Messages

#### Client → Server

**Connection (Hi)**
```json
{
  "type": "Hi",
  "data": {
    "data": {StatusData},
    "pass": "password"
  }
}
```

**Data Sync (Sync)**
```json
{
  "type": "Sync",
  "data": {StatusData}
}
```

#### Server → Client

**Status Update**
```json
{
  "type": "Status",
  "data": {ClientData}
}
```

**Notification**
```json
{
  "type": "Toast",
  "data": {
    "message": "Message",
    "color": "#0508",
    "toast_time": 5000
  }
}
```

## Development

### Running Tests

```bash
cargo test
```

### Setting Log Level

You can set the log level using the `RUST_LOG` environment variable:
```bash
RUST_LOG=debug cargo run --bin server
```

### CI/CD

GitHub Actions automatically builds for the following platforms:

- **Apple ARM64** (aarch64-apple-darwin) - macOS M1/M2
- **Windows x64** (x86_64-pc-windows-msvc) - Windows 64-bit
- **Linux x64** (x86_64-unknown-linux-musl) - Linux 64-bit
- **Linux ARM64** (aarch64-unknown-linux-musl) - Linux ARM 64-bit

When you push a release tag (`v*`), binaries for all platforms are automatically built and attached to the GitHub release.

## Changes from Original TypeScript Project

### Backend
1. **WebSocket Library**: Socket.IO → fastwebsockets
2. **Language**: TypeScript → Rust
3. **Architecture**: Adopted monorepo structure
4. **Type Safety**: Enhanced with Rust's type system
5. **Performance**: Improved with Rust
6. **TLS Library**: OpenSSL → rustls (pure Rust implementation)

### Frontend
1. **WebSocket Communication**: Socket.IO Client → Native WebSocket API
2. **Connection Management**: Custom WebSocket hook implementation
3. **Auto-reconnection**: Automatic retry on connection failure
4. **Error Handling**: Proper display on connection errors

## License

Maybe MIT License?
