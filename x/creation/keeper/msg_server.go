package keeper

import (
	"context"
	"fmt"

	"github.com/capechain/genx/x/creation/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkmath "cosmossdk.io/math"
	nfttypes "cosmossdk.io/x/nft"
)

type msgServer struct {
	Keeper
}

func NewMsgServerImpl(keeper Keeper) types.MsgServer {
	return &msgServer{Keeper: keeper}
}

func (m msgServer) CreateToken(goCtx context.Context, msg *types.MsgCreateToken) (*types.MsgCreateTokenResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	params := m.GetParams(ctx)

	if err := m.deductFee(ctx, msg.Sender, params.TokenCreationFee); err != nil {
		return nil, err
	}

	denom, err := m.tokenFactory.CreateDenom(ctx, msg.Sender, msg.Symbol)
	if err != nil {
		return nil, fmt.Errorf("failed to create token denom: %w", err)
	}

	if msg.InitialSupply != "" && msg.InitialSupply != "0" {
		initialSupply, ok := sdkmath.NewIntFromString(msg.InitialSupply)
		if !ok {
			return nil, fmt.Errorf("invalid initial supply: %s", msg.InitialSupply)
		}
		decimals := uint32(18)
		if msg.Decimals > 0 {
			decimals = uint32(msg.Decimals)
		}
		adjustedSupply := initialSupply.Mul(sdkmath.NewIntWithDecimal(1, int(decimals)))
		coin := sdk.NewCoin(denom, adjustedSupply)

		senderAddr, err := sdk.AccAddressFromBech32(msg.Sender)
		if err != nil {
			return nil, err
		}

		if err := m.bankKeeper.MintCoins(ctx, types.ModuleName, sdk.NewCoins(coin)); err != nil {
			return nil, fmt.Errorf("failed to mint initial supply: %w", err)
		}

		if err := m.bankKeeper.SendCoinsFromModuleToAccount(ctx, types.ModuleName, senderAddr, sdk.NewCoins(coin)); err != nil {
			return nil, fmt.Errorf("failed to send minted tokens: %w", err)
		}
	}

	asset := types.CreatedAsset{
		Creator:               msg.Sender,
		AssetType:             types.AssetTypeToken,
		Name:                  msg.Name,
		Symbol:                msg.Symbol,
		Description:           msg.Description,
		Denom:                 denom,
		CreatedAt:             ctx.BlockTime().Unix(),
		RoyaltyPercentage:     msg.RoyaltyPercentage,
		LiquidationProtection: msg.LiquidationProtection,
	}

	assetID, err := m.CreateAsset(ctx, asset, msg.Referrer)
	if err != nil {
		return nil, err
	}

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		"create_token",
		sdk.NewAttribute("asset_id", assetID),
		sdk.NewAttribute("denom", denom),
		sdk.NewAttribute("creator", msg.Sender),
		sdk.NewAttribute("symbol", msg.Symbol),
		sdk.NewAttribute("name", msg.Name),
	))

	return &types.MsgCreateTokenResponse{
		Denom:   denom,
		AssetId: assetID,
	}, nil
}

func (m msgServer) CreateNftCollection(goCtx context.Context, msg *types.MsgCreateNftCollection) (*types.MsgCreateNftCollectionResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	params := m.GetParams(ctx)

	if err := m.deductFee(ctx, msg.Sender, params.NftCreationFee); err != nil {
		return nil, err
	}

	classID := fmt.Sprintf("nft-%d", m.GetNextAssetID(ctx))

	nftClass := nfttypes.Class{
		Id:          classID,
		Name:        msg.Name,
		Symbol:      msg.Symbol,
		Description: msg.Description,
		Uri:         msg.MetadataUri,
	}

	if err := m.nftKeeper.SaveClass(ctx, nftClass); err != nil {
		return nil, fmt.Errorf("failed to create NFT class: %w", err)
	}

	asset := types.CreatedAsset{
		Creator:               msg.Sender,
		AssetType:             types.AssetTypeNFT,
		Name:                  msg.Name,
		Symbol:                msg.Symbol,
		Description:           msg.Description,
		Denom:                 classID,
		MetadataUri:           msg.MetadataUri,
		CreatedAt:             ctx.BlockTime().Unix(),
		RoyaltyPercentage:     msg.RoyaltyPercentage,
		LiquidationProtection: msg.LiquidationProtection,
	}

	assetID, err := m.CreateAsset(ctx, asset, msg.Referrer)
	if err != nil {
		return nil, err
	}

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		"create_nft_collection",
		sdk.NewAttribute("asset_id", assetID),
		sdk.NewAttribute("class_id", classID),
		sdk.NewAttribute("creator", msg.Sender),
		sdk.NewAttribute("symbol", msg.Symbol),
		sdk.NewAttribute("name", msg.Name),
	))

	return &types.MsgCreateNftCollectionResponse{
		ClassId: classID,
		AssetId: assetID,
	}, nil
}

