package cli

import (
	"fmt"

	"github.com/capechain/genx/x/creation/types"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
)

func NewTxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "Creation Mode transactions subcommands",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	return cmd
}

func GetQueryCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "Querying commands for the creation module",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	cmd.AddCommand(CmdQueryParams())
	cmd.AddCommand(CmdQueryTotalAssets())

	return cmd
}

func CmdQueryParams() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "params",
		Short: "Show creation module parameters",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientQueryContext(cmd)
			if err != nil {
				return err
			}
			fmt.Println("Query params endpoint: /genx/creation/params")
			_ = clientCtx
			return nil
		},
	}
	return cmd
}

func CmdQueryTotalAssets() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "total-assets",
		Short: "Query total number of assets created",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientQueryContext(cmd)
			if err != nil {
				return err
			}
			fmt.Println("Query total assets endpoint: /genx/creation/total_assets")
			_ = clientCtx
			return nil
		},
	}
	return cmd
}
