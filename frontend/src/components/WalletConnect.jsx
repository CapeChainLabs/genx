import { useWallet } from '../contexts/WalletContext.jsx'

export function WalletConnect() {
  const { wallet, connectWallet } = useWallet()

  if (wallet.isConnected) return null

  return (
    <section className="wallet-connect-section">
      <h2>Connect Your Wallet</h2>
      <p>Choose your preferred wallet to get started</p>
      <div className="wallet-options">
        <button className="wallet-option-card" onClick={() => connectWallet('keplr')}>
          <div className="wallet-logo keplr" />
          <h3>Keplr</h3>
          <p>The most popular Cosmos wallet with full chain support</p>
        </button>
        <button className="wallet-option-card" onClick={() => connectWallet('leap')}>
          <div className="wallet-logo leap" />
          <h3>Leap</h3>
          <p>Fast and secure multi-chain wallet for creators</p>
        </button>
      </div>
      {wallet.error && <div className="error-message">{wallet.error}</div>}
    </section>
  )
}
