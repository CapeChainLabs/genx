import { Registry, StdFee, coins } from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { QueryClient, setupBankExtension, setupStakingExtension } from '@cosmjs/stargate';
import * as SecureStore from 'expo-secure-store';

const GENX_CHAIN_ID = 'genx';
const GENX_RPC = 'http://92.4.128.172:26657';
const GENX_REST = 'http://92.4.128.172:1317';

export interface GenXWallet {
  address: string;
  balance: { denom: string; amount: string }[];
}

class WalletService {
  private wallet: DirectSecp256k1HdWallet | null = null;
  private registry: Registry | null = null;

  async createWallet(mnemonic?: string): Promise<GenXWallet> {
    if (mnemonic) {
      this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'genx' });
    } else {
      this.wallet = await DirectSecp256k1HdWallet.generate(24, { prefix: 'genx' });
      const mnemonic = this.wallet.mnemonic;
      await SecureStore.setItemAsync('genx_mnemonic', mnemonic);
    }

    const accounts = await this.wallet.getAccounts();
    return {
      address: accounts[0].address,
      balance: [],
    };
  }

  async loadWallet(): Promise<GenXWallet | null> {
    try {
      const mnemonic = await SecureStore.getItemAsync('genx_mnemonic');
      if (!mnemonic) return null;

      this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'genx' });
      const accounts = await this.wallet.getAccounts();
      
      // Get balance
      const tmClient = await Tendermint34Client.connect(GENX_RPC);
      const queryClient = QueryClient.withExtensions(tmClient, setupBankExtension);
      const balance = await queryClient.bank.allBalances(accounts[0].address);

      return {
        address: accounts[0].address,
        balance: balance.map(coin => ({ denom: coin.denom, amount: coin.amount })),
      };
    } catch (error) {
      console.error('Error loading wallet:', error);
      return null;
    }
  }

  async sendTokens(toAddress: string, amount: string, denom: string = 'ugenx'): Promise<string> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    const accounts = await this.wallet.getAccounts();
    const { SigningStargateClient } = await import('@cosmjs/stargate');
    const client = await SigningStargateClient.connectWithSigner(GENX_RPC, this.wallet);

    const fee: StdFee = { amount: coins(2000, 'ugenx'), gas: '200000' };
    const result = await client.sendTokens(accounts[0].address, toAddress, coins(amount, denom), fee);

    return result.transactionHash;
  }

  async getBalance(): Promise<{ denom: string; amount: string }[]> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    const accounts = await this.wallet.getAccounts();
    const tmClient = await Tendermint34Client.connect(GENX_RPC);
    const queryClient = QueryClient.withExtensions(tmClient, setupBankExtension);
    const balance = await queryClient.bank.allBalances(accounts[0].address);

    return balance.map(coin => ({ denom: coin.denom, amount: coin.amount }));
  }

  async claimMiningRewards(amount: number): Promise<string> {
    // In a real implementation, this would call a smart contract or module
    // For now, we simulate by transferring from a reward pool
    return `mining_reward_${Date.now()}`;
  }
}

export const walletService = new WalletService();
