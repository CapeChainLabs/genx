import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { AdMobRewarded } from 'expo-ads-admob';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [genxPrice, setGenxPrice] = useState(0.10); // Mock price $0.10
  const [usdBalance, setUsdBalance] = useState(0);

  useEffect(() => {
    loadBalance();
    initAds();
  }, []);

  const initAds = async () => {
    await AdMobRewarded.setAdUnitID('ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy'); // Replace with real ID
  };

  const loadBalance = async () => {
    try {
      const savedBalance = await SecureStore.getItemAsync('genx_balance');
      if (savedBalance) {
        const bal = parseFloat(savedBalance);
        setBalance(bal);
        setUsdBalance(bal * genxPrice);
      }
    } catch (error) {
      console.log('Error loading balance:', error);
    }
  };

  const watchAdForTokens = async () => {
    try {
      await AdMobRewarded.requestAdAsync();
      await AdMobRewarded.showAdAsync();
      const newBalance = balance + 5;
      setBalance(newBalance);
      setUsdBalance(newBalance * genxPrice);
      await SecureStore.setItemAsync('genx_balance', newBalance.toString());
    } catch (error) {
      console.log('Ad error:', error);
    }
  };

  const buyTokens = (amount: number) => {
    // Mock purchase - in real app integrate with wallet
    const newBalance = balance + amount;
    setBalance(newBalance);
    setUsdBalance(newBalance * genxPrice);
    SecureStore.setItemAsync('genx_balance', newBalance.toString());
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Wallet</Text>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>GENX Balance</Text>
          <Text style={styles.balanceAmount}>{balance.toFixed(1)} GENX</Text>
          <Text style={styles.usdValue}>≈ ${usdBalance.toFixed(2)} USD</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earn More Tokens</Text>
          <TouchableOpacity style={styles.adButton} onPress={watchAdForTokens}>
            <Text style={styles.buttonText}>Watch Ad (+5 GENX)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buy Tokens</Text>
          <View style={styles.buyButtons}>
            <TouchableOpacity style={styles.buyButton} onPress={() => buyTokens(100)}>
              <Text style={styles.buyAmount}>100 GENX</Text>
              <Text style={styles.buyPrice}>$10</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyButton} onPress={() => buyTokens(500)}>
              <Text style={styles.buyAmount}>500 GENX</Text>
              <Text style={styles.buyPrice}>$45</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyButton} onPress={() => buyTokens(1000)}>
              <Text style={styles.buyAmount}>1000 GENX</Text>
              <Text style={styles.buyPrice}>$80</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <View style={styles.transaction}>
            <Text style={styles.txText}>Mining Reward</Text>
            <Text style={styles.txAmount}>+{balance > 0 ? '50.0' : '0.0'} GENX</Text>
          </View>
          <View style={styles.transaction}>
            <Text style={styles.txText}>Daily Bonus</Text>
            <Text style={styles.txAmount}>+10.0 GENX</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#00D4FF', marginBottom: 20 },
  balanceCard: { backgroundColor: '#1A1F3A', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 30 },
  balanceLabel: { color: '#888', fontSize: 14, textTransform: 'uppercase' },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
  usdValue: { color: '#00D4FF', fontSize: 18 },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  adButton: { backgroundColor: '#7B2FFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  buyButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  buyButton: { backgroundColor: '#1A1F3A', padding: 15, borderRadius: 10, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  buyAmount: { color: '#00D4FF', fontSize: 16, fontWeight: 'bold' },
  buyPrice: { color: '#888', fontSize: 14, marginTop: 5 },
  transaction: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1A1F3A' },
  txText: { color: '#FFF', fontSize: 14 },
  txAmount: { color: '#00D4FF', fontSize: 14, fontWeight: 'bold' },
});
