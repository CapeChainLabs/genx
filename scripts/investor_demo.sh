#!/bin/bash
# GenX Blockchain Investor Demo Script
# This script demonstrates the core functionality of the GenX blockchain

set -e

echo "=========================================="
echo "   GenX Blockchain Investor Demo"
echo "=========================================="
echo ""

# Configuration
GENXD_BIN="${GENXD_BIN:-$(pwd)/build/genxd}"
CHAIN_ID="localchain-1"
REST_URL="http://localhost:1317"
RPC_URL="http://localhost:26657"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}==> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if node is running
check_node() {
    print_step "Checking if GenX node is running..."
    if curl -s --connect-timeout 3 "$RPC_URL/status" > /dev/null 2>&1; then
        print_success "Node is running"
        return 0
    else
        echo "Node is not running. Please start the node first:"
        echo "  export PATH=\$PATH:$(pwd)/build"
        echo "  genxd start --pruning=nothing --minimum-gas-prices=0ugenx"
        exit 1
    fi
}

# Query chain status
query_status() {
    print_step "Querying chain status..."
    STATUS=$(curl -s "$RPC_URL/status")
    CHAIN=$(echo "$STATUS" | jq -r '.result.node_info.network')
    LATEST_BLOCK=$(echo "$STATUS" | jq -r '.result.sync_info.latest_block_height')
    print_success "Chain ID: $CHAIN"
    print_success "Latest Block: $LATEST_BLOCK"
}

# Create a token
demo_create_token() {
    print_step "Demo: Creating a new token..."
    
    # Using genxd CLI
    $GENXD_BIN tx creation create-token \
        "Demo Token" \
        "DEMO" \
        "A demo token for investor presentation" \
        "1000000" \
        "6" \
        --from acc0 \
        --keyring-backend test \
        --chain-id "$CHAIN_ID" \
        --yes \
        --fees 1000ugenx \
        --broadcast-mode sync > /tmp/tx_create_token.json 2>&1
    
    sleep 3
    
    # Query the creation module
    print_step "Querying created assets..."
    RESULT=$(curl -s "$REST_URL/genx/creation/v1/assets?asset_type=token")
    echo "$RESULT" | jq '.'
    
    print_success "Token created successfully!"
}

# Create an NFT collection
demo_create_nft() {
    print_step "Demo: Creating an NFT collection..."
    
    $GENXD_BIN tx creation create-nft-collection \
        "Demo NFT Collection" \
        "DNFT" \
        "A demo NFT collection" \
        "https://metadata.example.com/collection/1" \
        --from acc0 \
        --keyring-backend test \
        --chain-id "$CHAIN_ID" \
        --yes \
        --fees 1000ugenx \
        --broadcast-mode sync > /tmp/tx_create_nft.json 2>&1
    
    sleep 3
    
    # Query NFT assets
    print_step "Querying NFT assets..."
    RESULT=$(curl -s "$REST_URL/genx/creation/v1/assets?asset_type=nft")
    echo "$RESULT" | jq '.'
    
    print_success "NFT Collection created successfully!"
}

# Create a meme coin
demo_create_meme_coin() {
    print_step "Demo: Creating a meme coin..."
    
    $GENXD_BIN tx creation create-meme-coin \
        "Meme Coin" \
        "MEME" \
        "A demo meme coin with bonding curve" \
        "5000000" \
        "18" \
        "linear" \
        --from acc0 \
        --keyring-backend test \
        --chain-id "$CHAIN_ID" \
        --yes \
        --fees 1000ugenx \
        --broadcast-mode sync > /tmp/tx_create_meme.json 2>&1
    
    sleep 3
    
    # Query meme coin assets
    print_step "Querying meme coin assets..."
    RESULT=$(curl -s "$REST_URL/genx/creation/v1/assets?asset_type=meme_coin")
    echo "$RESULT" | jq '.'
    
    print_success "Meme Coin created successfully!"
}

# Query all assets
demo_query_all_assets() {
    print_step "Querying all created assets..."
    RESULT=$(curl -s "$REST_URL/genx/creation/v1/assets")
    TOTAL=$(echo "$RESULT" | jq -r '.total_assets // 0')
    print_info "Total assets created: $TOTAL"
    echo "$RESULT" | jq '.assets[] | {id, name, symbol, asset_type, creator}'
}

# Query module params
demo_query_params() {
    print_step "Querying creation module parameters..."
    RESULT=$(curl -s "$REST_URL/genx/creation/v1/params")
    echo "$RESULT" | jq '.'
}

# Main demo flow
main() {
    echo ""
    print_info "Starting investor demo..."
    echo ""
    
    check_node
    query_status
    
    echo ""
    print_info "Core Features Demonstrated:"
    print_info "1. Token Creation (via TokenFactory module)"
    print_info "2. NFT Collection Creation (via CosmWasm NFT module)"
    print_info "3. Meme Coin Creation (with bonding curve support)"
    print_info "4. Asset Tracking (all assets tracked on-chain)"
    echo ""
    
    read -p "Press Enter to continue with token creation demo..."
    
    demo_create_token
    sleep 2
    
    demo_create_nft
    sleep 2
    
    demo_create_meme_coin
    sleep 2
    
    demo_query_all_assets
    sleep 1
    
    demo_query_params
    
    echo ""
    echo "=========================================="
    print_success "Demo completed successfully!"
    echo "=========================================="
    echo ""
    print_info "The GenX blockchain supports:"
    print_info "• Creating custom tokens with TokenFactory"
    print_info "• Creating NFT collections with metadata"
    print_info "• Creating meme coins with bonding curves"
    print_info "• IBC (Inter-Blockchain Communication)"
    print_info "• CosmWasm smart contracts"
    print_info "• PoS staking and governance"
    echo ""
}

# Run main function
main "$@"
