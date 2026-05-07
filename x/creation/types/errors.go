package types

import (
	sdkerrors "cosmossdk.io/errors"
)

var (
	ErrInvalidAddress        = sdkerrors.Register(ModuleName, 1, "invalid address")
	ErrInvalidAssetName      = sdkerrors.Register(ModuleName, 2, "invalid asset name")
	ErrInvalidAssetSymbol    = sdkerrors.Register(ModuleName, 3, "invalid asset symbol")
	ErrInvalidSupply         = sdkerrors.Register(ModuleName, 4, "invalid supply")
	ErrInvalidRoyalty        = sdkerrors.Register(ModuleName, 5, "invalid royalty percentage")
	ErrMaxAssetsReached      = sdkerrors.Register(ModuleName, 6, "maximum assets per creator reached")
	ErrReferralAlreadyExists = sdkerrors.Register(ModuleName, 7, "referral already exists")
)
