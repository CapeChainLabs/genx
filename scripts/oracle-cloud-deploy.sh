#!/bin/bash
# GenX Blockchain - Oracle Cloud Deployment Script
# Run this on a fresh Ubuntu ARM instance on Oracle Cloud

set -e

echo "=========================================="
echo "  GenX Blockchain - Oracle Cloud Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please run as a regular user with sudo access, not root${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install essentials
echo -e "${YELLOW}Installing essential packages...${NC}"
sudo apt install -y build-essential curl wget git jq unzip software-properties-common

# Install Go 1.21
echo -e "${YELLOW}Installing Go 1.21...${NC}"
wget https://go.dev/dl/go1.21.13.linux-arm64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.21.13.linux-arm64.tar.gz
rm go1.21.13.linux-arm64.tar.gz

# Add Go to PATH
if ! grep -q "/usr/local/go/bin" ~/.bashrc; then
    echo 'export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin' >> ~/.bashrc
    echo 'export GOPATH=$HOME/go' >> ~/.bashrc
fi
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin
export GOPATH=$HOME/go

# Verify Go installation
go version

# Install Node.js 18 (for frontend tools if needed)
echo -e "${YELLOW}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone GenX repository
echo -e "${YELLOW}Cloning GenX repository...${NC}"
cd ~
if [ -d "genx" ]; then
    cd genx
    git pull origin main
else
    git clone https://github.com/CapeChainLabs/genx.git
    cd genx
fi

# Build the chain
echo -e "${YELLOW}Building GenX binary...${NC}"
make install

# Verify installation
if command -v genxd &> /dev/null; then
    echo -e "${GREEN}✓ genxd installed successfully${NC}"
    genxd version
else
    echo -e "${RED}✗ genxd installation failed${NC}"
    exit 1
fi

# Initialize the chain
echo -e "${YELLOW}Initializing blockchain...${NC}"
CHAIN_ID="genx-main-1"
MONIKER="oracle-genx-node"

genxd init $MONIKER --chain-id $CHAIN_ID

# Create validator key
echo -e "${YELLOW}Setting up validator keys...${NC}"
genxd keys add validator --keyring-backend test

# Get validator address
VALIDATOR_ADDR=$(genxd keys show validator -a --keyring-backend test)
echo -e "${GREEN}Validator address: $VALIDATOR_ADDR${NC}"

# Add genesis account
genxd genesis add-genesis-account $VALIDATOR_ADDR 1000000000000ugenx --keyring-backend test

# Create genesis transaction
genxd genesis gentx validator 1000000000000ugenx --chain-id $CHAIN_ID --moniker $MONIKER --keyring-backend test

# Collect genesis transactions
genxd genesis collect-gentxs

# Validate genesis
genxd genesis validate-genesis

# Configure for external access
echo -e "${YELLOW}Configuring node for external access...${NC}"
INTERNAL_IP=$(hostname -I | awk '{print $1}')
EXTERNAL_IP=$(curl -s ifconfig.me)

# Update config files
sed -i "s/localhost/$INTERNAL_IP/g" ~/.genx/config/config.toml
sed -i "s/127.0.0.1/0.0.0.0/g" ~/.genx/config/config.toml
sed -i "s/127.0.0.1/0.0.0.0/g" ~/.genx/config/app.toml
sed -i 's/cors_allowed_origins = \[\]/cors_allowed_origins = ["*"]/' ~/.genx/config/config.toml
sed -i 's/enabled = false/enabled = true/' ~/.genx/config/app.toml

# Set up RPC and API ports
sed -i 's/laddr = "tcp:\/\/127.0.0.1:26657"/laddr = "tcp:\/\/0.0.0.0:26657"/' ~/.genx/config/config.toml
sed -i 's/address = "tcp:\/\/localhost:1317"/address = "tcp:\/\/0.0.0.0:1317"/' ~/.genx/config/app.toml

# Create systemd service for auto-start
echo -e "${YELLOW}Creating systemd service...${NC}"
sudo tee /etc/systemd/system/genxd.service > /dev/null <<EOF
[Unit]
Description=GenX Blockchain Node
After=network-online.target

[Service]
User=$USER
ExecStart=$HOME/go/bin/genxd start
Restart=always
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable genxd
sudo systemctl start genxd

# Wait for node to start
echo -e "${YELLOW}Waiting for node to start...${NC}"
sleep 10

# Check node status
if systemctl is-active --quiet genxd; then
    echo -e "${GREEN}✓ GenX node is running${NC}"
else
    echo -e "${RED}✗ Node failed to start. Check logs: journalctl -u genxd -f${NC}"
    exit 1
fi

# Get public IP for mobile app config
PUBLIC_IP=$(curl -s ifconfig.me)

echo ""
echo -e "${GREEN}=========================================="
echo "  GenX Blockchain Deployed Successfully!"
echo "==========================================${NC}"
echo ""
echo -e "Node Status: ${GREEN}Running${NC}"
echo -e "Chain ID: ${YELLOW}$CHAIN_ID${NC}"
echo -e "Moniker: ${YELLOW}$MONIKER${NC}"
echo ""
echo -e "${YELLOW}Connection Details:${NC}"
echo "  RPC Endpoint:  http://$PUBLIC_IP:26657"
echo "  REST API:     http://$PUBLIC_IP:1317"
echo "  Validator:    $VALIDATOR_ADDR"
echo ""
echo -e "${YELLOW}Update Mobile App Config:${NC}"
echo "  Edit: mobile/src/services/WalletService.ts"
echo "  Set GENX_RPC = 'http://$PUBLIC_IP:26657'"
echo "  Set GENX_REST = 'http://$PUBLIC_IP:1317'"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  Check status:  journalctl -u genxd -f"
echo "  Stop node:     sudo systemctl stop genxd"
echo "  Start node:    sudo systemctl start genxd"
echo "  Restart:       sudo systemctl restart genxd"
echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${YELLOW}NOTE: Open ports 26656, 26657, 1317 in Oracle Cloud Security List!${NC}"
echo -e "Go to: OCI Console → Networking → Virtual Cloud Network → Security Lists → Ingress Rules"
echo -e "Add rules for ports: 26656, 26657 (TCP), 1317 (TCP)"
echo -e "${GREEN}==========================================${NC}"
