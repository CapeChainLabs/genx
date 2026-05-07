package types

import (
	"testing"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/require"
)

func TestMsgCreateToken_ValidateBasic(t *testing.T) {
	validSender := sdk.AccAddress([]byte("test1")).String()
	validReferrer := sdk.AccAddress([]byte("test2")).String()

	tests := []struct {
		name    string
		msg     MsgCreateToken
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid message",
			msg: MsgCreateToken{
				Sender:    validSender,
				Name:      "Test Token",
				Symbol:    "TST",
				InitialSupply: "1000000",
			},
			wantErr: false,
		},
		{
			name: "invalid sender address",
			msg: MsgCreateToken{
				Sender:    "invalid-address",
				Name:      "Test Token",
				Symbol:    "TST",
				InitialSupply: "1000000",
			},
			wantErr: true,
			errMsg:  "invalid sender address",
		},
		{
			name: "empty name",
			msg: MsgCreateToken{
				Sender:    validSender,
				Name:      "",
				Symbol:    "TST",
				InitialSupply: "1000000",
			},
			wantErr: true,
			errMsg:  "name cannot be empty",
		},
		{
			name: "empty symbol",
			msg: MsgCreateToken{
				Sender:    validSender,
				Name:      "Test Token",
				Symbol:    "",
				InitialSupply: "1000000",
			},
			wantErr: true,
			errMsg:  "symbol cannot be empty",
		},
		{
			name: "empty initial supply",
			msg: MsgCreateToken{
				Sender:    validSender,
				Name:      "Test Token",
				Symbol:    "TST",
				InitialSupply: "",
			},
			wantErr: true,
			errMsg:  "initial supply cannot be empty",
		},
		{
			name: "invalid referrer address",
			msg: MsgCreateToken{
				Sender:    validSender,
				Name:      "Test Token",
				Symbol:    "TST",
				InitialSupply: "1000000",
				Referrer:  "invalid-referrer",
			},
			wantErr: true,
			errMsg:  "invalid referrer address",
		},
		{
			name: "valid with referrer",
			msg: MsgCreateToken{
				Sender:    validSender,
				Name:      "Test Token",
				Symbol:    "TST",
				InitialSupply: "1000000",
				Referrer:  validReferrer,
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.msg.ValidateBasic()
			if tt.wantErr {
				require.Error(t, err)
				require.Contains(t, err.Error(), tt.errMsg)
			} else {
				require.NoError(t, err)
			}
		})
	}
}

func TestMsgCreateNftCollection_ValidateBasic(t *testing.T) {
	validSender := sdk.AccAddress([]byte("test1")).String()

	tests := []struct {
		name    string
		msg     MsgCreateNftCollection
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid message",
			msg: MsgCreateNftCollection{
				Sender: validSender,
				Name:   "Test NFT",
				Symbol: "TNFT",
			},
			wantErr: false,
		},
		{
			name: "invalid sender",
			msg: MsgCreateNftCollection{
				Sender: "invalid",
				Name:   "Test NFT",
				Symbol: "TNFT",
			},
			wantErr: true,
		},
		{
			name: "empty name",
			msg: MsgCreateNftCollection{
				Sender: validSender,
				Name:   "",
				Symbol: "TNFT",
			},
			wantErr: true,
		},
		{
			name: "empty symbol",
			msg: MsgCreateNftCollection{
				Sender: validSender,
				Name:   "Test NFT",
				Symbol: "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.msg.ValidateBasic()
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}

func TestMsgCreateMemeCoin_ValidateBasic(t *testing.T) {
	validSender := sdk.AccAddress([]byte("test1")).String()

	tests := []struct {
		name    string
		msg     MsgCreateMemeCoin
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid message",
			msg: MsgCreateMemeCoin{
				Sender:        validSender,
				Name:          "Meme Token",
				Symbol:        "MEME",
				InitialSupply: "1000000",
			},
			wantErr: false,
		},
		{
			name: "empty initial supply",
			msg: MsgCreateMemeCoin{
				Sender:        validSender,
				Name:          "Meme Token",
				Symbol:        "MEME",
				InitialSupply: "",
			},
			wantErr: true,
			errMsg:  "initial supply cannot be empty",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.msg.ValidateBasic()
			if tt.wantErr {
				require.Error(t, err)
				require.Contains(t, err.Error(), tt.errMsg)
			} else {
				require.NoError(t, err)
			}
		})
	}
}

func TestMsgRegisterReferral_ValidateBasic(t *testing.T) {
	addr1 := sdk.AccAddress([]byte("addr1")).String()
	addr2 := sdk.AccAddress([]byte("addr2")).String()

	tests := []struct {
		name    string
		msg     MsgRegisterReferral
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid message",
			msg: MsgRegisterReferral{
				Referrer: addr1,
				Referee:  addr2,
			},
			wantErr: false,
		},
		{
			name: "same referrer and referee",
			msg: MsgRegisterReferral{
				Referrer: addr1,
				Referee:  addr1,
			},
			wantErr: true,
			errMsg:  "cannot be the same",
		},
		{
			name: "invalid referrer",
			msg: MsgRegisterReferral{
				Referrer: "invalid",
				Referee:  addr2,
			},
			wantErr: true,
		},
		{
			name: "invalid referee",
			msg: MsgRegisterReferral{
				Referrer: addr1,
				Referee:  "invalid",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.msg.ValidateBasic()
			if tt.wantErr {
				require.Error(t, err)
				require.Contains(t, err.Error(), tt.errMsg)
			} else {
				require.NoError(t, err)
			}
		})
	}
}

func TestMsgUpdateParams_ValidateBasic(t *testing.T) {
	validAuthority := sdk.AccAddress([]byte("auth")).String()

	tests := []struct {
		name    string
		msg     MsgUpdateParams
		wantErr bool
	}{
		{
			name: "valid message",
			msg: MsgUpdateParams{
				Authority: validAuthority,
			},
			wantErr: false,
		},
		{
			name: "invalid authority",
			msg: MsgUpdateParams{
				Authority: "invalid",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.msg.ValidateBasic()
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
