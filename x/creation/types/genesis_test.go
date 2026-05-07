package types

import (
	"testing"

	sdkmath "cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/require"
)

func TestDefaultGenesis(t *testing.T) {
	gs := DefaultGenesis()
	require.NotNil(t, gs.Params)
	require.Equal(t, uint64(100), gs.Params.MaxAssetsPerCreator)
	require.True(t, gs.Params.TokenCreationFee.IsZero())
}

func TestValidateGenesis(t *testing.T) {
	tests := []struct {
		name    string
		gs      *GenesisState
		wantErr bool
	}{
		{
			name:    "valid default genesis",
			gs:      DefaultGenesis(),
			wantErr: false,
		},
		{
			name: "valid custom params",
			gs: &GenesisState{
				Params: &Params{
					TokenCreationFee:         ptrCoin(sdk.NewInt64Coin("ugenx", 1000)),
					NftCreationFee:           ptrCoin(sdk.NewInt64Coin("ugenx", 2000)),
					MemeCreationFee:          ptrCoin(sdk.NewInt64Coin("ugenx", 500)),
					PlatformFeePercentage:    sdkmath.LegacyMustNewDecFromStr("0.02"),
					RoyaltyDefault:           sdkmath.LegacyMustNewDecFromStr("0.05"),
					MaxAssetsPerCreator:      50,
					ReferralBoostPercentage:  sdkmath.LegacyMustNewDecFromStr("0.05"),
					ReferralRewardPercentage: sdkmath.LegacyMustNewDecFromStr("0.02"),
				},
			},
			wantErr: false,
		},
		{
			name:    "nil genesis",
			gs:      nil,
			wantErr: false,
		},
		{
			name: "nil params",
			gs:   &GenesisState{},
			wantErr: false,
		},
		{
			name: "negative platform fee",
			gs: func() *GenesisState {
				p := DefaultParams()
				p.PlatformFeePercentage = sdkmath.LegacyMustNewDecFromStr("-0.1")
				return &GenesisState{Params: p}
			}(),
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateGenesis(tt.gs)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}

func TestParamsValidate(t *testing.T) {
	tests := []struct {
		name    string
		params  *Params
		wantErr bool
	}{
		{
			name: "valid params",
			params: &Params{
				TokenCreationFee:         ptrCoin(sdk.NewInt64Coin("ugenx", 0)),
				PlatformFeePercentage:    sdkmath.LegacyMustNewDecFromStr("0.02"),
				MaxAssetsPerCreator:      100,
			},
			wantErr: false,
		},
		{
			name: "platform fee too high",
			params: &Params{
				TokenCreationFee:         ptrCoin(sdk.NewInt64Coin("ugenx", 0)),
				PlatformFeePercentage:    sdkmath.LegacyMustNewDecFromStr("1.1"),
				MaxAssetsPerCreator:      100,
			},
			wantErr: true,
		},
		{
			name: "royalty too high",
			params: &Params{
				TokenCreationFee:         ptrCoin(sdk.NewInt64Coin("ugenx", 0)),
				PlatformFeePercentage:    sdkmath.LegacyMustNewDecFromStr("0.02"),
				RoyaltyDefault:           sdkmath.LegacyMustNewDecFromStr("2.0"),
				MaxAssetsPerCreator:      100,
			},
			wantErr: true,
		},
		{
			name:    "nil params",
			params:  nil,
			wantErr: false,
		},
		{
			name: "zero platform fee is valid",
			params: &Params{
				PlatformFeePercentage:    sdkmath.LegacyMustNewDecFromStr("0"),
				MaxAssetsPerCreator:      100,
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.params.Validate()
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}

func TestDefaultParams(t *testing.T) {
	params := DefaultParams()
	require.Equal(t, uint64(100), params.MaxAssetsPerCreator)
	require.True(t, params.TokenCreationFee.IsZero())
	require.True(t, params.PlatformFeePercentage.Equal(sdkmath.LegacyMustNewDecFromStr("0.02")))
	require.True(t, params.RoyaltyDefault.Equal(sdkmath.LegacyMustNewDecFromStr("0.05")))
	require.True(t, params.ReferralBoostPercentage.Equal(sdkmath.LegacyMustNewDecFromStr("0.05")))
	require.True(t, params.ReferralRewardPercentage.Equal(sdkmath.LegacyMustNewDecFromStr("0.02")))
}

func ptrCoin(c sdk.Coin) *sdk.Coin {
	return &c
}
