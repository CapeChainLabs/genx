package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

func (m *MsgCreateToken) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Sender)
	return []sdk.AccAddress{addr}
}

func (m *MsgCreateToken) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(m.Sender)
	if err != nil {
		return sdkerrors.ErrInvalidAddress.Wrapf("invalid sender address (%s)", err)
	}
	if m.Name == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("name cannot be empty")
	}
	if m.Symbol == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("symbol cannot be empty")
	}
	if m.InitialSupply == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("initial supply cannot be empty")
	}
	if m.Referrer != "" {
		if _, err := sdk.AccAddressFromBech32(m.Referrer); err != nil {
			return sdkerrors.ErrInvalidAddress.Wrapf("invalid referrer address (%s)", err)
		}
	}
	return nil
}

func (m *MsgCreateNftCollection) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Sender)
	return []sdk.AccAddress{addr}
}

func (m *MsgCreateNftCollection) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(m.Sender)
	if err != nil {
		return sdkerrors.ErrInvalidAddress.Wrapf("invalid sender address (%s)", err)
	}
	if m.Name == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("name cannot be empty")
	}
	if m.Symbol == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("symbol cannot be empty")
	}
	if m.Referrer != "" {
		if _, err := sdk.AccAddressFromBech32(m.Referrer); err != nil {
			return sdkerrors.ErrInvalidAddress.Wrapf("invalid referrer address (%s)", err)
		}
	}
	return nil
}

func (m *MsgCreateMemeCoin) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Sender)
	return []sdk.AccAddress{addr}
}

func (m *MsgCreateMemeCoin) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(m.Sender)
	if err != nil {
		return sdkerrors.ErrInvalidAddress.Wrapf("invalid sender address (%s)", err)
	}
	if m.Name == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("name cannot be empty")
	}
	if m.Symbol == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("symbol cannot be empty")
	}
	if m.InitialSupply == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("initial supply cannot be empty")
	}
	if m.Referrer != "" {
		if _, err := sdk.AccAddressFromBech32(m.Referrer); err != nil {
			return sdkerrors.ErrInvalidAddress.Wrapf("invalid referrer address (%s)", err)
		}
	}
	return nil
}

func (m *MsgRegisterReferral) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Referrer)
	return []sdk.AccAddress{addr}
}

func (m *MsgRegisterReferral) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(m.Referrer)
	if err != nil {
		return sdkerrors.ErrInvalidAddress.Wrapf("invalid referrer address (%s)", err)
	}
	_, err = sdk.AccAddressFromBech32(m.Referee)
	if err != nil {
		return sdkerrors.ErrInvalidAddress.Wrapf("invalid referee address (%s)", err)
	}
	if m.Referrer == m.Referee {
		return sdkerrors.ErrInvalidRequest.Wrap("referrer and referee cannot be the same")
	}
	return nil
}

func (m *MsgUpdateParams) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Authority)
	return []sdk.AccAddress{addr}
}

func (m *MsgUpdateParams) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(m.Authority)
	if err != nil {
		return sdkerrors.ErrInvalidAddress.Wrapf("invalid authority address (%s)", err)
	}
	return nil
}
