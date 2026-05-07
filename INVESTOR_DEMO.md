# GenX Blockchain - Investor Demo Guide

## Overview
GenX is a Cosmos SDK-based blockchain with custom asset creation capabilities. This guide will help you demonstrate the key features to investors.

## Key Features Implemented

### 1. Token Creation Module (`x/creation`)
- **Create custom tokens** with TokenFactory integration
- **Create NFT collections** with metadata support
- **Create Meme coins** with bonding curve support
- **Referral system** for growth hacking
- **Asset tracking** - all created assets tracked on-chain

### 2. Core Blockchain Features
- **Cosmos SDK v0.50.10** - Latest stable release
- **CometBFT Consensus** - Fast, secure BFT consensus
- **IBC Support** - Inter-Blockchain Communication ready
- **CosmWasm** - Smart contract platform (v2.1)
- **TokenFactory** - Create custom token denoms
- **POA Module** - Proof of Authority support
- **NFT Module** - Native NFT support

### 3. Frontend Application
- **React + Vite** - Modern, fast frontend
- **Keplr & Leap Wallet** integration
- **3D Graphics** - Three.js powered visuals
- **Real-time asset creation** UI

## Quick Start for Demo

### Option 1: Local Testnet (Automated)
```bash
cd /home/macjezzl/spawn/genx

# Start local testnet with clean state
CHAIN_ID="localchain-1" CLEAN=true sh scripts/test_node.sh

# In another terminal, run the demo
sh scripts/investor_demo.sh
```

### Option 2: Manual Start
```bash
cd /home/macjezzl/spawn/genx
export PATH=$PATH:$(pwd)/build

# Setup (first time only)
genxd config set client chain-id localchain-1
genxd config set client keyring-backend test
echo "decorate bright ozone fork gallery riot bus exhaust worth way bone indoor calm squirrel merry zero scheme cotton until shop any excess stage laundry" | genxd keys add acc0 --keyring-backend test --algo secp256k1 --recover
echo "wealth flavor believe regret funny network recall kiss grape useless pepper cram hint member few certain unveil rather brick bargain curious require crowd raise" | genxd keys add acc1 --keyring-backend test --algo secp256k1 --recover
genxd init localvalidator --chain-id localchain-1 --default-denom ugenx

# Start the node
genxd start --pruning=nothing --minimum-gas-prices=0ugenx
```

### Start Frontend
```bash
cd /home/macjezzl/spawn/genx/frontend
npm install
npm run dev
```

Access at: http://localhost:5173

## Demo Script

### 1. Show Blockchain Status
```bash
# Check node status
curl http://localhost:26657/status | jq '.result.node_info.network'

# Check latest block
curl http://localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

### 2. Create a Token (via CLI)
```bash
genxd tx creation create-token \
    "Investor Token" \
    "INV" \
    "Token created for investor demo" \
    "1000000" \
    "6" \
    --from acc0 \
    --keyring-backend test \
    --chain-id localchain-1 \
    --yes
```

### 3. Create NFT Collection (via CLI)
```bash
genxd tx creation create-nft-collection \
    "Investor NFTs" \
    "INFT" \
    "Exclusive investor NFT collection" \
    "https://metadata.example.com/investor-nft" \
    --from acc0 \
    --keyring-backend test \
    --chain-id localchain-1 \
    --yes
```

### 4. Create Meme Coin (via CLI)
```bash
genxd tx creation create-meme-coin \
    "GenX Meme" \
    "GMEME" \
    "Community meme coin" \
    "5000000" \
    "18" \
    "linear" \
    --from acc0 \
    --keyring-backend test \
    --chain-id localchain-1 \
    --yes
```

### 5. Query Created Assets
```bash
# All assets
curl http://localhost:1317/genx/creation/v1/assets | jq '.'

# Total asset counts
curl http://localhost:1317/genx/creation/v1/total_assets | jq '.'

# Assets by creator
curl http://localhost:1317/genx/creation/v1/assets/creator/genx1hj5fveer5cjtn4wd6wstzugjfdxzl0xp9c0aqv | jq '.'
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/genx/creation/v1/assets` | List all created assets |
| `/genx/creation/v1/assets/{id}` | Get asset by ID |
| `/genx/creation/v1/assets/creator/{address}` | Get assets by creator |
| `/genx/creation/v1/total_assets` | Get total asset counts |
| `/genx/creation/v1/params` | Get module parameters |
| `/genx/creation/v1/referrals/{referrer}` | Get referral info |

## Frontend Demo Flow

1. Open http://localhost:5173 in browser
2. Connect Keplr or Leap wallet
3. Switch to GenX network (localchain-1)
4. Navigate to "Create" tab
5. Create a token:
   - Fill in name, symbol, description
   - Set initial supply
   - Click "Create Token"
6. Create an NFT collection:
   - Navigate to NFT tab
   - Fill in collection details
   - Add metadata URI
   - Click "Create NFT Collection"
7. Create a meme coin:
   - Navigate to Meme Coin tab
   - Fill in details
   - Select bonding curve type
   - Click "Create Meme Coin"
8. View created assets in the dashboard

## Smart Contracts (CosmWasm)

The blockchain includes CosmWasm v2.1 for smart contract support. To deploy contracts:

```bash
# Upload contract
genxd tx wasm store <contract.wasm> --from acc0 --chain-id localchain-1 --yes

# Instantiate contract
genxd tx wasm instantiate <code-id> '{}' --from acc0 --chain-id localchain-1 --yes
```

## IBC Configuration

GenX is IBC-ready. See `chains/testnet.json` for testnet configuration with Gaia (Cosmos Hub).

## Technical Architecture

```
GenX Blockchain
├── Cosmos SDK v0.50.10
├── CometBFT v0.38.12 (Consensus)
├── CosmWasm v2.1 (Smart Contracts)
└── Custom Modules:
    ├── creation (Token/NFT/Meme Coin creation)
    ├── tokenfactory (Custom token denoms)
    ├── poa (Proof of Authority)
    └── ibc (Inter-Blockchain Communication)
```

## Token Economics

- **Token Symbol**: GENX
- **Base Denomination**: ugenx (micro GENX)
- **Staking**: Proof of Stake
- **Governance**: On-chain proposals and voting

## Next Steps for Mainnet

1. **Security Audit** - Have creation module audited
2. **Validator Onboarding** - Recruit validators for launch
3. **Token Distribution** - Plan token allocation
4. **Marketing** - Launch campaign with meme coin creation
5. **DApp Ecosystem** - Encourage developers to build on GenX

## Contact

For technical questions or demo support, contact the GenX development team.

---
**Built with:**
- Go 1.22.3
- Cosmos SDK (modified by rollchains)
- React 18 + Vite
- Three.js for 3D graphics
