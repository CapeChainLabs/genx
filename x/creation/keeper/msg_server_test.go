package keeper_test

import (
	"testing"

	"github.com/capechain/genx/x/creation/keeper"
	"github.com/capechain/genx/x/creation/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/require"
)

func TestMsgServer_CreateToken(t *testing.T) {
	k, ctx := setupKeeper(t)
	msgServer := keeper.NewMsgServerImpl(*k)

	sender := sdk.AccAddress([]byte("sender1")).String()

	resp, err := msgServer.CreateToken(ctx, &types.MsgCreateToken{
		Sender:    sender,
		Name:      "Test Token",
		Symbol:    "TST",
		Description: "A test token",
		InitialSupply: "1000000",
		Decimals:  18,
	})
	require.NoError(t, err)
	require.Equal(t, "1", resp.AssetId)
	require.Equal(t, "factory/"+sender+"/TST", resp.Denom)

	asset, err := k.GetAsset(ctx, 1)
	require.NoError(t, err)
	require.Equal(t, sender, asset.Creator)
	require.Equal(t, "Test Token", asset.Name)
	require.Equal(t, "TST", asset.Symbol)
	require.Equal(t, types.AssetTypeToken, asset.AssetType)
}

func TestMsgServer_CreateNftCollection(t *testing.T) {
	k, ctx := setupKeeper(t)
	msgServer := keeper.NewMsgServerImpl(*k)

	sender := sdk.AccAddress([]byte("sender1")).String()

	resp, err := msgServer.CreateNftCollection(ctx, &types.MsgCreateNftCollection{
		Sender:    sender,
		Name:      "Test NFT",
		Symbol:    "TNFT",
		Description: "A test NFT",
		MetadataUri: "https://example.com/metadata",
		MaxSupply: 1000,
	})
	require.NoError(t, err)
	require.Equal(t, "1", resp.AssetId)
	require.NotEmpty(t, resp.ClassId)

	asset, err := k.GetAsset(ctx, 1)
	require.NoError(t, err)
	require.Equal(t, sender, asset.Creator)
	require.Equal(t, "Test NFT", asset.Name)
	require.Equal(t, types.AssetTypeNFT, asset.AssetType)
	require.Equal(t, "https://example.com/metadata", asset.MetadataUri)
}

func TestMsgServer_CreateMemeCoin(t *testing.T) {
	k, ctx := setupKeeper(t)
	msgServer := keeper.NewMsgServerImpl(*k)

	sender := sdk.AccAddress([]byte("sender1")).String()

	resp, err := msgServer.CreateMemeCoin(ctx, &types.MsgCreateMemeCoin{
		Sender:    sender,
		Name:      "Meme Token",
		Symbol:    "MEME",
		Description: "A meme coin",
		InitialSupply: "5000000",
		Decimals:  18,
		BondingCurveType: "linear",
	})
	require.NoError(t, err)
	require.Equal(t, "1", resp.AssetId)
	require.Equal(t, "factory/"+sender+"/MEME", resp.Denom)

	asset, err := k.GetAsset(ctx, 1)
	require.NoError(t, err)
	require.Equal(t, sender, asset.Creator)
	require.Equal(t, "Meme Token", asset.Name)
	require.Equal(t, types.AssetTypeMemeCoin, asset.AssetType)
	require.Equal(t, "linear", asset.BondingCurveType)
}

func TestMsgServer_RegisterReferral(t *testing.T) {
	k, ctx := setupKeeper(t)
	msgServer := keeper.NewMsgServerImpl(*k)

	referrer := sdk.AccAddress([]byte("referrer")).String()
	referee := sdk.AccAddress([]byte("referee")).String()

	resp, err := msgServer.RegisterReferral(ctx, &types.MsgRegisterReferral{
		Referrer: referrer,
		Referee:  referee,
	})
	require.NoError(t, err)
	require.True(t, resp.SpeedBoost.IsPositive())

	referral, err := k.GetReferral(ctx, referrer, referee)
	require.NoError(t, err)
	require.Equal(t, referrer, referral.Referrer)
	require.Equal(t, referee, referral.Referee)
}

func TestMsgServer_RegisterReferralDuplicate(t *testing.T) {
	k, ctx := setupKeeper(t)
	msgServer := keeper.NewMsgServerImpl(*k)

	referrer := sdk.AccAddress([]byte("referrer")).String()
	referee := sdk.AccAddress([]byte("referee")).String()

	_, err := msgServer.RegisterReferral(ctx, &types.MsgRegisterReferral{
		Referrer: referrer,
		Referee:  referee,
	})
	require.NoError(t, err)

	_, err = msgServer.RegisterReferral(ctx, &types.MsgRegisterReferral{
		Referrer: referrer,
		Referee:  referee,
	})
	require.ErrorIs(t, err, types.ErrReferralAlreadyExists)
}

func TestMsgServer_CreateTokenWithReferral(t *testing.T) {
	k, ctx := setupKeeper(t)
	msgServer := keeper.NewMsgServerImpl(*k)

	referrer := sdk.AccAddress([]byte("referrer")).String()
	sender := sdk.AccAddress([]byte("sender1")).String()

	resp, err := msgServer.CreateToken(ctx, &types.MsgCreateToken{
		Sender:    sender,
		Name:      "Ref Token",
		Symbol:    "REF",
		InitialSupply: "1000000",
		Referrer:  referrer,
	})
	require.NoError(t, err)
	require.Equal(t, "1", resp.AssetId)

	referral, err := k.GetReferral(ctx, referrer, sender)
	require.NoError(t, err)
	require.Equal(t, int64(1), referral.ReferralCount)
}

func TestMsgServer_TotalAssets(t *testing.T) {
	k, ctx := setupKeeper(t)
	queryServer := keeper.NewQueryServerImpl(*k)

	sender := sdk.AccAddress([]byte("sender1")).String()
	msgServer := keeper.NewMsgServerImpl(*k)

	msgServer.CreateToken(ctx, &types.MsgCreateToken{
		Sender:    sender,
		Name:      "Token",
		Symbol:    "TST",
		InitialSupply: "1000000",
	})

	msgServer.CreateNftCollection(ctx, &types.MsgCreateNftCollection{
		Sender: sender,
		Name:   "NFT",
		Symbol: "NFT",
	})

	msgServer.CreateMemeCoin(ctx, &types.MsgCreateMemeCoin{
		Sender:    sender,
		Name:      "Meme",
		Symbol:    "MEME",
		InitialSupply: "1000000",
	})

	resp, err := queryServer.TotalAssets(ctx, &types.QueryTotalAssetsRequest{})
	require.NoError(t, err)
	require.Equal(t, uint64(3), resp.TotalAssets)
	require.Equal(t, uint64(1), resp.Tokens)
	require.Equal(t, uint64(1), resp.Nfts)
	require.Equal(t, uint64(1), resp.MemeCoins)
}
