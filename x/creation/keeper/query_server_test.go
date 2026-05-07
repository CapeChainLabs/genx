package keeper_test

import (
	"testing"

	"github.com/capechain/genx/x/creation/keeper"
	"github.com/capechain/genx/x/creation/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/require"
)

func TestQueryServer_Params(t *testing.T) {
	k, ctx := setupKeeper(t)
	queryServer := keeper.NewQueryServerImpl(*k)

	resp, err := queryServer.Params(ctx, &types.QueryParamsRequest{})
	require.NoError(t, err)
	require.NotNil(t, resp.Params)
	require.Equal(t, uint64(100), resp.Params.MaxAssetsPerCreator)
}

func TestQueryServer_AssetById(t *testing.T) {
	k, ctx := setupKeeper(t)
	queryServer := keeper.NewQueryServerImpl(*k)

	sender := sdk.AccAddress([]byte("sender1")).String()

	k.CreateAsset(ctx, types.CreatedAsset{
		Creator:   sender,
		AssetType: types.AssetTypeToken,
		Name:      "Test Token",
		Symbol:    "TST",
	}, "")

	resp, err := queryServer.AssetById(ctx, &types.QueryAssetByIdRequest{
		Id: "1",
	})
	require.NoError(t, err)
	require.Equal(t, "1", resp.Asset.Id)
	require.Equal(t, "Test Token", resp.Asset.Name)

	_, err = queryServer.AssetById(ctx, &types.QueryAssetByIdRequest{
		Id: "999",
	})
	require.Error(t, err)
}

func TestQueryServer_AssetsByCreator(t *testing.T) {
	k, ctx := setupKeeper(t)
	queryServer := keeper.NewQueryServerImpl(*k)

	creator := sdk.AccAddress([]byte("creator1")).String()
	other := sdk.AccAddress([]byte("creator2")).String()

	k.CreateAsset(ctx, types.CreatedAsset{Creator: creator, AssetType: types.AssetTypeToken, Name: "A", Symbol: "A"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: creator, AssetType: types.AssetTypeNFT, Name: "B", Symbol: "B"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: other, AssetType: types.AssetTypeToken, Name: "C", Symbol: "C"}, "")

	resp, err := queryServer.AssetsByCreator(ctx, &types.QueryAssetsByCreatorRequest{
		Creator: creator,
	})
	require.NoError(t, err)
	require.Len(t, resp.Assets, 2)

	otherResp, err := queryServer.AssetsByCreator(ctx, &types.QueryAssetsByCreatorRequest{
		Creator: other,
	})
	require.NoError(t, err)
	require.Len(t, otherResp.Assets, 1)
}

func TestQueryServer_Assets(t *testing.T) {
	k, ctx := setupKeeper(t)
	queryServer := keeper.NewQueryServerImpl(*k)

	sender := sdk.AccAddress([]byte("sender1")).String()

	k.CreateAsset(ctx, types.CreatedAsset{Creator: sender, AssetType: types.AssetTypeToken, Name: "Token", Symbol: "TST"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: sender, AssetType: types.AssetTypeNFT, Name: "NFT", Symbol: "NFT"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: sender, AssetType: types.AssetTypeMemeCoin, Name: "Meme", Symbol: "MEME"}, "")

	resp, err := queryServer.Assets(ctx, &types.QueryAssetsRequest{})
	require.NoError(t, err)
	require.Len(t, resp.Assets, 3)

	tokenResp, err := queryServer.Assets(ctx, &types.QueryAssetsRequest{
		AssetType: types.AssetTypeToken,
	})
	require.NoError(t, err)
	require.Len(t, tokenResp.Assets, 1)
	require.Equal(t, "TST", tokenResp.Assets[0].Symbol)

	nftResp, err := queryServer.Assets(ctx, &types.QueryAssetsRequest{
		AssetType: types.AssetTypeNFT,
	})
	require.NoError(t, err)
	require.Len(t, nftResp.Assets, 1)
}

func TestQueryServer_TotalAssets(t *testing.T) {
	k, ctx := setupKeeper(t)
	queryServer := keeper.NewQueryServerImpl(*k)

	resp, err := queryServer.TotalAssets(ctx, &types.QueryTotalAssetsRequest{})
	require.NoError(t, err)
	require.Equal(t, uint64(0), resp.TotalAssets)
	require.Equal(t, uint64(0), resp.Tokens)
	require.Equal(t, uint64(0), resp.Nfts)
	require.Equal(t, uint64(0), resp.MemeCoins)

	sender := sdk.AccAddress([]byte("sender1")).String()

	k.CreateAsset(ctx, types.CreatedAsset{Creator: sender, AssetType: types.AssetTypeToken, Name: "A", Symbol: "A"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: sender, AssetType: types.AssetTypeToken, Name: "B", Symbol: "B"}, "")
	k.CreateAsset(ctx, types.CreatedAsset{Creator: sender, AssetType: types.AssetTypeNFT, Name: "C", Symbol: "C"}, "")

	resp, err = queryServer.TotalAssets(ctx, &types.QueryTotalAssetsRequest{})
	require.NoError(t, err)
	require.Equal(t, uint64(3), resp.TotalAssets)
	require.Equal(t, uint64(2), resp.Tokens)
	require.Equal(t, uint64(1), resp.Nfts)
}

func TestQueryServer_Referral(t *testing.T) {
	k, ctx := setupKeeper(t)
	queryServer := keeper.NewQueryServerImpl(*k)

	referrer := sdk.AccAddress([]byte("referrer")).String()
	referee := sdk.AccAddress([]byte("referee")).String()

	msgServer := keeper.NewMsgServerImpl(*k)
	_, err := msgServer.RegisterReferral(ctx, &types.MsgRegisterReferral{
		Referrer: referrer,
		Referee:  referee,
	})
	require.NoError(t, err)

	resp, err := queryServer.Referral(ctx, &types.QueryReferralRequest{
		Referrer: referrer,
		Referee:  referee,
	})
	require.NoError(t, err)
	require.Equal(t, referrer, resp.Referral.Referrer)
	require.Equal(t, referee, resp.Referral.Referee)

	_, err = queryServer.Referral(ctx, &types.QueryReferralRequest{
		Referrer: referrer,
		Referee:  "unknown",
	})
	require.Error(t, err)
}

func TestQueryServer_ReferralsByReferrer(t *testing.T) {
	k, ctx := setupKeeper(t)
	queryServer := keeper.NewQueryServerImpl(*k)

	referrer := sdk.AccAddress([]byte("referrer")).String()

	msgServer := keeper.NewMsgServerImpl(*k)
	msgServer.RegisterReferral(ctx, &types.MsgRegisterReferral{
		Referrer: referrer,
		Referee:  sdk.AccAddress([]byte("ref1")).String(),
	})
	msgServer.RegisterReferral(ctx, &types.MsgRegisterReferral{
		Referrer: referrer,
		Referee:  sdk.AccAddress([]byte("ref2")).String(),
	})

	resp, err := queryServer.ReferralsByReferrer(ctx, &types.QueryReferralsByReferrerRequest{
		Referrer: referrer,
	})
	require.NoError(t, err)
	require.Len(t, resp.Referrals, 2)

	emptyResp, err := queryServer.ReferralsByReferrer(ctx, &types.QueryReferralsByReferrerRequest{
		Referrer: "unknown",
	})
	require.NoError(t, err)
	require.Len(t, emptyResp.Referrals, 0)
}
