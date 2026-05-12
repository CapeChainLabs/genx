import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext.jsx'
import { queryReferralsByReferrer, queryAssetsByCreator, queryTotalAssets } from '../api/creation.js'

export function Dashboard() {
  const { wallet, balances, sendTokens, refreshBalance, chain } = useWallet()
  const [mobileStats, setMobileStats] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [userAssets, setUserAssets] = useState([])
  const [totalStats, setTotalStats] = useState(null)
  const [showSend, setShowSend] = useState(false)
  const [sendForm, setSendForm] = useState({ to: '', amount: '', denom: 'ugenx' })
  const [sendResult, setSendResult] = useState(null)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('portfolio')

  useEffect(() => {
    const stats = localStorage.getItem('genx_mobile_stats')
    if (stats) setMobileStats(JSON.parse(stats))
  }, [])

  useEffect(() => {
    if (!wallet.isConnected) return
    loadDashboardData()
  }, [wallet.isConnected, wallet.bech32Address])

  const loadDashboardData = async () => {
    try {
      const [refs, assets, stats] = await Promise.all([
        queryReferralsByReferrer(chain.rest, wallet.bech32Address).catch(() => []),
        queryAssetsByCreator(chain.rest, wallet.bech32Address).catch(() => []),
        queryTotalAssets(chain.rest).catch(() => null),
      ])
      setReferrals(refs)
      setUserAssets(assets)
      setTotalStats(stats)
    } catch (e) {
      console.log('Dashboard load error:', e)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!sendForm.to || !sendForm.amount) return
    setSending(true)
    setSendResult(null)
    try {
      const result = await sendTokens(sendForm.to, sendForm.amount, sendForm.denom)
      setSendResult({ success: true, txHash: result.transactionHash })
      setSendForm({ to: '', amount: '', denom: 'ugenx' })
    } catch (err) {
      setSendResult({ success: false, message: err.message })
    }
    setSending(false)
  }

  if (!wallet.isConnected) return null

  const genxBalance = balances.find(b => b.denom === 'ugenx')

  return (
    <section id="dashboard" className="dashboard-section">
      <div className="dash-header">
        <h2>
          <span className="gradient-text">Dashboard</span>
        </h2>
        <div className="dash-header-actions">
          <button className="btn btn-small" onClick={() => { setShowSend(!showSend); setSendResult(null) }}>
            {showSend ? 'Cancel' : 'Send'}
          </button>
          <button className="btn btn-small" onClick={refreshBalance}>Refresh</button>
        </div>
      </div>

      <div className="dash-tabs">
        <button className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>Portfolio</button>
        <button className={`tab ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>My Assets</button>
        <button className={`tab ${activeTab === 'referrals' ? 'active' : ''}`} onClick={() => setActiveTab('referrals')}>Referrals</button>
      </div>

      {activeTab === 'portfolio' && (
        <>
          <div className="dashboard-grid">
            <div className="dash-card dash-card-wide">
              <h3>Balance</h3>
              <p className="dash-value" style={{ color: 'var(--neon-teal)' }}>
                {genxBalance ? (parseFloat(genxBalance.amount)).toFixed(2) : wallet.balance} GENX
              </p>
              <p className="dash-sub">Available</p>
            </div>
            <div className="dash-card">
              <h3>Address</h3>
              <p className="dash-address">{wallet.bech32Address}</p>
              <button className="btn btn-small" onClick={() => navigator.clipboard.writeText(wallet.bech32Address)}>
                Copy
              </button>
            </div>
            <div className="dash-card">
              <h3>Wallet</h3>
              <p className="dash-value" style={{ fontSize: '18px', color: 'var(--neon-purple)' }}>
                {wallet.isKeplr ? 'Keplr' : 'Leap'}
              </p>
              <p className="dash-sub">Connected</p>
            </div>
            <div className="dash-card">
              <h3>Network</h3>
              <p className="dash-value" style={{ fontSize: '18px', color: 'var(--neon-pink)' }}>GenX</p>
              <p className="dash-sub">{chain.chainId}</p>
            </div>
          </div>

          {balances.length > 0 && (
            <div className="dash-balances">
              <h3>All Balances</h3>
              <div className="dash-balances-list">
                {balances.map(b => (
                  <div key={b.denom} className="dash-balance-row">
                    <span className="dash-balance-denom">{b.denom}</span>
                    <span className="dash-balance-amount">{parseFloat(b.amount).toFixed(6)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showSend && (
            <div className="dash-send-card">
              <h3>Send Tokens</h3>
              <form onSubmit={handleSend}>
                <div className="form-group">
                  <label>Recipient Address</label>
                  <input type="text" placeholder="genx1..." value={sendForm.to}
                    onChange={e => setSendForm(p => ({ ...p, to: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount</label>
                    <input type="number" placeholder="0.0" step="0.000001" value={sendForm.amount}
                      onChange={e => setSendForm(p => ({ ...p, amount: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Denom</label>
                    <select value={sendForm.denom} onChange={e => setSendForm(p => ({ ...p, denom: e.target.value }))}>
                      <option value="ugenx">GENX (ugenx)</option>
                      {balances.filter(b => b.denom !== 'ugenx').map(b => (
                        <option key={b.denom} value={b.denom}>{b.denom}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-footer">
                  <span className="fee-preview">Fee: ~0.005 GENX</span>
                  <button type="submit" className="btn btn-primary" disabled={sending}>
                    {sending ? <><span className="spinner" /> Sending...</> : 'Send'}
                  </button>
                </div>
              </form>
              {sendResult && (
                <div className={`result ${sendResult.success ? 'success' : 'error'}`}>
                  <p>{sendResult.success ? `Sent successfully! TX: ${sendResult.txHash.slice(0, 20)}...` : sendResult.message}</p>
                </div>
              )}
            </div>
          )}

          {mobileStats && (
            <div className="dash-mining-section">
              <h3>Mobile Mining Stats</h3>
              <div className="dashboard-grid mini-grid">
                <div className="dash-card">
                  <h3>Mobile Balance</h3>
                  <p className="dash-value" style={{ color: 'var(--neon-teal)', fontSize: '22px' }}>{mobileStats.balance || 0} GENX</p>
                </div>
                <div className="dash-card">
                  <h3>Today's Taps</h3>
                  <p className="dash-value" style={{ color: 'var(--neon-purple)', fontSize: '22px' }}>{mobileStats.todayTaps || 0}</p>
                </div>
                <div className="dash-card">
                  <h3>Total Mined</h3>
                  <p className="dash-value" style={{ color: 'var(--neon-pink)', fontSize: '22px' }}>{mobileStats.totalMined || 0} GENX</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'assets' && (
        <div className="dash-assets-tab">
          {userAssets.length === 0 ? (
            <div className="create-placeholder-inner">
              <div className="icon">+</div>
              <h3>No assets created yet</h3>
              <p>Create your first token, NFT, or meme coin</p>
              <a href="#create" className="btn btn-primary">Create Now</a>
            </div>
          ) : (
            <div className="asset-grid">
              {userAssets.map(asset => (
                <div key={asset.id} className="asset-card">
                  <span className={`asset-type-badge type-${asset.asset_type?.replace('_', '')}`}>
                    {asset.asset_type?.toUpperCase()}
                  </span>
                  <h4>{asset.name}</h4>
                  <p className="asset-symbol">{asset.symbol}</p>
                  {asset.denom && <p className="asset-denom">{asset.denom}</p>}
                  <p className="asset-id">ID: {asset.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="dash-referrals-tab">
          <div className="referral-info-card">
            <h3>Your Referral Link</h3>
            <p className="referral-desc">Share your address to earn speed boosts on referrals</p>
            <div className="referral-code-box">
              <input type="text" readOnly value={wallet.bech32Address} onClick={e => e.target.select()} />
              <button className="btn btn-small" onClick={() => navigator.clipboard.writeText(wallet.bech32Address)}>
                Copy
              </button>
            </div>
          </div>

          {referrals.length === 0 ? (
            <div className="create-placeholder-inner">
              <h3>No referrals yet</h3>
              <p>Share your address with others to earn referral rewards</p>
            </div>
          ) : (
            <div className="referrals-list">
              <h3>Your Referrals ({referrals.length})</h3>
              {referrals.map((r, i) => (
                <div key={i} className="referral-row">
                  <span className="referral-referee" title={r.referee}>
                    {r.referee?.slice(0, 10)}...{r.referee?.slice(-4)}
                  </span>
                  <span className="referral-boost">
                    Boost: {(parseFloat(r.referrer_speed_boost || '0.05') * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {totalStats && (
            <div className="referral-stats">
              <div className="stat">
                <span className="stat-value">{referrals.length}</span>
                <span className="stat-label">Referrals</span>
              </div>
              <div className="stat">
                <span className="stat-value">{totalStats.total_assets || 0}</span>
                <span className="stat-label">Total Assets</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
