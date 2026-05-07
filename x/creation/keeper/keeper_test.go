package keeper_test

import (
	"testing"

	"github.com/capechain/genx/x/creation/keeper"
	"github.com/capechain/genx/x/creation/types"

	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"

	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/require"

	"github.com/cosmos/cosmos-sdk/testutil"
)

func setupKeeper(t *testing.T) (*keeper.Keeper, sdk.Context) {
	t.Helper()
	cdc := codec.NewProtoCodec(codectypes.NewInterfaceRegistry())
	storeKey := storetypes.NewKVStoreKey(types.StoreKey)
	testCtx := testutil.DefaultContextWithDB(t, storeKey, storetypes.NewTransientStoreKey("transient_test"))

	bankKeeper := &MockBankKeeper{}
	tokenFactory := &MockTokenFactoryKeeper{}
	nftKeeper := &MockNFTKeeper{}

	k := keeper.NewKeeper(
		cdc,
		storeKey,
		bankKeeper,
		tokenFactory,
		nftKeeper,
		sdk.AccAddress([]byte("authority")).String(),
	)

	ctx := testCtx.Ctx.WithBlockHeight(1)
	params := types.DefaultParams()
	k.SetParams(ctx, *params)

	return k, ctx
}

func TestKeeper_GetParams(t *testing.T) {
	k, ctx := setupKeeper(t)

	params := k.GetParams(ctx)
	require.Equal(t, uint64(100), params.MaxAssetsPerCreator)
	require.True(t, params.TokenCreationFee.IsZero())
}

func TestKeeper_SetParams(t *testing.T) {
	k, ctx := setupKeeper(t)

	fee := sdk.NewInt64Coin("ugenx", 1000)
	newParams := types.Params{
		TokenCreationFee:       &fee,
		PlatformFeePercentage:  math.LegacyMustNewDecFromStr("0.05"),
		RoyaltyDefault:         math.LegacyMustNewDecFromStr("0.1"),
		MaxAssetsPerCreator:    50,
		ReferralBoostPercentage: math.LegacyMustNewDecFromStr("0.1"),
		ReferralRewardPercentage: math.LegacyMustNewDecFromStr("0.02"),
	}

	k.SetParams(ctx, newParams)

	got := k.GetParams(ctx)
	require.Equal(t, newParams, got)
}

func TestKeeper_AssetIDIncrement(t *testing.T) {
	k, ctx := setupKeeper(t)

	require.Equal(t, uint64(1), k.GetNextAssetID(ctx))

	k.SetNextAssetID(ctx, 100)
	require.Equal(t, uint64(100), k.GetNextAssetID(ctx))
}

func TestKeeper_CreateAsset(t *testing.T) {
	k, ctx := setupKeeper(t)

	creator := sdk.AccAddress([]byte("creator1")).String()

	asset := types.CreatedAsset{
		Creator:   creator,
		AssetType: types.AssetTypeToken,
		Name:      "Test Token",
		Symbol:    "TST",
	}

	id, err := k.CreateAsset(ctx, asset, "")
	require.NoError(t, err)
	require.Equal(t, "1", id)

	got, err := k.GetAsset(ctx, 1)
	require.NoError(t, err)
	require.Equal(t, creator, got.Creator)
	require.Equal(t, "Test Token", got.Name)
	require.Equal(t, "1", got.Id)

	require.Equal(t, uint64(2), k.GetNextAssetID(ctx))
}

func TestKeeper_CreateAssetWithReferral(t *testing.T) {
	k, ctx := setupKeeper(t)

	creator := sdk.AccAddress([]byte("creator1")).String()
	referrer := sdk.AccAddress([]byte("referrer1")).String()

	asset := types.CreatedAsset{
		Creator:   creator,
		AssetType: types.AssetTypeToken,
		Name:      "Test Token",
		Symbol:    "TST",
	}

	_, err := k.CreateAsset(ctx, asset, referrer)
	require.NoError(t, err)

	referral, err := k.GetReferral(ctx, referrer, creator)
	require.NoError(t, err)
	require.Equal(t, referrer, referral.Referrer)
	require.Equal(t, creator, referral.Referee)
	require.Equal(t, int64(1), referral.ReferralCount)
}

func TestKeeper_MaxAssetsPerCreator(t *testing.T) {
	k, ctx := setupKeeper(t)

	params := k.GetParams(ctx)
	params.MaxAssetsPerCreator = 2
	k.SetParams(ctx, params)

	creator := sdk.AccAddress([]byte("creator1")).String()

	for i := 0; i < 2; i++ {
		asset := types.CreatedAsset{
			Creator:   creator,
			AssetType: types.AssetTypeToken,
			Name:      "Token",
			Symbol:    "TST",
		}
		_, err := k.CreateAsset(ctx, asset, "")
		require.NoError(t, err)
	}

	asset := types.CreatedAsset{
		Creator:   creator,
		AssetType: types.AssetTypeToken,
		Name:      "Token3",
		Symbol:    "TST3",
	}
	_, err := k.CreateAsset(ctx, asset, "")
	require.ErrorIs(t, err, types.ErrMaxAssetsReached)
}

