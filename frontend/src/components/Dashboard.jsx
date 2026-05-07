import { useWallet } from '../contexts/WalletContext.jsx'

export function Dashboard() {
  const { wallet } = useWallet()

  if (!wallet.isConnected) return null

  return (
    <section id="dashboard" className="dashboard-section">
      <h2>
        <span className="gradient-text">Dashboard</span>
      </h2>
      <div className="dashboard-grid">
        <div className="dash-card">
          <h3>Balance</h3>
          <p className="dash-value" style={{ color: 'var(--neon-teal)' }}>{wallet.balance} GENX</p>
          <p className="dash-sub">Available</p>
        </div>
        <div className="dash-card">
          <h3>Address</h3>
          <p className="dash-address">{wallet.bech32Address}</p>
          <button
            className="btn btn-small"
            onClick={() => navigator.clipboard.writeText(wallet.bech32Address)}
          >
            Copy
          </button>
        </div>
        <div className="dash-card">
          <h3>Wallet</h3>
          <p className="dash-value" style={{ fontSize: '18px', color: 'var(--neon-purple)' }}>
            {wallet.isLeap ? 'Leap' : 'Keplr'}
          </p>
          <p className="dash-sub">Connected</p>
        </div>
        <div className="dash-card">
          <h3>Network</h3>
          <p className="dash-value" style={{ fontSize: '18px', color: 'var(--neon-pink)' }}>GenX</p>
          <p className="dash-sub">localchain-1</p>
        </div>
      </div>
    </section>
  )
}
