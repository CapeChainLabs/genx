export const GENX_CHAIN = {
  chainId: 'genx',
  chainName: 'GenX',
  rpc: 'http://92.4.128.172:26657',
  rest: 'http://92.4.128.172:1317',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'genx',
    bech32PrefixAccPub: 'genxpub',
    bech32PrefixValAddr: 'genxvaloper',
    bech32PrefixValPub: 'genxvaloperpub',
    bech32PrefixConsAddr: 'genxvalcons',
    bech32PrefixConsPub: 'genxvalconspub',
  },
  currencies: [
    {
      coinDenom: 'GENX',
      coinMinimalDenom: 'ugenx',
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'GENX',
      coinMinimalDenom: 'ugenx',
      coinDecimals: 6,
      gasPriceStep: {
        low: 0,
        average: 0.025,
        high: 0.04,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: 'GENX',
    coinMinimalDenom: 'ugenx',
    coinDecimals: 6,
  },
  features: ['stargate', 'ibc-transfer', 'cosmwasm'],
}

export const LEAP_SUGGEST_CHAIN = {
  chainId: GENX_CHAIN.chainId,
  chainName: GENX_CHAIN.chainName,
  rpc: GENX_CHAIN.rpc,
  rest: GENX_CHAIN.rest,
  bip44: GENX_CHAIN.bip44,
  bech32Config: GENX_CHAIN.bech32Config,
  currencies: GENX_CHAIN.currencies,
  feeCurrencies: GENX_CHAIN.feeCurrencies,
  stakeCurrency: GENX_CHAIN.stakeCurrency,
  features: GENX_CHAIN.features,
}
