# Installation Guide

Installation instructions for PC Status Monitor (Rust Monorepo).

English Installation Guide | [日本語インストールガイド](INSTALL.md)

## Prerequisites

### Required Software
- **Rust**: 1.70 or higher
- **Cargo**: Included with Rust
- **Node.js**: 16.0 or higher (for frontend)
- **pnpm**: Recommended package manager

### Optional
- **Git**: For source code retrieval
- **nvidia-smi**: For GPU information collection (when using NVIDIA GPU)

## Installation Steps

### Method 1: Install from Release (Recommended)

The easiest way using pre-built binaries.

#### 1. Download Release

1. Visit the [GitHub Releases page](https://github.com/your-username/pc-status-monorepo-rs/releases)
2. Select the latest release
3. Download the required components:

**Client (System Information Collection):**
   - **macOS (M1/M2)**: `pc-status-client-macos-arm64.tar.gz`
   - **Windows 64-bit**: `pc-status-client-windows-x64.zip`
   - **Linux 64-bit**: `pc-status-client-linux-x64.tar.gz`
   - **Linux ARM64**: `pc-status-client-linux-arm64.tar.gz`

**Backend (Server):**
   - **macOS (M1/M2)**: `pc-status-backend-macos-arm64.tar.gz`
   - **Windows 64-bit**: `pc-status-backend-windows-x64.zip`
   - **Linux 64-bit**: `pc-status-backend-linux-x64.tar.gz`
   - **Linux ARM64**: `pc-status-backend-linux-arm64.tar.gz`

#### 2. Extract and Install

**Linux/macOS:**
```bash
# Extract client and backend
tar -xzf pc-status-client-linux-x64.tar.gz
tar -xzf pc-status-backend-linux-x64.tar.gz

# Place binaries in appropriate location
sudo mkdir -p /opt/pc-status
sudo cp client /opt/pc-status/  # from client archive
sudo cp server /opt/pc-status/  # from backend archive
sudo cp *.env.example /opt/pc-status/
sudo cp *.service /opt/pc-status/  # systemd service files
sudo chmod +x /opt/pc-status/server /opt/pc-status/client

# Place frontend files (optional)
# For integrated frontend serving
sudo mkdir -p /opt/pc-status/frontend
# Copy frontend build artifacts
# sudo cp -r /path/to/frontend/out/* /opt/pc-status/frontend/

# Create symbolic links (optional)
sudo ln -s /opt/pc-status/server /usr/local/bin/pc-status-server
sudo ln -s /opt/pc-status/client /usr/local/bin/pc-status-client
```

**Windows:**
```powershell
# Extract ZIP files
Expand-Archive -Path pc-status-client-windows-x64.zip -DestinationPath C:\pc-status\client
Expand-Archive -Path pc-status-backend-windows-x64.zip -DestinationPath C:\pc-status\server

# Consolidate binaries
Copy-Item C:\pc-status\client\client.exe C:\pc-status\
Copy-Item C:\pc-status\server\server.exe C:\pc-status\

# Place frontend files (optional)
# For integrated frontend serving
New-Item -ItemType Directory -Path C:\pc-status\frontend -Force
# Copy frontend build artifacts
# Copy-Item -Recurse /path/to/frontend/out/* C:\pc-status\frontend\

# Add to PATH environment variable (optional)
$env:PATH += ";C:\pc-status"
```

#### 3. Create Configuration Files

```bash
cd /opt/pc-status  # Linux/macOS
# or
cd C:\pc-status    # Windows

# Copy configuration files
cp server.env.example server.env
cp client.env.example client.env

# Edit configuration files (passwords, etc.)
nano server.env  # or any editor
nano client.env
```

### Method 2: Build from Source

For developers or when customization is needed.

#### 1. Installing Rust

#### Windows
```powershell
# Download and run the official Rust installer
# Download rustup-init.exe from https://rustup.rs/
rustup-init.exe
```

#### Linux/macOS
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### 2. Installing Node.js and pnpm

#### Node.js
Download and install the LTS version from the official website:
https://nodejs.org/

#### pnpm
For detailed pnpm installation instructions, please refer to the official installation guide:
https://pnpm.io/installation

**Quick Install (if Node.js is already installed):**
```bash
npm install -g pnpm
```

### 3. Getting the Project

```bash
git clone <repository-url>
cd pc-status-monorepo-rs
```

### 4. Installing Dependencies

#### Rust Dependencies
```bash
# Run in project root
cargo build
```

#### Frontend Dependencies
```bash
cd frontend
pnpm install
cd ..
```

## Configuration

### 1. Server Configuration

```bash
cd server
cp .env.example .env
```

Edit the `.env` file:
```env
# Server port
PORT=3000

# Authentication password (same as official server)
PASS=sIvnjGO4eSftbiYh4aL29wlu9DUpnk3yAAaq2aRpbysEFBSYsh5i850HEvvpOPj7wha7jXIMcnWXyn51PKCPSZEOZgXdWRIXLCkAJnVGrtJXZGr0J9C5YiYCQQ4ZBBFz

# Log level
RUST_LOG=info
```

### 2. Client Configuration

```bash
cd client
cp .env.example .env
```

Edit the `.env` file:
```env
# Server URL (either PCSC_URI or SERVER_URL works)
PCSC_URI=ws://localhost:3000/server
SERVER_URL=ws://localhost:3000/server

# Authentication password (same as server)
PASS=sIvnjGO4eSftbiYh4aL29wlu9DUpnk3yAAaq2aRpbysEFBSYsh5i850HEvvpOPj7wha7jXIMcnWXyn51PKCPSZEOZgXdWRIXLCkAJnVGrtJXZGr0J9C5YiYCQQ4ZBBFz

# Hostname (optional, auto-detected from system if not specified)
# HOSTNAME=my-custom-hostname

# Development mode (true/false)
DEV_MODE=false

# Auto-update setting (restart/terminate/none)
PCSC_UPDATED=none

# Log level
RUST_LOG=info
```

## Verification

### 1. Build Test
```bash
# Run in project root
cargo check
```

### 2. Run Tests
```bash
cargo test
```

### 3. Component Startup Test

#### Start Server
```bash
cargo run --bin server
```
When started successfully, you should see a message like:
```
Server listening on http://0.0.0.0:3000
```

#### Start Client (in separate terminal)
```bash
cargo run --bin client
```

#### Start Frontend (in separate terminal)
```bash
cd frontend
pnpm run dev
```
Access the frontend at http://localhost:3000.

## Troubleshooting

### Common Issues

#### 1. Rust Compilation Errors
```bash
# Update Rust toolchain to latest
rustup update
```

#### 2. Dependency Issues
```bash
# Clear Cargo cache
cargo clean
cargo build
```

#### 3. Frontend Dependency Errors
```bash
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 4. Port Conflict Errors
- If the server port (default 3000) is in use
- Change PORT in the `.env` file

#### 5. GPU Information Not Available
- For NVIDIA GPU: Verify `nvidia-smi` command is available
- For AMD GPU: Currently not supported

### Checking Logs

For detailed logs:
```bash
RUST_LOG=debug cargo run --bin server
RUST_LOG=debug cargo run --bin client
```

## systemd Service Configuration (Linux)

How to set up automatic startup as a service on Linux.

### 1. Create Service Files

#### Server Service

```bash
sudo nano /etc/systemd/system/pc-status-server.service
```

Add the following content:
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

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/pc-status

[Install]
WantedBy=multi-user.target
```

#### Client Service

```bash
sudo nano /etc/systemd/system/pc-status-client.service
```

Add the following content:
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

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/pc-status

[Install]
WantedBy=multi-user.target
```

### 2. Create Dedicated User

```bash
# Create pc-status user
sudo useradd -r -s /bin/false -d /opt/pc-status pc-status

# Change directory ownership
sudo chown -R pc-status:pc-status /opt/pc-status
```

### 3. Enable and Start Services

```bash
# Reload systemd configuration
sudo systemctl daemon-reload

# Enable services (auto-start on boot)
sudo systemctl enable pc-status-server
sudo systemctl enable pc-status-client

# Start services
sudo systemctl start pc-status-server
sudo systemctl start pc-status-client

# Check service status
sudo systemctl status pc-status-server
sudo systemctl status pc-status-client
```

### 4. Service Management Commands

```bash
# Stop services
sudo systemctl stop pc-status-server
sudo systemctl stop pc-status-client

# Restart services
sudo systemctl restart pc-status-server
sudo systemctl restart pc-status-client

# View logs
sudo journalctl -u pc-status-server -f
sudo journalctl -u pc-status-client -f

# Disable services
sudo systemctl disable pc-status-server
sudo systemctl disable pc-status-client
```

## GitHub Pages Frontend Deployment

How to deploy the frontend to GitHub Pages.

### 1. Enable GitHub Pages

1. Go to your GitHub repository's **Settings** tab
2. Click **Pages** in the left sidebar
3. Select **GitHub Actions** as the **Source**
4. Save the settings

### 2. Environment Variables (Optional)

To use a custom WebSocket server:

1. Go to GitHub repository **Settings** → **Secrets and variables** → **Actions**
2. Add a new variable in the **Variables** tab:
   - **Name**: `NEXT_PUBLIC_WS_URL`
   - **Value**: `wss://your-server.com/ws`

### 3. Deploy

Push changes to the frontend/ directory in the main branch to automatically deploy to GitHub Pages:

```bash
git add frontend/
git commit -m "Update frontend"
git push origin main
```

### 4. Access

After deployment completes, access at:
```
https://your-username.github.io/pc-status-monorepo-rs/
```

## Next Steps

After installation is complete, refer to the Usage section in [README.en.md](README.en.md).

## Support

If you encounter issues, please check:
1. Required software is correctly installed
2. Environment variables are properly configured
3. Firewall or security software is not blocking ports