func TestKeeper_GetAssetsByCreator(t *testing.T) {
	k, ctx := setupKeeper(t)

	creator1 := sdk.AccAddress([]byte("creator1")).String()
	creator2 := sdk.AccAddress([]byte("creator2")).String()

	k.CreateAsset(ctx, types.CreatedAsset{Creator: creator1, AssetType: types.AssetTypeToken, Name: "A", Symbol: "A"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: creator1, AssetType: types.AssetTypeNFT, Name: "B", Symbol: "B"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: creator2, AssetType: types.AssetTypeToken, Name: "C", Symbol: "C"}, "")

	assets := k.GetAssetsByCreator(ctx, creator1)
	require.Len(t, assets, 2)

	assets2 := k.GetAssetsByCreator(ctx, creator2)
	require.Len(t, assets2, 1)
}

func TestKeeper_GetAssetCountByCreator(t *testing.T) {
	k, ctx := setupKeeper(t)

	creator := sdk.AccAddress([]byte("creator1")).String()

	require.Equal(t, uint64(0), k.GetAssetCountByCreator(ctx, creator))

	k.CreateAsset(ctx, types.CreatedAsset{Creator: creator, AssetType: types.AssetTypeToken, Name: "A", Symbol: "A"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: creator, AssetType: types.AssetTypeNFT, Name: "B", Symbol: "B"}, "")

	require.Equal(t, uint64(2), k.GetAssetCountByCreator(ctx, creator))
}

func TestKeeper_GetAllAssets(t *testing.T) {
	k, ctx := setupKeeper(t)

	k.CreateAsset(ctx, types.CreatedAsset{Creator: "c1", AssetType: types.AssetTypeToken, Name: "A", Symbol: "A"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: "c2", AssetType: types.AssetTypeNFT, Name: "B", Symbol: "B"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: "c1", AssetType: types.AssetTypeMemeCoin, Name: "C", Symbol: "C"}, "")

	assets := k.GetAllAssets(ctx)
	require.Len(t, assets, 3)
}

func TestKeeper_GetAssetNotFound(t *testing.T) {
	k, ctx := setupKeeper(t)

	_, err := k.GetAsset(ctx, 999)
	require.Error(t, err)
	require.Contains(t, err.Error(), "asset not found")
}

func TestKeeper_ReferralManagement(t *testing.T) {
	k, ctx := setupKeeper(t)

	referrer := sdk.AccAddress([]byte("referrer")).String()
	referee := sdk.AccAddress([]byte("referee")).String()

	_, err := k.GetReferral(ctx, referrer, referee)
	require.Error(t, err)

	msgServer := keeper.NewMsgServerImpl(*k)
	_, err = msgServer.RegisterReferral(ctx, &types.MsgRegisterReferral{
		Referrer: referrer,
		Referee:  referee,
	})
	require.NoError(t, err)

	referral, err := k.GetReferral(ctx, referrer, referee)
	require.NoError(t, err)
	require.Equal(t, referrer, referral.Referrer)
	require.Equal(t, referee, referral.Referee)

	_, err = k.GetReferral(ctx, referrer, "unknown")
	require.Error(t, err)
}

func TestKeeper_GetReferralsByReferrer(t *testing.T) {
	k, ctx := setupKeeper(t)

	referrer := sdk.AccAddress([]byte("referrer")).String()
	referee1 := sdk.AccAddress([]byte("referee1")).String()
	referee2 := sdk.AccAddress([]byte("referee2")).String()

	msgServer := keeper.NewMsgServerImpl(*k)
	msgServer.RegisterReferral(ctx, &types.MsgRegisterReferral{
		Referrer: referrer,
		Referee:  referee1,
	})
	msgServer.RegisterReferral(ctx, &types.MsgRegisterReferral{
		Referrer: referrer,
		Referee:  referee2,
	})

	referrals := k.GetReferralsByReferrer(ctx, referrer)
	require.Len(t, referrals, 2)

	otherReferrals := k.GetReferralsByReferrer(ctx, "other")
	require.Len(t, otherReferrals, 0)
}

func TestKeeper_InitGenesisExportGenesis(t *testing.T) {
	k, ctx := setupKeeper(t)

	params := types.DefaultParams()
	params.MaxAssetsPerCreator = 75

	gs := types.GenesisState{
		Params: params,
	}

	k.InitGenesis(ctx, gs)

	gotParams := k.GetParams(ctx)
	require.Equal(t, uint64(75), gotParams.MaxAssetsPerCreator)

	exported := k.ExportGenesis(ctx)
	require.Equal(t, uint64(75), exported.Params.MaxAssetsPerCreator)
}
