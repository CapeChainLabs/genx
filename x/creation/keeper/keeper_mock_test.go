package keeper_test

import (
	"context"
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	nfttypes "cosmossdk.io/x/nft"
)

type MockBankKeeper struct{}

func (m *MockBankKeeper) SendCoinsFromAccountToModule(_ context.Context, _ sdk.AccAddress, _ string, _ sdk.Coins) error {
	return nil
}

func (m *MockBankKeeper) SendCoins(_ context.Context, _, _ sdk.AccAddress, _ sdk.Coins) error {
	return nil
}

func (m *MockBankKeeper) MintCoins(_ context.Context, _ string, _ sdk.Coins) error {
	return nil
}

func (m *MockBankKeeper) SendCoinsFromModuleToAccount(_ context.Context, _ string, _ sdk.AccAddress, _ sdk.Coins) error {
	return nil
}

type MockTokenFactoryKeeper struct{}

func (m *MockTokenFactoryKeeper) CreateDenom(_ sdk.Context, creatorAddr string, subdenom string) (string, error) {
	return fmt.Sprintf("factory/%s/%s", creatorAddr, subdenom), nil
}

type MockNFTKeeper struct{}

func (m *MockNFTKeeper) SaveClass(_ context.Context, _ nfttypes.Class) error {
	return nil
}
