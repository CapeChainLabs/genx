import { useState, useEffect, useRef, useCallback } from 'react'
import { useWallet } from '../contexts/WalletContext.jsx'

const STORAGE_KEY = 'genx_mining'
const MAX_ENERGY = 100
const TAP_REWARD = 0.5
const PREMIUM_TAP_REWARD = 1.0
const DAILY_BONUS = 10
const PREMIUM_DAILY_BONUS = 20
const ENERGY_REGEN_PER_MIN = 1

function loadMiningData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { balance: 0, taps: 0, energy: MAX_ENERGY, lastClaim: null, streak: 0, isPremium: false }
}

function saveMiningData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function Mining() {
  const { wallet } = useWallet()
  const [data, setData] = useState(loadMiningData)
  const [tapAnim, setTapAnim] = useState(false)
  const [particles, setParticles] = useState([])
  const [timeLeft, setTimeLeft] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    saveMiningData(data)
  }, [data])

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.energy >= MAX_ENERGY) return prev
        const newEnergy = Math.min(MAX_ENERGY, prev.energy + ENERGY_REGEN_PER_MIN)
        return { ...prev, energy: newEnergy }
      })
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!data.lastClaim) { setTimeLeft(''); return }
    const update = () => {
      const diff = 24 * 60 * 60 * 1000 - (Date.now() - data.lastClaim)
      if (diff <= 0) { setTimeLeft('Ready!'); return }
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${h}h ${m}m`)
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [data.lastClaim])

  const handleTap = useCallback(() => {
    if (data.energy <= 0) return

    const reward = data.isPremium ? PREMIUM_TAP_REWARD : TAP_REWARD
    setData(prev => ({
      ...prev,
      balance: prev.balance + reward,
      taps: prev.taps + 1,
      energy: Math.max(0, prev.energy - 1),
    }))

    setTapAnim(true)
    setTimeout(() => setTapAnim(false), 150)

    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const x = Math.random() * 60 - 30
      const y = Math.random() * -60 - 20
      setParticles(prev => [...prev.slice(-8), { id: Date.now() + Math.random(), x, y, value: `+${reward}` }])
    }

    if (data.energy - 1 <= 0) {
      setData(prev => ({ ...prev, lastClaim: Date.now() }))
    }
  }, [data.energy, data.isPremium])

  const claimDaily = useCallback(() => {
    const now = Date.now()
    if (data.lastClaim && now - data.lastClaim < 24 * 60 * 60 * 1000) return

    const bonus = data.isPremium ? PREMIUM_DAILY_BONUS : DAILY_BONUS
    setData(prev => ({
      ...prev,
      balance: prev.balance + bonus,
      energy: MAX_ENERGY,
      taps: 0,
      lastClaim: now,
      streak: prev.streak + 1,
    }))
  }, [data.isPremium, data.lastClaim])

  const canClaimDaily = !data.lastClaim || Date.now() - data.lastClaim >= 24 * 60 * 60 * 1000
  const energyPct = (data.energy / MAX_ENERGY) * 100

  return (
    <section id="mining" className="mining-section">
      <div className="mining-container" ref={containerRef}>
        <div className="mining-header">
          <div className="mining-title-badge">
            <span className="mining-dot" />
            Tap to Earn
          </div>
          <h2>
            <span className="gradient-text">GenX Mining</span>
          </h2>
          {data.streak > 0 && (
            <div className="mining-streak">
              🔥 {data.streak} Day Streak
            </div>
          )}
        </div>

        <div className="mining-balance-card">
          <span className="mining-balance-label">MINING BALANCE</span>
          <span className="mining-balance-value">{data.balance.toFixed(1)}</span>
          <span className="mining-balance-denom">GENX</span>
          <span className="mining-balance-usd">≈ ${(data.balance * 0.10).toFixed(2)}</span>
        </div>

        <div className="mining-tap-area" onClick={handleTap}>
          <div className={`mining-button ${tapAnim ? 'mining-button-tap' : ''} ${data.energy <= 0 ? 'mining-button-empty' : ''}`}>
            <div className="mining-button-inner">
              <span className="mining-button-symbol">G</span>
              <span className="mining-button-label">{data.energy > 0 ? 'TAP TO MINE' : 'ENERGY DEPLETED'}</span>
              <span className="mining-button-reward">+{data.isPremium ? PREMIUM_TAP_REWARD : TAP_REWARD} GENX</span>
            </div>
          </div>

          {particles.map(p => (
            <div key={p.id} className="mining-particle" style={{ '--dx': `${p.x}px`, '--dy': `${p.y}px` }}>
              {p.value}
            </div>
          ))}
        </div>

        <div className="mining-energy">
          <div className="mining-energy-bar">
            <div className="mining-energy-fill" style={{ width: `${energyPct}%` }} />
          </div>
          <div className="mining-energy-row">
            <span>⚡ {data.energy}/{MAX_ENERGY} Energy</span>
            {data.isPremium && <span className="mining-premium-badge">⭐ 2x Rewards</span>}
          </div>
        </div>

        <div className="mining-daily" onClick={canClaimDaily ? claimDaily : undefined}>
          <div className={`mining-daily-btn ${!canClaimDaily ? 'mining-daily-disabled' : ''}`}>
            <span className="mining-daily-icon">{canClaimDaily ? '🎁' : '⏰'}</span>
            <span>{canClaimDaily ? `Claim Daily Bonus (+${data.isPremium ? PREMIUM_DAILY_BONUS : DAILY_BONUS} GENX)` : `Next bonus: ${timeLeft}`}</span>
          </div>
        </div>

        <div className="mining-stats">
          <div className="mining-stat">
            <span className="mining-stat-value">{data.taps}</span>
            <span className="mining-stat-label">Today</span>
          </div>
          <div className="mining-stat">
            <span className="mining-stat-value">{data.balance.toFixed(1)}</span>
            <span className="mining-stat-label">Balance</span>
          </div>
          <div className="mining-stat">
            <span className="mining-stat-value">{data.streak}</span>
            <span className="mining-stat-label">Streak</span>
          </div>
        </div>
      </div>
    </section>
  )
}
