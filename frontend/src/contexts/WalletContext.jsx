import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { GENX_CHAIN, LEAP_SUGGEST_CHAIN } from '../config/chain'

const WalletContext = createContext()

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState({
    address: '',
    bech32Address: '',
    isKeplr: false,
    isLeap: false,
    isConnected: false,
    balance: '',
    loading: false,
    error: '',
  })

  const suggestChain = useCallback(async (walletType) => {
    const offlineSigner = window[walletType]
    if (!offlineSigner) {
      throw new Error(`${walletType} wallet not found. Please install the extension.`)
    }

    try {
      await offlineSigner.experimentalSuggestChain(LEAP_SUGGEST_CHAIN)
    } catch (e) {
      if (e.message && !e.message.includes('already exists')) {
        console.warn('Chain suggestion warning:', e.message)
      }
    }
  }, [])

  const getSigningClient = useCallback(async () => {
    const { SigningStargateClient } = await import('@cosmjs/stargate')
    const { GasPrice } = await import('@cosmjs/stargate')

    let walletType = wallet.isKeplr ? 'keplr' : 'leap'
    const offlineSigner = window[walletType].getOfflineSigner(GENX_CHAIN.chainId)

    const client = await SigningStargateClient.connectWithSigner(
      GENX_CHAIN.rpc,
      offlineSigner,
      {
        gasPrice: GasPrice.fromString('0ugenx'),
      }
    )
    return client
  }, [wallet.isKeplr, wallet.isLeap])

  const getQueryClient = useCallback(async () => {
    const { StargateClient } = await import('@cosmjs/stargate')
    return await StargateClient.connect(GENX_CHAIN.rpc)
  }, [])

  const fetchBalance = useCallback(async (address) => {
    try {
      const client = await getQueryClient()
      const balance = await client.getBalance(address, GENX_CHAIN.feeCurrencies[0].coinMinimalDenom)
      const amount = (parseInt(balance.amount) / Math.pow(10, GENX_CHAIN.feeCurrencies[0].coinDecimals)).toFixed(2)
      return amount
    } catch {
      return '0'
    }
  }, [getQueryClient])

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

      await offlineSigner.enable(GENX_CHAIN.chainId)

      const key = await offlineSigner.getKey(GENX_CHAIN.chainId)

      const balance = await fetchBalance(key.bech32Address)

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
  }, [suggestChain, fetchBalance])

  const disconnect = useCallback(() => {
    setWallet({
      address: '',
      bech32Address: '',
      isKeplr: false,
      isLeap: false,
      isConnected: false,
      balance: '',
      loading: false,
      error: '',
    })
  }, [])

  const refreshBalance = useCallback(async () => {
    if (wallet.bech32Address) {
      const balance = await fetchBalance(wallet.bech32Address)
      setWallet(prev => ({ ...prev, balance }))
    }
  }, [wallet.bech32Address, fetchBalance])

  const sendTokens = useCallback(async (recipient, amount, denom) => {
    const client = await getSigningClient()
    const fee = {
      amount: [{ denom: 'ugenx', amount: '0' }],
      gas: '200000',
    }
    const coins = [{ denom: denom || 'ugenx', amount: Math.round(amount * 1000000).toString() }]
    const result = await client.sendTokens(
      wallet.bech32Address,
      recipient,
      coins,
      fee,
      ''
    )
    return result
  }, [getSigningClient, wallet.bech32Address])

  useEffect(() => {
    const checkAutoConnect = async () => {
      if (window.keplr) {
        try {
          await connectWallet('keplr')
          return
        } catch {
          // Silent fail
        }
      }
      if (window.leap) {
        try {
          await connectWallet('leap')
        } catch {
          // Silent fail
        }
      }
    }
    // Don't auto-connect on mount, let user choose
  }, [])

  return (
    <WalletContext.Provider value={{
      wallet,
      connectWallet,
      disconnect,
      refreshBalance,
      sendTokens,
      getSigningClient,
      getQueryClient,
      chain: GENX_CHAIN,
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