func (m msgServer) CreateMemeCoin(goCtx context.Context, msg *types.MsgCreateMemeCoin) (*types.MsgCreateMemeCoinResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	params := m.GetParams(ctx)

	if err := m.deductFee(ctx, msg.Sender, params.MemeCreationFee); err != nil {
		return nil, err
	}

	denom, err := m.tokenFactory.CreateDenom(ctx, msg.Sender, msg.Symbol)
	if err != nil {
		return nil, fmt.Errorf("failed to create meme coin denom: %w", err)
	}

	if msg.InitialSupply != "" && msg.InitialSupply != "0" {
		initialSupply, ok := sdkmath.NewIntFromString(msg.InitialSupply)
		if !ok {
			return nil, fmt.Errorf("invalid initial supply: %s", msg.InitialSupply)
		}
		decimals := uint32(18)
		if msg.Decimals > 0 {
			decimals = uint32(msg.Decimals)
		}
		adjustedSupply := initialSupply.Mul(sdkmath.NewIntWithDecimal(1, int(decimals)))
		coin := sdk.NewCoin(denom, adjustedSupply)

		senderAddr, err := sdk.AccAddressFromBech32(msg.Sender)
		if err != nil {
			return nil, err
		}

		if err := m.bankKeeper.MintCoins(ctx, types.ModuleName, sdk.NewCoins(coin)); err != nil {
			return nil, fmt.Errorf("failed to mint initial supply: %w", err)
		}

		if err := m.bankKeeper.SendCoinsFromModuleToAccount(ctx, types.ModuleName, senderAddr, sdk.NewCoins(coin)); err != nil {
			return nil, fmt.Errorf("failed to send minted tokens: %w", err)
		}
	}

	asset := types.CreatedAsset{
		Creator:               msg.Sender,
		AssetType:             types.AssetTypeMemeCoin,
		Name:                  msg.Name,
		Symbol:                msg.Symbol,
		Description:           msg.Description,
		Denom:                 denom,
		CreatedAt:             ctx.BlockTime().Unix(),
		LiquidationProtection: msg.LiquidationProtection,
		BondingCurveType:      msg.BondingCurveType,
	}

	assetID, err := m.CreateAsset(ctx, asset, msg.Referrer)
	if err != nil {
		return nil, err
	}

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		"create_meme_coin",
		sdk.NewAttribute("asset_id", assetID),
		sdk.NewAttribute("denom", denom),
		sdk.NewAttribute("creator", msg.Sender),
		sdk.NewAttribute("symbol", msg.Symbol),
		sdk.NewAttribute("name", msg.Name),
		sdk.NewAttribute("bonding_curve", msg.BondingCurveType),
	))

	return &types.MsgCreateMemeCoinResponse{
		Denom:   denom,
		AssetId: assetID,
	}, nil
}

func (m msgServer) RegisterReferral(goCtx context.Context, msg *types.MsgRegisterReferral) (*types.MsgRegisterReferralResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	params := m.GetParams(ctx)

	_, err := m.GetReferral(ctx, msg.Referrer, msg.Referee)
	if err == nil {
		return nil, types.ErrReferralAlreadyExists
	}

	m.saveReferral(ctx, msg.Referrer, msg.Referee, params.ReferralBoostPercentage)

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		"register_referral",
		sdk.NewAttribute("referrer", msg.Referrer),
		sdk.NewAttribute("referee", msg.Referee),
		sdk.NewAttribute("speed_boost", params.ReferralBoostPercentage.String()),
	))

	return &types.MsgRegisterReferralResponse{
		SpeedBoost: params.ReferralBoostPercentage,
	}, nil
}

func (m msgServer) UpdateParams(goCtx context.Context, msg *types.MsgUpdateParams) (*types.MsgUpdateParamsResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	if msg.Authority != m.authority {
		return nil, fmt.Errorf("invalid authority; expected %s, got %s", m.authority, msg.Authority)
	}

	if err := msg.Params.Validate(); err != nil {
		return nil, err
	}

	m.SetParams(ctx, *msg.Params)

	return &types.MsgUpdateParamsResponse{}, nil
}

func (m msgServer) deductFee(ctx sdk.Context, sender string, fee *sdk.Coin) error {
	if fee == nil || fee.IsZero() {
		return nil
	}

	senderAddr, err := sdk.AccAddressFromBech32(sender)
	if err != nil {
		return err
	}

	return m.bankKeeper.SendCoinsFromAccountToModule(ctx, senderAddr, types.ModuleName, sdk.NewCoins(*fee))
}
