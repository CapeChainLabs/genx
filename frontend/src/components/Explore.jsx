import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext.jsx'
import { queryAllAssets, queryTotalAssets, queryParams } from '../api/creation.js'

const ASSET_TYPES = [
  { value: '', label: 'All Assets' },
  { value: 'token', label: 'Tokens' },
  { value: 'nft', label: 'NFTs' },
  { value: 'meme_coin', label: 'Meme Coins' },
]

export function Explore() {
  const { chain } = useWallet()
  const [assets, setAssets] = useState([])
  const [stats, setStats] = useState(null)
  const [params, setParams] = useState(null)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState(null)

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    setLoading(true)
    try {
      const [allAssets, totalStats, chainParams] = await Promise.all([
        queryAllAssets(chain.rest, filter),
        queryTotalAssets(chain.rest),
        queryParams(chain.rest).catch(() => null),
      ])
      setAssets(allAssets)
      setStats(totalStats)
      setParams(chainParams)
    } catch (e) {
      console.log('Explore load error:', e)
    }
    setLoading(false)
  }

  const filtered = assets.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    return a.name?.toLowerCase().includes(q) ||
           a.symbol?.toLowerCase().includes(q) ||
           a.creator?.toLowerCase().includes(q) ||
           a.id?.includes(q)
  })

  return (
    <section id="explore" className="explore-section">
      <h2>
        <span className="gradient-text">Explore Assets</span>
      </h2>
      <p className="section-desc">Discover tokens, NFTs, and meme coins created on GenX</p>

      {stats && (
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">{stats.total_assets || 0}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.tokens || 0}</span>
            <span className="stat-label">Tokens</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.nfts || 0}</span>
            <span className="stat-label">NFTs</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.meme_coins || 0}</span>
            <span className="stat-label">Meme</span>
          </div>
        </div>
      )}

      <div className="explore-controls">
        <div className="explore-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, symbol, or creator..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="explore-tabs">
          {ASSET_TYPES.map(t => (
            <button
              key={t.value}
              className={`tab ${filter === t.value ? 'active' : ''}`}
              onClick={() => setFilter(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="explore-loading">
          <div className="spinner" />
          <p>Loading assets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="explore-empty">
          <div className="explore-empty-icon">◆</div>
          <h3>No assets found</h3>
          <p>{search ? 'Try a different search term' : 'Be the first to create one!'}</p>
          <a href="#create" className="btn btn-primary">Create Asset</a>
        </div>
      ) : (
        <div className="asset-grid explore-grid">
          {filtered.map(asset => (
            <div key={asset.id} className="asset-card explore-card" onClick={() => setSelectedAsset(asset)}>
              <div className="explore-card-header">
                <span className={`asset-type-badge type-${asset.asset_type?.replace('_', '')}`}>
                  {asset.asset_type === 'meme_coin' ? 'MEME' : asset.asset_type?.toUpperCase()}
                </span>
              </div>
              <div className="explore-card-body">
                <h4>{asset.name || 'Unnamed'}</h4>
                <p className="asset-symbol">{asset.symbol}</p>
                {asset.denom && <p className="asset-denom" title={asset.denom}>{asset.denom}</p>}
              </div>
              <div className="explore-card-footer">
                <span className="explore-creator" title={asset.creator}>
                  {asset.creator?.slice(0, 8)}...{asset.creator?.slice(-4)}
                </span>
                <span className="explore-date">
                  {asset.created_at ? new Date(asset.created_at * 1000).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAsset && (
        <div className="explore-modal-overlay" onClick={() => setSelectedAsset(null)}>
          <div className="explore-modal" onClick={e => e.stopPropagation()}>
            <button className="explore-modal-close" onClick={() => setSelectedAsset(null)}>✕</button>
            <div className="explore-modal-header">
              <h3>{selectedAsset.name || 'Unnamed'}</h3>
              <span className={`asset-type-badge type-${selectedAsset.asset_type?.replace('_', '')}`}>
                {selectedAsset.asset_type?.toUpperCase()}
              </span>
            </div>

            <div className="explore-modal-body">
              {selectedAsset.symbol && (
                <div className="explore-modal-row">
                  <span className="explore-modal-label">Symbol</span>
                  <span className="explore-modal-value">{selectedAsset.symbol}</span>
                </div>
              )}
              {selectedAsset.description && (
                <div className="explore-modal-row">
                  <span className="explore-modal-label">Description</span>
                  <span className="explore-modal-value">{selectedAsset.description}</span>
                </div>
              )}
              {selectedAsset.denom && (
                <div className="explore-modal-row">
                  <span className="explore-modal-label">Denom</span>
                  <span className="explore-modal-value">{selectedAsset.denom}</span>
                </div>
              )}
              <div className="explore-modal-row">
                <span className="explore-modal-label">Creator</span>
                <span className="explore-modal-value">{selectedAsset.creator}</span>
              </div>
              <div className="explore-modal-row">
                <span className="explore-modal-label">Created</span>
                <span className="explore-modal-value">
                  {selectedAsset.created_at ? new Date(selectedAsset.created_at * 1000).toLocaleString() : 'N/A'}
                </span>
              </div>
              {selectedAsset.royalty_percentage && selectedAsset.royalty_percentage !== '0.000000000000000000' && (
                <div className="explore-modal-row">
                  <span className="explore-modal-label">Royalty</span>
                  <span className="explore-modal-value">{(parseFloat(selectedAsset.royalty_percentage) * 100).toFixed(1)}%</span>
                </div>
              )}
              <div className="explore-modal-row">
                <span className="explore-modal-label">Liq. Protection</span>
                <span className="explore-modal-value">{selectedAsset.liquidation_protection ? '✅ Enabled' : '❌ Disabled'}</span>
              </div>
            </div>

            {params && (
              <div className="explore-modal-footer">
                <span>Fee: {params.token_creation_fee?.amount || 0} {params.token_creation_fee?.denom || 'GENX'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
