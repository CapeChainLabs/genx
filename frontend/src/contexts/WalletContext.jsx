import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { GENX_CHAIN } from '../config/chain'

const WalletContext = createContext()
const WALLET_PREF_KEY = 'genx_wallet_type'

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState({
    address: '',
    bech32Address: '',
    isKeplr: false,
    isLeap: false,
    isConnected: false,
    balance: '0',
    loading: false,
    error: '',
  })
  const [chain] = useState(GENX_CHAIN)
  const [balances, setBalances] = useState([])

  const clearWalletState = useCallback(() => {
    setWallet({
      address: '',
      bech32Address: '',
      isKeplr: false,
      isLeap: false,
      isConnected: false,
      balance: '0',
      loading: false,
      error: '',
    })
    setBalances([])
  }, [])

  const getSigningClient = useCallback(async () => {
    const { SigningStargateClient } = await import('@cosmjs/stargate')
    const { GasPrice } = await import('@cosmjs/stargate')

    let walletType = wallet.isKeplr ? 'keplr' : 'leap'
    const offlineSigner = window[walletType].getOfflineSigner(chain.chainId)

    const client = await SigningStargateClient.connectWithSigner(
      chain.rpc,
      offlineSigner,
      { gasPrice: GasPrice.fromString('0.025ugenx') }
    )
    return client
  }, [wallet.isKeplr, wallet.isLeap, chain.chainId, chain.rpc])

  const getQueryClient = useCallback(async () => {
    const { StargateClient } = await import('@cosmjs/stargate')
    return await StargateClient.connect(chain.rpc)
  }, [chain.rpc])

  const fetchBalance = useCallback(async (address) => {
    try {
      const client = await getQueryClient()
      const balance = await client.getBalance(address, 'ugenx')
      const amount = (parseInt(balance.amount) / 1_000_000).toFixed(2)
      return amount
    } catch {
      return '0'
    }
  }, [getQueryClient])

  const fetchAllBalances = useCallback(async (address) => {
    try {
      const client = await getQueryClient()
      const coins = await client.getAllBalances(address)
      setBalances(coins.map(c => ({
        denom: c.denom,
        amount: (parseInt(c.amount) / 1_000_000).toString(),
        raw: c.amount,
      })))
    } catch {
      setBalances([])
    }
  }, [getQueryClient])

  const suggestChain = useCallback(async (walletType) => {
    const offlineSigner = window[walletType]
    if (!offlineSigner) {
      throw new Error(`${walletType} wallet not found. Please install the extension.`)
    }

    try {
      await offlineSigner.experimentalSuggestChain({
        chainId: chain.chainId,
        chainName: chain.chainName,
        rpc: chain.rpc,
        rest: chain.rest,
        bip44: chain.bip44,
        bech32Config: chain.bech32Config,
        currencies: chain.currencies,
        feeCurrencies: chain.feeCurrencies,
        stakeCurrency: chain.stakeCurrency,
        features: chain.features,
      })
    } catch (e) {
      if (e.message && !e.message.includes('already exists')) {
        console.warn('Chain suggestion warning:', e.message)
      }
    }
  }, [chain])

  const connectWallet = useCallback(async (walletType) => {
    if (walletType !== 'keplr' && walletType !== 'leap') {
      setWallet(prev => ({ ...prev, error: 'Unsupported wallet type' }))
      return
    }

    const offlineSigner = window[walletType]
    if (!offlineSigner) {
      setWallet(prev => ({
        ...prev,
        error: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} not found. Please install the browser extension.`
      }))
      return
    }

    setWallet(prev => ({ ...prev, loading: true, error: '' }))

    try {
      await suggestChain(walletType)
      await offlineSigner.enable(chain.chainId)
      const key = await offlineSigner.getKey(chain.chainId)

      localStorage.setItem(WALLET_PREF_KEY, walletType)

      const balance = await fetchBalance(key.bech32Address)
      await fetchAllBalances(key.bech32Address)

      setWallet({
        address: key.address.toString(),
        bech32Address: key.bech32Address,
        isKeplr: walletType === 'keplr',
        isLeap: walletType === 'leap',
        isConnected: true,
        balance,
        loading: false,
        error: '',
      })
    } catch (err) {
      setWallet(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to connect wallet',
      }))
    }
  }, [suggestChain, fetchBalance, fetchAllBalances, chain.chainId])

  const disconnect = useCallback(() => {
    localStorage.removeItem(WALLET_PREF_KEY)
    clearWalletState()
  }, [clearWalletState])

  const refreshBalance = useCallback(async () => {
    if (wallet.bech32Address) {
      const balance = await fetchBalance(wallet.bech32Address)
      await fetchAllBalances(wallet.bech32Address)
      setWallet(prev => ({ ...prev, balance }))
    }
  }, [wallet.bech32Address, fetchBalance, fetchAllBalances])

  const sendTokens = useCallback(async (recipient, amount, denom = 'ugenx') => {
    const client = await getSigningClient()
    const fee = {
      amount: [{ denom: 'ugenx', amount: '5000' }],
      gas: '200000',
    }
    const coins = [{ denom, amount: Math.round(parseFloat(amount) * 1_000_000).toString() }]
    const result = await client.sendTokens(
      wallet.bech32Address,
      recipient,
      coins,
      fee,
      ''
    )
    await refreshBalance()
    return result
  }, [getSigningClient, wallet.bech32Address, refreshBalance])

  useEffect(() => {
    const pref = localStorage.getItem(WALLET_PREF_KEY)
    if (pref && window[pref]) {
      connectWallet(pref).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!wallet.isConnected) return

    const handleKeplrChange = async () => {
      const key = await window.keplr.getKey(chain.chainId)
      const balance = await fetchBalance(key.bech32Address)
      await fetchAllBalances(key.bech32Address)
      setWallet(prev => ({
        ...prev,
        address: key.address.toString(),
        bech32Address: key.bech32Address,
        balance,
      }))
    }

    const handleLeapChange = async () => {
      const key = await window.leap.getKey(chain.chainId)
      const balance = await fetchBalance(key.bech32Address)
      await fetchAllBalances(key.bech32Address)
      setWallet(prev => ({
        ...prev,
        address: key.address.toString(),
        bech32Address: key.bech32Address,
        balance,
      }))
    }

    window.addEventListener('keplr_keystorechange', handleKeplrChange)
    window.addEventListener('leap_keystorechange', handleLeapChange)

    return () => {
      window.removeEventListener('keplr_keystorechange', handleKeplrChange)
      window.removeEventListener('leap_keystorechange', handleLeapChange)
    }
  }, [wallet.isConnected, chain.chainId, fetchBalance, fetchAllBalances])

  return (
    <WalletContext.Provider value={{
      wallet,
      balances,
      connectWallet,
      disconnect,
      refreshBalance,
      sendTokens,
      getSigningClient,
      getQueryClient,
      chain,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}
