#!/bin/bash
# Quick Start Script for GenX Blockchain Investor Demo

set -e

echo "=========================================="
echo "  GenX Blockchain - Quick Start"
echo "=========================================="
echo ""

# Start the blockchain node
start_node() {
    echo "Starting GenX node..."
    cd /home/macjezzl/spawn/genx
    export PATH=$PATH:$(pwd)/build
    
    # Kill any existing genxd processes
    pkill -f "genxd start" 2>/dev/null || true
    sleep 2
    
    # Start node in background
    nohup genxd start --pruning=nothing --minimum-gas-prices=0ugenx > /tmp/genx.log 2>&1 &
    echo "Node started with PID: $!"
    
    # Wait for node to be ready
    echo "Waiting for node to start..."
    for i in {1..30}; do
        if curl -s http://localhost:26657/status > /dev/null 2>&1; then
            echo "Node is ready!"
            return 0
        fi
        sleep 1
    done
    
    echo "Error: Node failed to start. Check /tmp/genx.log"
    exit 1
}

# Start the frontend
start_frontend() {
    echo "Starting frontend..."
    cd /home/macjezzl/spawn/genx/frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    # Start dev server
    npm run dev -- --host 0.0.0.0 &
    echo "Frontend started at http://localhost:5173"
}

# Main
main() {
    start_node
    sleep 3
    start_frontend
    
    echo ""
    echo "=========================================="
    echo "  GenX Blockchain is ready!"
    echo "=========================================="
    echo ""
    echo "Access points:"
    echo "  • Frontend: http://localhost:5173"
    echo "  • RPC: http://localhost:26657"
    echo "  • REST API: http://localhost:1317"
    echo ""
    echo "Demo credentials (test keyring):"
    echo "  • Account 0: acc0 (has tokens)"
    echo "  • Account 1: acc1 (has tokens)"
    echo ""
    echo "Quick demo commands:"
    echo "  • Check status: curl http://localhost:26657/status"
    echo "  • View assets: curl http://localhost:1317/genx/creation/v1/assets"
    echo ""
    echo "For investor demo script, run:"
    echo "  sh /home/macjezzl/spawn/genx/scripts/investor_demo.sh"
    echo ""
}

main "$@"
