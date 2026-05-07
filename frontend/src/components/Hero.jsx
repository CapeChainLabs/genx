import { useWallet } from '../contexts/WalletContext.jsx'

export function Hero() {
  const { wallet } = useWallet()

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Testnet Live
        </div>
        <h1 className="hero-title">
          <span className="gradient-text">
            {wallet.isConnected ? 'Create Without Limits' : 'Build Different'}
          </span>
        </h1>
        <p className="hero-subtitle">
          Launch tokens, deploy smart contracts, and mint NFTs in seconds.
          Zero coding required. Powered by the GenX blockchain.
        </p>
        <div className="hero-actions">
          <a href="#create" className="btn btn-primary">
            Start Creating
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="#explore" className="btn btn-secondary">
            Explore
          </a>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-value">~0</span>
          <span className="stat-label">Gas Fee</span>
        </div>
        <div className="stat">
          <span className="stat-value">&lt;1s</span>
          <span className="stat-label">Block Time</span>
        </div>
        <div className="stat">
          <span className="stat-value">0</span>
          <span className="stat-label">Smart Contracts</span>
        </div>
      </div>
    </section>
  )
}
