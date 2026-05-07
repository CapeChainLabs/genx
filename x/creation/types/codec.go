package types

import (
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/msgservice"
)

func RegisterLegacyAminoCodec(cdc *codec.LegacyAmino) {
	cdc.RegisterConcrete(&MsgCreateToken{}, "creation/CreateToken", nil)
	cdc.RegisterConcrete(&MsgCreateNftCollection{}, "creation/CreateNftCollection", nil)
	cdc.RegisterConcrete(&MsgCreateMemeCoin{}, "creation/CreateMemeCoin", nil)
	cdc.RegisterConcrete(&MsgRegisterReferral{}, "creation/RegisterReferral", nil)
	cdc.RegisterConcrete(&MsgUpdateParams{}, "creation/UpdateParams", nil)
}

func RegisterInterfaces(registry codectypes.InterfaceRegistry) {
	registry.RegisterImplementations(
		(*sdk.Msg)(nil),
		&MsgCreateToken{},
		&MsgCreateNftCollection{},
		&MsgCreateMemeCoin{},
		&MsgRegisterReferral{},
		&MsgUpdateParams{},
	)

	msgservice.RegisterMsgServiceDesc(registry, &_Msg_serviceDesc)
}
