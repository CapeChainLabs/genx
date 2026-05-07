import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext.jsx'

export function Dashboard() {
  const { wallet } = useWallet()
  const [mobileStats, setMobileStats] = useState(null);

  useEffect(() => {
    // Load mobile mining stats from localStorage (synced from mobile)
    const stats = localStorage.getItem('genx_mobile_stats');
    if (stats) {
      setMobileStats(JSON.parse(stats));
    }
  }, []);

  if (!wallet.isConnected) return null

  const [mobileStats, setMobileStats] = useState(null);

  useEffect(() => {
    // Load mobile mining stats from localStorage (synced from mobile)
    const stats = localStorage.getItem('genx_mobile_stats');
    if (stats) {
      setMobileStats(JSON.parse(stats));
    }
  }, []);

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
        
        {/* Mobile Mining Stats */}
        {mobileStats && (
          <>
            <div className="dash-card">
              <h3>Mobile Balance</h3>
              <p className="dash-value" style={{ color: 'var(--neon-teal)' }}>{mobileStats.balance || 0} GENX</p>
              <p className="dash-sub">From Mobile App</p>
            </div>
            <div className="dash-card">
              <h3>Today's Taps</h3>
              <p className="dash-value" style={{ color: 'var(--neon-purple)' }}>{mobileStats.todayTaps || 0}</p>
              <p className="dash-sub">Mobile Mining</p>
            </div>
            <div className="dash-card">
              <h3>Total Mined</h3>
              <p className="dash-value" style={{ color: 'var(--neon-pink)' }}>{mobileStats.totalMined || 0} GENX</p>
              <p className="dash-sub">All Time</p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
