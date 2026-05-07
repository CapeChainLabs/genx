package keeper

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/capechain/genx/x/creation/types"

	"cosmossdk.io/log"
	storetypes "cosmossdk.io/store/types"
	sdkmath "cosmossdk.io/math"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

var (
	ParamsKey       = []byte{0x01}
	AssetCounterKey = []byte{0x02}
	ReferralPrefix  = []byte{0x03}
	AssetPrefix     = []byte{0x04}
)

type Keeper struct {
	cdc          codec.BinaryCodec
	storeKey     storetypes.StoreKey

	bankKeeper   types.BankKeeper
	tokenFactory types.TokenFactoryKeeper
	nftKeeper    types.NFTKeeper

	authority string
}

func NewKeeper(
	cdc codec.BinaryCodec,
	storeKey storetypes.StoreKey,
	bankKeeper types.BankKeeper,
	tokenFactory types.TokenFactoryKeeper,
	nftKeeper types.NFTKeeper,
	authority string,
) *Keeper {
	if _, err := sdk.AccAddressFromBech32(authority); err != nil {
		panic(fmt.Errorf("invalid authority address: %w", err))
	}

	return &Keeper{
		cdc:          cdc,
		storeKey:     storeKey,
		bankKeeper:   bankKeeper,
		tokenFactory: tokenFactory,
		nftKeeper:    nftKeeper,
		authority:    authority,
	}
}

func (k Keeper) Logger(ctx sdk.Context) log.Logger {
	return ctx.Logger().With("module", fmt.Sprintf("x/%s", types.ModuleName))
}

func marshalJSON(v interface{}) []byte {
	bz, _ := json.Marshal(v)
	return bz
}

func unmarshalJSON(bz []byte, v interface{}) error {
	return json.Unmarshal(bz, v)
}

func (k Keeper) GetParams(ctx sdk.Context) types.Params {
	store := ctx.KVStore(k.storeKey)
	bz := store.Get(ParamsKey)
	if bz == nil {
		p := types.DefaultParams()
		return *p
	}
	var params types.Params
	unmarshalJSON(bz, &params)
	return params
}

func (k Keeper) SetParams(ctx sdk.Context, params types.Params) {
	store := ctx.KVStore(k.storeKey)
	store.Set(ParamsKey, marshalJSON(params))
}

func (k Keeper) InitGenesis(ctx sdk.Context, gs types.GenesisState) {
	if gs.Params != nil {
		k.SetParams(ctx, *gs.Params)
	}
}

func (k Keeper) ExportGenesis(ctx sdk.Context) types.GenesisState {
	params := k.GetParams(ctx)
	return types.GenesisState{
		Params: &params,
	}
}

func (k Keeper) GetNextAssetID(ctx sdk.Context) uint64 {
	store := ctx.KVStore(k.storeKey)
	bz := store.Get(AssetCounterKey)
	if bz == nil {
		return 1
	}
	return sdk.BigEndianToUint64(bz)
}

func (k Keeper) SetNextAssetID(ctx sdk.Context, id uint64) {
	store := ctx.KVStore(k.storeKey)
	store.Set(AssetCounterKey, sdk.Uint64ToBigEndian(id))
}

func (k Keeper) CreateAsset(ctx sdk.Context, asset types.CreatedAsset, referrer string) (string, error) {
	params := k.GetParams(ctx)

	count := k.GetAssetCountByCreator(ctx, asset.Creator)
	if count >= params.MaxAssetsPerCreator {
		return "", types.ErrMaxAssetsReached
	}

	id := k.GetNextAssetID(ctx)
	asset.Id = fmt.Sprintf("%d", id)

	k.SetAsset(ctx, id, asset)
	k.SetNextAssetID(ctx, id+1)

	if referrer != "" {
		k.saveReferral(ctx, referrer, asset.Creator, params.ReferralBoostPercentage)
	}

	return asset.Id, nil
}

