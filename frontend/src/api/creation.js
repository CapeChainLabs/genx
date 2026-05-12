const REST_BASE = '/genx/creation/v1'

const CREATION_MSG_TYPES = {
  MsgCreateToken: '/genx.creation.v1.MsgCreateToken',
  MsgCreateNftCollection: '/genx.creation.v1.MsgCreateNftCollection',
  MsgCreateMemeCoin: '/genx.creation.v1.MsgCreateMemeCoin',
  MsgRegisterReferral: '/genx.creation.v1.MsgRegisterReferral',
}

function encodeRoyalty(value) {
  if (!value) return '0.000000000000000000'
  const num = typeof value === 'number' ? value : parseFloat(value)
  return num.toFixed(18)
}

export async function createToken(sender, formData, getSigningClient) {
  const client = await getSigningClient()

  const msg = {
    typeUrl: CREATION_MSG_TYPES.MsgCreateToken,
    value: {
      sender,
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description || '',
      initialSupply: formData.initialSupply.toString(),
      decimals: BigInt(formData.decimals || 18),
      royaltyPercentage: encodeRoyalty(formData.royaltyPercentage || 0.05),
      liquidationProtection: formData.liquidationProtection ?? true,
      referrer: formData.referralCode || '',
    },
  }

  const fee = {
    amount: [{ denom: 'ugenx', amount: '5000' }],
    gas: '500000',
  }

  return await client.signAndBroadcast(sender, [msg], fee, '')
}

export async function createNftCollection(sender, formData, getSigningClient) {
  const client = await getSigningClient()

  const msg = {
    typeUrl: CREATION_MSG_TYPES.MsgCreateNftCollection,
    value: {
      sender,
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description || '',
      metadataUri: formData.metadataUri || '',
      royaltyPercentage: encodeRoyalty(formData.royaltyPercentage || 0.1),
      maxSupply: BigInt(formData.maxSupply || 0),
      liquidationProtection: formData.liquidationProtection ?? true,
      referrer: formData.referralCode || '',
    },
  }

  const fee = {
    amount: [{ denom: 'ugenx', amount: '5000' }],
    gas: '500000',
  }

  return await client.signAndBroadcast(sender, [msg], fee, '')
}

export async function createMemeCoin(sender, formData, getSigningClient) {
  const client = await getSigningClient()

  const msg = {
    typeUrl: CREATION_MSG_TYPES.MsgCreateMemeCoin,
    value: {
      sender,
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description || '',
      initialSupply: formData.initialSupply.toString(),
      decimals: BigInt(formData.decimals || 18),
      bondingCurveType: formData.bondingCurve || 'linear',
      launchPrice: encodeRoyalty(formData.launchPrice || 0.001),
      liquidationProtection: formData.liquidationProtection ?? false,
      referrer: formData.referralCode || '',
    },
  }

  const fee = {
    amount: [{ denom: 'ugenx', amount: '5000' }],
    gas: '500000',
  }

  return await client.signAndBroadcast(sender, [msg], fee, '')
}

export async function registerReferral(referrer, referee, getSigningClient) {
  const client = await getSigningClient()

  const msg = {
    typeUrl: CREATION_MSG_TYPES.MsgRegisterReferral,
    value: {
      referrer,
      referee,
    },
  }

  const fee = {
    amount: [{ denom: 'ugenx', amount: '2000' }],
    gas: '200000',
  }

  return await client.signAndBroadcast(referrer, [msg], fee, '')
}

export async function queryTotalAssets(restUrl) {
  const response = await fetch(`${restUrl}${REST_BASE}/total_assets`)
  if (!response.ok) {
    throw new Error(`Failed to query total assets: ${response.status}`)
  }
  return response.json()
}

export async function queryAssetsByCreator(restUrl, creator) {
  const response = await fetch(`${restUrl}${REST_BASE}/assets/creator/${encodeURIComponent(creator)}`)
  if (!response.ok) {
    return []
  }
  const data = await response.json()
  return data.assets || []
}

export async function queryAssetById(restUrl, id) {
  const response = await fetch(`${restUrl}${REST_BASE}/assets/${encodeURIComponent(id)}`)
  if (!response.ok) {
    return null
  }
  const data = await response.json()
  return data.asset
}

export async function queryAllAssets(restUrl, assetType = '') {
  const params = assetType ? `?asset_type=${encodeURIComponent(assetType)}` : ''
  const response = await fetch(`${restUrl}${REST_BASE}/assets${params}`)
  if (!response.ok) {
    return []
  }
  const data = await response.json()
  return data.assets || []
}

export async function queryParams(restUrl) {
  const response = await fetch(`${restUrl}${REST_BASE}/params`)
  if (!response.ok) {
    throw new Error(`Failed to query params: ${response.status}`)
  }
  const data = await response.json()
  return data.params
}

export async function queryReferral(restUrl, referrer, referee) {
  const response = await fetch(`${restUrl}${REST_BASE}/referrals/${encodeURIComponent(referrer)}/${encodeURIComponent(referee)}`)
  if (!response.ok) {
    return null
  }
  const data = await response.json()
  return data.referral
}

export async function queryReferralsByReferrer(restUrl, referrer) {
  const response = await fetch(`${restUrl}${REST_BASE}/referrals/${encodeURIComponent(referrer)}`)
  if (!response.ok) {
    return []
  }
  const data = await response.json()
  return data.referrals || []
}
