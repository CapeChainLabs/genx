import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext.jsx'
import {
  createToken,
  createNftCollection,
  createMemeCoin,
  queryTotalAssets,
  queryAssetsByCreator,
} from '../api/creation.js'

export function CreateMode() {
  const { wallet, chain, getSigningClient } = useWallet()
  const [activeTab, setActiveTab] = useState('token')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [totalAssets, setTotalAssets] = useState(null)
  const [userAssets, setUserAssets] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: '18',
    initialSupply: '1000000',
    description: '',
    bondingCurve: 'linear',
    launchPrice: '0.001',
    royaltyPercentage: '',
    maxSupply: '',
    metadataUri: '',
    liquidationProtection: true,
    referralCode: '',
  })

  useEffect(() => {
    if (wallet.isConnected) {
      loadStats()
    }
  }, [wallet.isConnected, wallet.bech32Address])

  const loadStats = async () => {
    try {
      const stats = await queryTotalAssets(chain.rest)
      setTotalAssets(stats)
      if (wallet.bech32Address) {
        const assets = await queryAssetsByCreator(chain.rest, wallet.bech32Address)
        setUserAssets(assets)
      }
    } catch (e) {
      console.log('Stats load error:', e)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleCreateToken = async (e) => {
    e.preventDefault()
    if (!wallet.isConnected) return

    setLoading(true)
    setResult(null)

    try {
      const txResult = await createToken(
        wallet.bech32Address,
        formData,
        getSigningClient
      )

      setResult({
        success: true,
        txHash: txResult.transactionHash,
        message: `Token ${formData.symbol} created successfully!`,
      })
      setFormData(prev => ({ ...prev, name: '', symbol: '', description: '' }))
      loadStats()
    } catch (err) {
      setResult({
        success: false,
        message: err.message || 'Failed to create token',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNft = async (e) => {
    e.preventDefault()
    if (!wallet.isConnected) return

    setLoading(true)
    setResult(null)

    try {
      const txResult = await createNftCollection(
        wallet.bech32Address,
        formData,
        getSigningClient
      )

      setResult({
        success: true,
        txHash: txResult.transactionHash,
        message: `NFT Collection ${formData.symbol} created!`,
      })
      setFormData(prev => ({ ...prev, name: '', symbol: '', description: '', metadataUri: '' }))
      loadStats()
    } catch (err) {
      setResult({
        success: false,
        message: err.message || 'Failed to create NFT collection',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeme = async (e) => {
    e.preventDefault()
    if (!wallet.isConnected) return

    setLoading(true)
    setResult(null)

    try {
      const txResult = await createMemeCoin(
        wallet.bech32Address,
        formData,
        getSigningClient
      )

      setResult({
        success: true,
        txHash: txResult.transactionHash,
        message: `Meme coin ${formData.symbol} launched!`,
      })
      setFormData(prev => ({ ...prev, name: '', symbol: '', description: '' }))
      loadStats()
    } catch (err) {
      setResult({
        success: false,
        message: err.message || 'Failed to create meme coin',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!wallet.isConnected) {
    return (
      <section id="create" className="create-section">
        <h2>
          <span className="gradient-text">Creation Mode</span>
        </h2>
        <p className="section-desc">Launch your digital asset in seconds</p>
        <div className="create-placeholder">
          <p>Connect your wallet to start creating assets</p>
          <a href="#top" className="btn btn-primary">Connect Wallet</a>
        </div>
      </section>
    )
  }

  return (
    <section id="create" className="create-section">
      <h2>
        <span className="gradient-text">Creation Mode</span>
      </h2>
      <p className="section-desc">Launch your digital asset in seconds</p>

      {totalAssets && (
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">{totalAssets.total_assets || 0}</span>
            <span className="stat-label">Total Assets</span>
          </div>
          <div className="stat">
            <span className="stat-value">{totalAssets.tokens || 0}</span>
            <span className="stat-label">Tokens</span>
          </div>
          <div className="stat">
            <span className="stat-value">{totalAssets.nfts || 0}</span>
            <span className="stat-label">NFTs</span>
          </div>
          <div className="stat">
            <span className="stat-value">{totalAssets.meme_coins || 0}</span>
            <span className="stat-label">Meme Coins</span>
          </div>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'token' ? 'active' : ''}`}
          onClick={() => setActiveTab('token')}
        >
          Token
        </button>
        <button
          className={`tab ${activeTab === 'nft' ? 'active' : ''}`}
          onClick={() => setActiveTab('nft')}
        >
          NFT
        </button>
        <button
          className={`tab ${activeTab === 'meme' ? 'active' : ''}`}
          onClick={() => setActiveTab('meme')}
        >
          Meme Coin
        </button>
      </div>

      <div className="create-form">
        {activeTab === 'token' && (
          <form onSubmit={handleCreateToken}>
            <div className="form-grid">
              <div className="form-group">
                <label>Token Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="My Awesome Token"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Symbol</label>
                <input
                  type="text"
                  name="symbol"
                  placeholder="MAT"
                  maxLength={12}
                  value={formData.symbol}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Initial Supply</label>
                <input
                  type="number"
                  name="initialSupply"
                  placeholder="1000000"
                  value={formData.initialSupply}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Decimals</label>
                <input
                  type="number"
                  name="decimals"
                  placeholder="18"
                  value={formData.decimals}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Royalty %</label>
                <input
                  type="number"
                  name="royaltyPercentage"
                  placeholder="0.05"
                  step="0.01"
                  value={formData.royaltyPercentage}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '4px' }}>
              <label>Description</label>
              <textarea
                name="description"
                placeholder="What is this token for?"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="liquidationProtection"
                  checked={formData.liquidationProtection}
                  onChange={handleInputChange}
                />
                Enable Liquidation Protection
              </label>
            </div>
            <div className="form-group">
              <label>Referral Code (optional)</label>
              <input
                type="text"
                name="referralCode"
                placeholder="Enter referrer address"
                value={formData.referralCode}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-footer">
              <div className="fee-preview">
                <span>Estimated fee:</span>
                <strong>~0 GENX</strong>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create {formData.symbol || 'Token'}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'nft' && (
          <form onSubmit={handleCreateNft}>
            <div className="form-grid">
              <div className="form-group">
                <label>Collection Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="My NFT Collection"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Symbol</label>
                <input
                  type="text"
                  name="symbol"
                  placeholder="MNFT"
                  maxLength={12}
                  value={formData.symbol}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Max Supply</label>
                <input
                  type="number"
                  name="maxSupply"
                  placeholder="10000"
                  value={formData.maxSupply}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Royalty %</label>
                <input
                  type="number"
                  name="royaltyPercentage"
                  placeholder="0.1"
                  step="0.01"
                  value={formData.royaltyPercentage}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '4px' }}>
              <label>Metadata URI</label>
              <input
                type="url"
                name="metadataUri"
                placeholder="https://example.com/metadata.json"
                value={formData.metadataUri}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group" style={{ marginTop: '4px' }}>
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Describe your NFT collection"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="liquidationProtection"
                  checked={formData.liquidationProtection}
                  onChange={handleInputChange}
                />
                Enable Liquidation Protection
              </label>
            </div>
            <div className="form-footer">
              <div className="fee-preview">
                <span>Estimated fee:</span>
                <strong>~0 GENX</strong>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create {formData.symbol || 'NFT'}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'meme' && (
          <form onSubmit={handleCreateMeme}>
            <div className="form-grid">
              <div className="form-group">
                <label>Meme Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="DogeCoin 2.0"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Symbol</label>
                <input
                  type="text"
                  name="symbol"
                  placeholder="DOGE2"
                  maxLength={12}
                  value={formData.symbol}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Initial Supply</label>
                <input
                  type="number"
                  name="initialSupply"
                  placeholder="1000000000"
                  value={formData.initialSupply}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Decimals</label>
                <input
                  type="number"
                  name="decimals"
                  placeholder="18"
                  value={formData.decimals}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Bonding Curve</label>
                <select
                  name="bondingCurve"
                  value={formData.bondingCurve}
                  onChange={handleInputChange}
                >
                  <option value="linear">Linear</option>
                  <option value="exponential">Exponential</option>
                  <option value="logarithmic">Logarithmic</option>
                  <option value="sigmoid">Sigmoid</option>
                </select>
              </div>
              <div className="form-group">
                <label>Launch Price</label>
                <input
                  type="number"
                  name="launchPrice"
                  placeholder="0.001"
                  step="0.0001"
                  value={formData.launchPrice}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '4px' }}>
              <label>Description</label>
              <textarea
                name="description"
                placeholder="What makes this meme special?"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="liquidationProtection"
                  checked={formData.liquidationProtection}
                  onChange={handleInputChange}
                />
                Enable Liquidation Protection
              </label>
            </div>
            <div className="form-footer">
              <div className="fee-preview">
                <span>Estimated fee:</span>
                <strong>~0 GENX</strong>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    Launching...
                  </>
                ) : (
                  <>
                    Launch {formData.symbol || 'Meme'}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            <p>{result.message}</p>
            {result.txHash && (
              <a href={`https://explorer.genx.io/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer">
                View Transaction: {result.txHash.slice(0, 20)}...
              </a>
            )}
          </div>
        )}
      </div>

      {userAssets.length > 0 && (
        <div className="user-assets">
          <h3>Your Created Assets</h3>
          <div className="asset-grid">
            {userAssets.map((asset) => (
              <div key={asset.id} className="asset-card">
                <div className="asset-type">{asset.asset_type}</div>
                <h4>{asset.name}</h4>
                <p className="asset-symbol">{asset.symbol}</p>
                {asset.denom && <p className="asset-denom">{asset.denom}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
