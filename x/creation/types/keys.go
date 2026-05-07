package types

const (
	ModuleName = "creation"
	StoreKey   = ModuleName
	MemStore   = "mem_creation"

	QuerierRoute = ModuleName
	RouterKey    = ModuleName

	QueryParams          = "params"
	QueryAssetById       = "asset-by-id"
	QueryAssetsByCreator = "assets-by-creator"
	QueryAssets          = "assets"
	QueryReferral        = "referral"
	QueryTotalAssets     = "total-assets"

	EventTypeCreateToken         = "create_token"
	EventTypeCreateNftCollection = "create_nft_collection"
	EventTypeCreateMemeCoin      = "create_meme_coin"
	EventTypeRegisterReferral    = "register_referral"

	AttributeKeyDenom        = "denom"
	AttributeKeyCreator      = "creator"
	AttributeKeyAssetId      = "asset_id"
	AttributeKeyClassId      = "class_id"
	AttributeKeyBondingCurve = "bonding_curve_type"
	AttributeKeyReferrer     = "referrer"
	AttributeKeyReferee      = "referee"
	AttributeKeySpeedBoost   = "speed_boost"

	AssetTypeToken    = "token"
	AssetTypeNFT      = "nft"
	AssetTypeMemeCoin = "meme_coin"
	AssetTypeCustom   = "custom"

	BondingCurveLinear      = "linear"
	BondingCurveExponential = "exponential"
	BondingCurveLogarithmic = "logarithmic"
	BondingCurveSigmoid     = "sigmoid"

	ReferralBoostDefault  = "0.05"
	ReferralRewardDefault = "0.02"
)
