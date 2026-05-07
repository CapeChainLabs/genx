import { useState } from 'react'
import { useWallet } from '../contexts/WalletContext.jsx'

function formatAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function Header() {
  const { wallet, connectWallet, disconnect } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="header">
      <div className="header-content">
        <a href="#top" className="logo">
          <div className="logo-icon">G</div>
          <h1>GenX</h1>
        </a>
        <nav className="nav">
          <a href="#create">Create</a>
          <a href="#explore">Explore</a>
          <a href="#dashboard">Dashboard</a>
        </nav>
        <div className="wallet-section">
          {wallet.isConnected ? (
            <div className="wallet-connected">
              <button
                className="wallet-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="wallet-icon" />
                <span>{formatAddress(wallet.bech32Address)}</span>
                <span className="balance">{wallet.balance} GENX</span>
              </button>
              {showDropdown && (
                <div className="wallet-dropdown">
                  <button onClick={() => { disconnect(); setShowDropdown(false) }}>
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="wallet-connect-wrapper">
              <button
                className="connect-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>Connect Wallet</span>
              </button>
              {showDropdown && (
                <div className="wallet-dropdown">
                  <button onClick={() => { connectWallet('keplr'); setShowDropdown(false) }}>
                    <span className="wallet-option-icon" style={{ background: 'linear-gradient(135deg, #3170e0, #5c90ff)' }} />
                    Keplr
                  </button>
                  <button onClick={() => { connectWallet('leap'); setShowDropdown(false) }}>
                    <span className="wallet-option-icon" style={{ background: 'linear-gradient(135deg, #2d1b69, #5b3abf)' }} />
                    Leap
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
