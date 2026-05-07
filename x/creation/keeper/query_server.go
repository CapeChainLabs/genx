package keeper

import (
	"context"

	"github.com/capechain/genx/x/creation/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

type queryServer struct {
	Keeper
}

func NewQueryServerImpl(keeper Keeper) types.QueryServer {
	return &queryServer{Keeper: keeper}
}

func (q queryServer) Params(goCtx context.Context, req *types.QueryParamsRequest) (*types.QueryParamsResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	params := q.GetParams(ctx)
	return &types.QueryParamsResponse{Params: &params}, nil
}

func (q queryServer) AssetById(goCtx context.Context, req *types.QueryAssetByIdRequest) (*types.QueryAssetByIdResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	asset, err := q.GetAsset(ctx, parseAssetID(req.Id))
	if err != nil {
		return nil, err
	}

	return &types.QueryAssetByIdResponse{Asset: &asset}, nil
}

func (q queryServer) AssetsByCreator(goCtx context.Context, req *types.QueryAssetsByCreatorRequest) (*types.QueryAssetsByCreatorResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	assets := q.GetAssetsByCreator(ctx, req.Creator)

	ptrs := make([]*types.CreatedAsset, len(assets))
	for i := range assets {
		ptrs[i] = &assets[i]
	}

	return &types.QueryAssetsByCreatorResponse{Assets: ptrs}, nil
}

func (q queryServer) Assets(goCtx context.Context, req *types.QueryAssetsRequest) (*types.QueryAssetsResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	assets := q.GetAllAssets(ctx)

	if req.AssetType != "" {
		var filtered []types.CreatedAsset
		for _, a := range assets {
			if a.AssetType == req.AssetType {
				filtered = append(filtered, a)
			}
		}
		assets = filtered
	}

	ptrs := make([]*types.CreatedAsset, len(assets))
	for i := range assets {
		ptrs[i] = &assets[i]
	}

	return &types.QueryAssetsResponse{Assets: ptrs}, nil
}

func (q queryServer) Referral(goCtx context.Context, req *types.QueryReferralRequest) (*types.QueryReferralResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	referral, err := q.GetReferral(ctx, req.Referrer, req.Referee)
	if err != nil {
		return nil, err
	}
	return &types.QueryReferralResponse{Referral: &referral}, nil
}

func (q queryServer) ReferralsByReferrer(goCtx context.Context, req *types.QueryReferralsByReferrerRequest) (*types.QueryReferralsByReferrerResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	referrals := q.GetReferralsByReferrer(ctx, req.Referrer)

	ptrs := make([]*types.ReferralInfo, len(referrals))
	for i := range referrals {
		ptrs[i] = &referrals[i]
	}

	return &types.QueryReferralsByReferrerResponse{Referrals: ptrs}, nil
}

func (q queryServer) TotalAssets(goCtx context.Context, req *types.QueryTotalAssetsRequest) (*types.QueryTotalAssetsResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	assets := q.GetAllAssets(ctx)

	var tokens, nfts, memes uint64
	for _, a := range assets {
		switch a.AssetType {
		case types.AssetTypeToken:
			tokens++
		case types.AssetTypeNFT:
			nfts++
		case types.AssetTypeMemeCoin:
			memes++
		}
	}

	return &types.QueryTotalAssetsResponse{
		TotalAssets: uint64(len(assets)),
		Tokens:      tokens,
		Nfts:        nfts,
		MemeCoins:   memes,
	}, nil
}
