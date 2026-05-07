package cli

import (
	"strconv"

	"cosmossdk.io/math"
	"github.com/capechain/genx/x/creation/types"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"
)

func GetTxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "Creation Mode transactions subcommands",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	cmd.AddCommand(CmdCreateToken())
	cmd.AddCommand(CmdCreateNftCollection())
	cmd.AddCommand(CmdCreateMemeCoin())
	cmd.AddCommand(CmdRegisterReferral())

	return cmd
}

func CmdCreateToken() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create-token [name] [symbol] [description] [initial_supply] [decimals] [royalty_percentage] [liquidation_protection] [referrer]",
		Short: "Create a new token",
		Args:  cobra.ExactArgs(8),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			decimals, err := strconv.ParseUint(args[4], 10, 64)
			if err != nil {
				return err
			}

			royalty, err := math.LegacyNewDecFromStr(args[5])
			if err != nil {
				return err
			}

			liqProtection, err := strconv.ParseBool(args[6])
			if err != nil {
				return err
			}

			msg := &types.MsgCreateToken{
				Sender:                clientCtx.GetFromAddress().String(),
				Name:                  args[0],
				Symbol:                args[1],
				Description:           args[2],
				InitialSupply:         args[3],
				Decimals:              decimals,
				RoyaltyPercentage:     royalty,
				LiquidationProtection: liqProtection,
				Referrer:              args[7],
			}

			if err := msg.ValidateBasic(); err != nil {
				return err
			}

			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func CmdCreateNftCollection() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create-nft-collection [name] [symbol] [description] [metadata_uri] [royalty_percentage] [max_supply] [liquidation_protection] [referrer]",
		Short: "Create a new NFT collection",
		Args:  cobra.ExactArgs(8),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			maxSupply, err := strconv.ParseUint(args[5], 10, 64)
			if err != nil {
				return err
			}

			royalty, err := math.LegacyNewDecFromStr(args[4])
			if err != nil {
				return err
			}

			liqProtection, err := strconv.ParseBool(args[6])
			if err != nil {
				return err
			}

			msg := &types.MsgCreateNftCollection{
				Sender:                clientCtx.GetFromAddress().String(),
				Name:                  args[0],
				Symbol:                args[1],
				Description:           args[2],
				MetadataUri:           args[3],
				RoyaltyPercentage:     royalty,
				MaxSupply:             maxSupply,
				LiquidationProtection: liqProtection,
				Referrer:              args[7],
			}

			if err := msg.ValidateBasic(); err != nil {
				return err
			}

			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func CmdCreateMemeCoin() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create-meme-coin [name] [symbol] [description] [initial_supply] [decimals] [bonding_curve_type] [launch_price] [liquidation_protection] [referrer]",
		Short: "Create a new meme coin",
		Args:  cobra.ExactArgs(9),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			decimals, err := strconv.ParseUint(args[4], 10, 64)
			if err != nil {
				return err
			}

			launchPrice, err := math.LegacyNewDecFromStr(args[6])
			if err != nil {
				return err
			}

			liqProtection, err := strconv.ParseBool(args[7])
			if err != nil {
				return err
			}

			msg := &types.MsgCreateMemeCoin{
				Sender:                clientCtx.GetFromAddress().String(),
				Name:                  args[0],
				Symbol:                args[1],
				Description:           args[2],
				InitialSupply:         args[3],
				Decimals:              decimals,
				BondingCurveType:      args[5],
				LaunchPrice:           launchPrice,
				LiquidationProtection: liqProtection,
				Referrer:              args[8],
			}

			if err := msg.ValidateBasic(); err != nil {
				return err
			}

			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func CmdRegisterReferral() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "register-referral [referrer] [referee]",
		Short: "Register a referral relationship",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			msg := &types.MsgRegisterReferral{
				Referrer: args[0],
				Referee:  args[1],
			}

			if err := msg.ValidateBasic(); err != nil {
				return err
			}

			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)
	return cmd
}
