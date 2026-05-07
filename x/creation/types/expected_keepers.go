package types

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	nfttypes "cosmossdk.io/x/nft"
)

type BankKeeper interface {
	SendCoins(ctx context.Context, fromAddr, toAddr sdk.AccAddress, amt sdk.Coins) error
	SendCoinsFromAccountToModule(ctx context.Context, senderAddr sdk.AccAddress, recipientModule string, amt sdk.Coins) error
	MintCoins(ctx context.Context, moduleName string, amt sdk.Coins) error
	SendCoinsFromModuleToAccount(ctx context.Context, senderModule string, recipientAddr sdk.AccAddress, amt sdk.Coins) error
}

type TokenFactoryKeeper interface {
	CreateDenom(ctx sdk.Context, creatorAddr string, subdenom string) (newTokenDenom string, err error)
}

type NFTKeeper interface {
	SaveClass(ctx context.Context, class nfttypes.Class) error
}
