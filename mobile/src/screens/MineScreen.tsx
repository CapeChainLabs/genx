import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, 
  StatusBar, Easing, Alert, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function MineScreen() {
  const [balance, setBalance] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [lastClaim, setLastClaim] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [streak, setStreak] = useState(0);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const energyAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    checkDailyReset();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadUserData = async () => {
    try {
      const savedBalance = await SecureStore.getItemAsync('genx_balance');
      const savedTapCount = await SecureStore.getItemAsync('genx_taps');
      const savedLastClaim = await SecureStore.getItemAsync('genx_last_claim');
      const savedPremium = await SecureStore.getItemAsync('genx_premium');
      const savedStreak = await SecureStore.getItemAsync('genx_streak');
      
      if (savedBalance) setBalance(parseInt(savedBalance));
      if (savedTapCount) setTapCount(parseInt(savedTapCount));
      if (savedLastClaim) setLastClaim(parseInt(savedLastClaim));
      if (savedPremium) setIsPremium(savedPremium === 'true');
      if (savedStreak) setStreak(parseInt(savedStreak));
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const checkDailyReset = () => {
    const now = Date.now();
    if (lastClaim) {
      const hoursSinceClaim = (now - lastClaim) / (1000 * 60 * 60);
      if (hoursSinceClaim >= 24) {
        setEnergy(100);
        setTapCount(0);
        setStreak(streak + 1);
        SecureStore.setItemAsync('genx_streak', (streak + 1).toString());
      }
    }
  };

  const handleTap = () => {
    if (energy <= 0) {
      Alert.alert('Energy Depleted!', 'Come back in 24 hours or watch an ad to refill.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const reward = isPremium ? 1.0 : 0.5;
    const newBalance = balance + reward;
    const newTapCount = tapCount + 1;
    const newEnergy = Math.max(0, energy - 1);

    setBalance(newBalance);
    setTapCount(newTapCount);
    setEnergy(newEnergy);

    SecureStore.setItemAsync('genx_balance', newBalance.toString());
    SecureStore.setItemAsync('genx_taps', newTapCount.toString());

    // Animate tap
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Spin animation
    Animated.timing(rotateAnim, {
      toValue: rotateAnim._value + 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (newEnergy === 0) {
      setLastClaim(Date.now());
      SecureStore.setItemAsync('genx_last_claim', Date.now().toString());
    }
  };

  const claimDaily = () => {
    const now = Date.now();
    if (lastClaim && (now - lastClaim) < 24 * 60 * 60 * 1000) return;

    const bonus = isPremium ? 20 : 10;
    setBalance(balance + bonus);
    setEnergy(100);
    setTapCount(0);
    setLastClaim(now);
    setStreak(streak + 1);
    
    SecureStore.setItemAsync('genx_balance', (balance + bonus).toString());
    SecureStore.setItemAsync('genx_last_claim', now.toString());
    SecureStore.setItemAsync('genx_streak', (streak + 1).toString());

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const energyPercent = (energy / 100) * 100;
  const timeUntilReset = lastClaim 
    ? Math.max(0, 24 * 60 * 60 * 1000 - (Date.now() - lastClaim))
    : 0;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient 
      colors={['#0A0E27', '#141834', '#0A0E27']} 
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>GenX Mining</Text>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>BALANCE</Text>
          <Text style={styles.balance}>{balance.toFixed(1)} GENX</Text>
          <Text style={styles.usdValue}>≈ ${(balance * 0.10).toFixed(2)}</Text>
        </View>
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak} Day Streak</Text>
          </View>
        )}
      </View>

      {/* Mining Button */}
      <View style={styles.miningContainer}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={handleTap}
          disabled={energy <= 0}
        >
          <Animated.View style={[
            styles.miningButtonOuter,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <LinearGradient
              colors={energy > 0 ? ['#00D4FF20', '#7B2FFF20'] : ['#33333320', '#55555520']}
              style={styles.miningButtonGlow}
            >
              <Animated.View style={[
                styles.miningButton,
                { 
                  transform: [
                    { scale: scaleAnim },
                    { rotate: spin }
                  ] 
                }
              ]}>
                <LinearGradient
                  colors={energy > 0 ? ['#00D4FF', '#7B2FFF'] : ['#444', '#666']}
                  style={styles.miningGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.coinSymbol}>G</Text>
                  <Text style={styles.tapText}>TAP TO MINE</Text>
                  <Text style={styles.rewardText}>+{isPremium ? '1.0' : '0.5'} GENX</Text>
                </LinearGradient>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        {/* Energy Bar */}
        <View style={styles.energyContainer}>
          <View style={styles.energyBar}>
            <Animated.View style={[
              styles.energyFill, 
              { width: `${energyPercent}%` }
            ]} />
          </View>
          <View style={styles.energyRow}>
            <Text style={styles.energyText}>⚡ {energy}/100 Energy</Text>
            {isPremium && <Text style={styles.premiumBadge}>⭐ 2x</Text>}
          </View>
        </View>

        <Text style={styles.tapCount}>Taps today: {tapCount}/100</Text>
      </View>

      {/* Daily Bonus */}
      <TouchableOpacity 
        style={[styles.dailyButton, timeUntilReset > 0 && styles.dailyButtonDisabled]} 
        onPress={claimDaily}
        disabled={timeUntilReset > 0}
      >
        <LinearGradient
          colors={timeUntilReset > 0 ? ['#333', '#444'] : ['#FFD700', '#FFA500']}
          style={styles.dailyGradient}
        >
          <Text style={styles.dailyEmoji}>{timeUntilReset > 0 ? '⏰' : '🎁'}</Text>
          <Text style={styles.dailyButtonText}>
            {timeUntilReset > 0 
              ? `${Math.floor(timeUntilReset / (1000 * 60 * 60))}h ${Math.ceil((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60))}m`
              : `Claim Daily Bonus (+${isPremium ? '20' : '10'} GENX)`
            }
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tapCount}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{balance.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight || 44,
  },
  header: { 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: { 
    fontSize: 34, 
    fontWeight: '800', 
    color: '#00D4FF', 
    letterSpacing: 3,
    textShadowColor: '#00D4FF40',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  balanceCard: {
    backgroundColor: '#1A1F3A80',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 15,
    width: width * 0.8,
    borderWidth: 1,
    borderColor: '#00D4FF30',
  },
  balanceLabel: { 
    fontSize: 12, 
    color: '#888', 
    letterSpacing: 2,
    fontWeight: '600',
  },
  balance: { 
    fontSize: 42, 
    fontWeight: '800', 
    color: '#FFFFFF',
    marginTop: 5,
  },
  usdValue: { 
    fontSize: 16, 
    color: '#00D4FF',
    marginTop: 5,
    fontWeight: '600',
  },
  streakBadge: {
    backgroundColor: '#FF6B0030',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FF6B0060',
  },
  streakText: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '700',
  },
  miningContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  miningButtonOuter: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: width * 0.325,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  miningButtonGlow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miningButton: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
    overflow: 'hidden',
  },
  miningGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinSymbol: {
    fontSize: 70,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: '#00000040',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  tapText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: 2,
  },
  rewardText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 5,
    fontWeight: '600',
  },
  energyContainer: {
    width: width * 0.8,
    marginTop: 30,
  },
  energyBar: {
    height: 10,
    backgroundColor: '#1A1F3A',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2F4A',
  },
  energyFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 5,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  energyText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  premiumBadge: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
  },
  tapCount: {
    color: '#666',
    fontSize: 14,
    marginTop: 15,
    fontWeight: '500',
  },
  dailyButton: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
  },
  dailyButtonDisabled: {
    opacity: 0.6,
  },
  dailyGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  dailyButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 'auto',
    paddingBottom: 40,
  },
  statCard: {
    backgroundColor: '#1A1F3A80',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#2A2F4A',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00D4FF',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