func (k Keeper) SetAsset(ctx sdk.Context, id uint64, asset types.CreatedAsset) {
	store := ctx.KVStore(k.storeKey)
	key := append(AssetPrefix, sdk.Uint64ToBigEndian(id)...)
	store.Set(key, marshalJSON(asset))
}

func (k Keeper) GetAsset(ctx sdk.Context, id uint64) (types.CreatedAsset, error) {
	store := ctx.KVStore(k.storeKey)
	key := append(AssetPrefix, sdk.Uint64ToBigEndian(id)...)
	bz := store.Get(key)
	if bz == nil {
		return types.CreatedAsset{}, fmt.Errorf("asset not found")
	}
	var asset types.CreatedAsset
	unmarshalJSON(bz, &asset)
	return asset, nil
}

func (k Keeper) GetAssetCountByCreator(ctx sdk.Context, creator string) uint64 {
	store := ctx.KVStore(k.storeKey)
	iter := store.Iterator(AssetPrefix, 	storetypes.PrefixEndBytes(AssetPrefix))
	defer iter.Close()

	var count uint64
	for ; iter.Valid(); iter.Next() {
		var asset types.CreatedAsset
		unmarshalJSON(iter.Value(), &asset)
		if asset.Creator == creator {
			count++
		}
	}
	return count
}

func (k Keeper) GetAssetsByCreator(ctx sdk.Context, creator string) []types.CreatedAsset {
	store := ctx.KVStore(k.storeKey)
	iter := store.Iterator(AssetPrefix, 	storetypes.PrefixEndBytes(AssetPrefix))
	defer iter.Close()

	var assets []types.CreatedAsset
	for ; iter.Valid(); iter.Next() {
		var asset types.CreatedAsset
		unmarshalJSON(iter.Value(), &asset)
		if asset.Creator == creator {
			assets = append(assets, asset)
		}
	}
	return assets
}

func (k Keeper) saveReferral(ctx sdk.Context, referrer, referee string, boost sdkmath.LegacyDec) {
	store := ctx.KVStore(k.storeKey)
	key := append(append(ReferralPrefix, []byte(referrer)...), []byte(referee)...)

	referral := types.ReferralInfo{
		Referrer:           referrer,
		Referee:            referee,
		ReferrerSpeedBoost: boost,
		ReferralCount:      1,
	}

	store.Set(key, marshalJSON(referral))
}

func (k Keeper) GetReferral(ctx sdk.Context, referrer, referee string) (types.ReferralInfo, error) {
	store := ctx.KVStore(k.storeKey)
	key := append(append(ReferralPrefix, []byte(referrer)...), []byte(referee)...)
	bz := store.Get(key)
	if bz == nil {
		return types.ReferralInfo{}, fmt.Errorf("referral not found")
	}
	var referral types.ReferralInfo
	unmarshalJSON(bz, &referral)
	return referral, nil
}

func (k Keeper) GetAllAssets(ctx sdk.Context) []types.CreatedAsset {
	store := ctx.KVStore(k.storeKey)
	iter := store.Iterator(AssetPrefix, storetypes.PrefixEndBytes(AssetPrefix))
	defer iter.Close()

	var assets []types.CreatedAsset
	for ; iter.Valid(); iter.Next() {
		var asset types.CreatedAsset
		unmarshalJSON(iter.Value(), &asset)
		assets = append(assets, asset)
	}
	return assets
}

func (k Keeper) GetReferralsByReferrer(ctx sdk.Context, referrer string) []types.ReferralInfo {
	store := ctx.KVStore(k.storeKey)
	iter := store.Iterator(ReferralPrefix, storetypes.PrefixEndBytes(ReferralPrefix))
	defer iter.Close()

	var referrals []types.ReferralInfo
	for ; iter.Valid(); iter.Next() {
		var referral types.ReferralInfo
		unmarshalJSON(iter.Value(), &referral)
		if referral.Referrer == referrer {
			referrals = append(referrals, referral)
		}
	}
	return referrals
}

func parseAssetID(id string) uint64 {
	n, _ := strconv.ParseUint(id, 10, 64)
	return n
}
