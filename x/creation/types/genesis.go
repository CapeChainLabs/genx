package types

import (
	sdkmath "cosmossdk.io/math"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

func DefaultGenesis() *GenesisState {
	return &GenesisState{
		Params: DefaultParams(),
	}
}

func ValidateGenesis(gs *GenesisState) error {
	if gs == nil {
		return nil
	}
	return gs.Params.Validate()
}

func DefaultParams() *Params {
	zeroCoin := sdk.NewInt64Coin("ugenx", 0)
	return &Params{
		TokenCreationFee:         &zeroCoin,
		NftCreationFee:           &zeroCoin,
		MemeCreationFee:          &zeroCoin,
		PlatformFeePercentage:    sdkmath.LegacyMustNewDecFromStr("0.02"),
		RoyaltyDefault:           sdkmath.LegacyMustNewDecFromStr("0.05"),
		ReferralBoostPercentage:  sdkmath.LegacyMustNewDecFromStr("0.05"),
		ReferralRewardPercentage: sdkmath.LegacyMustNewDecFromStr("0.02"),
		MaxAssetsPerCreator:      100,
	}
}

func (p *Params) Validate() error {
	if p == nil {
		return nil
	}
	if p.PlatformFeePercentage.IsNil() || p.PlatformFeePercentage.IsZero() {
		return nil
	}
	one := sdkmath.LegacyOneDec()
	if p.PlatformFeePercentage.IsNegative() || p.PlatformFeePercentage.GT(one) {
		return ErrInvalidRoyalty
	}
	if !p.RoyaltyDefault.IsNil() && !p.RoyaltyDefault.IsZero() {
		if p.RoyaltyDefault.IsNegative() || p.RoyaltyDefault.GT(one) {
			return ErrInvalidRoyalty
		}
	}
	return nil
}
