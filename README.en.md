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
- `http://localhost:3000/` - Root endpoint (frontend serving)
- `ws://localhost:3000/ws` - WebSocket connection
- `ws://localhost:3000/server` - Server WebSocket connection

#### Integrated Frontend Serving

The server automatically serves frontend static files. It searches for directories in the following priority order:

1. `./frontend` - Same directory as binary
2. `./out` - Same directory as binary
3. `./www` - Same directory as binary
4. `./static` - Same directory as binary
5. `./frontend/out` - For development

**Production usage example:**
```bash
# Build frontend
cd frontend
pnpm run export

# Copy build artifacts to server binary location
cp -r out /path/to/server/frontend

# Start server (automatically serves frontend)
/path/to/server/server
```

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
- **Auto-deploy**: On changes to frontend/ in main branch (nextjs.yml workflow)
- **WebSocket connection**: Connects to official server (wss://pcss.eov2.com/ws) by default

#### Environment Variables
To change the frontend WebSocket connection target:

1. **Development**: Create `frontend/.env.local` file
```bash
# Custom WebSocket server URL
NEXT_PUBLIC_WS_URL=ws://your-server-ip:port/ws
```

2. **Production**: Edit `frontend/.env` file
```bash
# WebSocket server URL for GitHub Pages
NEXT_PUBLIC_WS_URL=wss://your-server.com/ws
```

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

GitHub Actions provides the following automation:

#### Workflows

1. **build.yml** - Rust binary builds and releases
   - Multi-platform builds for 4 targets
   - Separate client and backend artifacts
   - Automatic release creation on tags

2. **frontend.yml** - Frontend testing and linting
   - pnpm dependency management
   - ESLint and TypeScript checks

3. **nextjs.yml** - Automatic GitHub Pages deployment
   - Triggered on frontend/ changes in main branch
   - Static site generation and deployment

#### Build Targets

- **Apple ARM64** (aarch64-apple-darwin) - macOS M1/M2
- **Windows x64** (x86_64-pc-windows-msvc) - Windows 64-bit
- **Linux x64** (x86_64-unknown-linux-musl) - Linux 64-bit
- **Linux ARM64** (aarch64-unknown-linux-musl) - Linux ARM 64-bit

#### Release Artifacts

When you push a release tag (`v*`), client and backend are built separately and attached to the GitHub release:

- **Client**: `pc-status-client-{platform}.tar.gz/.zip`
- **Backend**: `pc-status-backend-{platform}.tar.gz/.zip`

## Changes from Original TypeScript Project

### Backend
1. **WebSocket Library**: Socket.IO → fastwebsockets
2. **Language**: TypeScript → Rust
3. **Architecture**: Adopted monorepo structure
4. **Type Safety**: Enhanced with Rust's type system
5. **Performance**: Improved with Rust
6. **TLS Library**: OpenSSL → rustls (pure Rust implementation)
7. **HTTP Routing**: Axum 0.8 compatibility (nest → fallback_service)
8. **OS Detection**: Field name unification (os → _os) and icon display fix
9. **GPU Display**: Fixed double unit conversion (PB notation → proper GB notation)
10. **Uptime Display**: Fixed raw seconds to readable format (e.g., "1d 2h 30m 45s")
11. **Chart Optimization**: Replaced Chart.js with custom Canvas rendering, reduced bundle size by 67KB, responsive design
12. **Focus Optimization**: Eliminated pre-generation of all PC Focus components, dynamic rendering reduces memory usage
13. **About Screen Update**: Updated information to reflect monorepo structure, detailed tech stack

### Frontend
1. **WebSocket Communication**: Socket.IO Client → Native WebSocket API
2. **Connection Management**: Custom WebSocket hook implementation
3. **Auto-reconnection**: Automatic retry on connection failure
4. **Error Handling**: Proper display on connection errors

## License

Maybe MIT License?
