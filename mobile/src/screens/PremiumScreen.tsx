import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { InAppPurchases } from 'expo-purchases';

export default function PremiumScreen() {
  const [isPremium, setIsPremium] = useState(false);
  const [energyBoost, setEnergyBoost] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    initPurchases();
  }, []);

  const initPurchases = async () => {
    try {
      await InAppPurchases.connect({ 
        apiKey: 'your-revenuecat-api-key' // Replace with real key
      });
    } catch (error) {
      console.log('Purchases init error:', error);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const premium = await SecureStore.getItemAsync('genx_premium');
      if (premium === 'true') {
        setIsPremium(true);
      }
    } catch (error) {
      console.log('Error checking premium:', error);
    }
  };

  const purchasePremium = async () => {
    try {
      const offerings = await InAppPurchases.getOfferings();
      const monthlyOffering = offerings.all?.monthly;
      
      if (monthlyOffering) {
        await InAppPurchases.purchasePackage(monthlyOffering.availablePackages[0]);
        setIsPremium(true);
        setEnergyBoost(true);
        await SecureStore.setItemAsync('genx_premium', 'true');
        Alert.alert('Success!', 'You are now a Premium member!');
      }
    } catch (error) {
      console.log('Purchase error:', error);
      Alert.alert('Error', 'Purchase failed. Please try again.');
    }
  };

  const purchaseEnergyBoost = async () => {
    try {
      const offerings = await InAppPurchases.getOfferings();
      const energyPack = offerings.all?.energy_boost;
      
      if (energyPack) {
        await InAppPurchases.purchasePackage(energyPack.availablePackages[0]);
        setEnergyBoost(true);
        Alert.alert('Energy Boost!', 'Your energy capacity increased to 150!');
      }
    } catch (error) {
      console.log('Purchase error:', error);
    }
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Go Premium</Text>
        <Text style={styles.subtitle}>Unlock the full mining potential</Text>

        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>⭐ PREMIUM ACTIVE</Text>
          </View>
        )}

        <View style={styles.benefits}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🚀</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>2x Mining Rewards</Text>
              <Text style={styles.benefitDesc}>Earn 1.0 GENX per tap instead of 0.5</Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🚫</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>No Ads</Text>
              <Text style={styles.benefitDesc}>Enjoy ad-free mining experience</Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>2x Daily Bonus</Text>
              <Text style={styles.benefitDesc}>Get 20 GENX daily instead of 10</Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎨</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Exclusive Themes</Text>
              <Text style={styles.benefitDesc}>Unlock premium UI themes</Text>
            </View>
          </View>
        </View>

        {!isPremium ? (
          <TouchableOpacity style={styles.purchaseButton} onPress={purchasePremium}>
            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.purchaseGradient}>
              <Text style={styles.purchasePrice}>$4.99/month</Text>
              <Text style={styles.purchaseText}>Get Premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.currentPlan}>
            <Text style={styles.currentPlanText}>Premium Member</Text>
          </View>
        )}

        <TouchableOpacity style={styles.boostButton} onPress={purchaseEnergyBoost}>
          <Text style={styles.boostText}>⚡ Buy Energy Boost - $0.99</Text>
        </TouchableOpacity>

        <View style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFD700', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 20 },
  premiumBadge: { backgroundColor: '#FFD700', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20 },
  premiumBadgeText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  benefits: { marginBottom: 30 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1F3A', padding: 15, borderRadius: 10, marginBottom: 10 },
  benefitIcon: { fontSize: 30, marginRight: 15 },
  benefitContent: { flex: 1 },
  benefitTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  benefitDesc: { color: '#888', fontSize: 12, marginTop: 2 },
  purchaseButton: { borderRadius: 10, overflow: 'hidden', marginBottom: 15 },
  purchaseGradient: { padding: 20, alignItems: 'center' },
  purchasePrice: { color: '#000', fontSize: 24, fontWeight: 'bold' },
  purchaseText: { color: '#000', fontSize: 18, marginTop: 5 },
  currentPlan: { backgroundColor: '#1A1F3A', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  currentPlanText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  boostButton: { backgroundColor: '#7B2FFF', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  boostText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  restoreButton: { alignItems: 'center', marginTop: 10 },
  restoreText: { color: '#888', fontSize: 14 },
});
