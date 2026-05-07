# GenX Blockchain - Oracle Cloud Deployment Guide

## Prerequisites

1. **Oracle Cloud Account** - Sign up at https://oracle.com/cloud/free
   - Always Free tier includes ARM instances (4 OCPUs, 24GB RAM)
   - No credit card required for Always Free

2. **Create an ARM Instance**
   - Go to OCI Console → Compute → Instances
   - Click "Create Instance"
   - Shape: **VM.Standard.A1.Flex** (ARM Ampere)
   - OCPU: 4, Memory: 24GB (all free)
   - OS: Ubuntu 20.04 or 22.04
   - Add SSH key (save the private key!)

## Step 1: Connect to Your Instance

```bash
ssh -i /path/to/ssh-key ubuntu@<your-instance-public-ip>
```

## Step 2: Run the Deployment Script

```bash
# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/CapeChainLabs/genx/main/scripts/oracle-cloud-deploy.sh -o deploy.sh
chmod +x deploy.sh
./deploy.sh
```

Or manually clone and run:

```bash
git clone https://github.com/CapeChainLabs/genx.git
cd genx
bash scripts/oracle-cloud-deploy.sh
```

The script will:
- ✅ Install Go 1.21, Node.js, and dependencies
- ✅ Clone and build the GenX blockchain
- ✅ Initialize the chain with your validator
- ✅ Configure for external access
- ✅ Create a systemd service (auto-starts on reboot)
- ✅ Output connection details

## Step 3: Open Ports in Oracle Cloud

**CRITICAL:** You must open ports in the OCI Security List!

1. Go to [OCI Console](https://cloud.oracle.com)
2. Navigate: **Networking → Virtual Cloud Networks**
3. Click on your VCN → **Security Lists** → **Default Security List**
4. Click **Add Ingress Rules** and add:

| Source CIDR | Protocol | Port | Description |
|-------------|----------|------|-------------|
| 0.0.0.0/0 | TCP | 26656 | P2P Node Communication |
| 0.0.0.0/0 | TCP | 26657 | RPC (Mobile App) |
| 0.0.0.0/0 | TCP | 1317 | REST API (Wallet) |
| 0.0.0.0/0 | TCP | 26660 | Prometheus (Monitoring) |

Or run the helper script locally (if OCI CLI is configured):
```bash
bash scripts/oracle-open-ports.sh
```

## Step 4: Update Mobile App Configuration

Edit `mobile/src/services/WalletService.ts`:

```typescript
const GENX_RPC = 'http://<YOUR_PUBLIC_IP>:26657';
const GENX_REST = 'http://<YOUR_PUBLIC_IP>:1317';
```

Get your public IP from the deployment script output, then commit and push:
```bash
git add mobile/src/services/WalletService.ts
git commit -m "feat: Configure mobile app for production Oracle Cloud endpoint"
git push origin main
```

## Step 5: Verify Deployment

Check node status:
```bash
# SSH into your instance
journalctl -u genxd -f  # View live logs

# Check if RPC is accessible
curl http://<YOUR_PUBLIC_IP>:26657/status
```

Expected output: JSON with "result" containing node info.

## Useful Commands

```bash
# Check service status
sudo systemctl status genxd

# Stop the node
sudo systemctl stop genxd

# Start the node
sudo systemctl start genxd

# Restart the node
sudo systemctl restart genxd

# View logs
journalctl -u genxd -f

# Check blockchain status
genxd status

# Query balance
genxd query bank balances <ADDRESS>
```

## Troubleshooting

**Node won't start:**
```bash
journalctl -u genxd -n 50  # Check last 50 log lines
```

**Can't connect from mobile app:**
1. Verify ports are open in OCI Security List
2. Check if node is running: `sudo systemctl status genxd`
3. Test RPC: `curl http://<IP>:26657/status`

**Out of disk space:**
```bash
df -h  # Check disk usage
docker system prune -a  # Clean up if Docker is installed
```

## Costs

**Always Free Tier:**
- 4 ARM OCPUs, 24GB RAM
- 200GB block storage
- 10TB outbound data transfer/month
- **Cost: $0/month** (truly free, no expiration)

If you exceed free limits, you'll be charged standard rates.

## Next Steps

1. **Set up monitoring:** Install Prometheus + Grafana
2. **Add more validators:** For a decentralized network
3. **Configure SSL:** Use nginx + Let's Encrypt for HTTPS
4. **Deploy web dashboard:** Point to your Oracle Cloud RPC endpoint

---

**Questions?** Open an issue at https://github.com/CapeChainLabs/genx/issues
