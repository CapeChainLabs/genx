import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';

export default function StatsScreen() {
  const [totalMined, setTotalMined] = useState(0);
  const [todayTaps, setTodayTaps] = useState(0);
  const [totalTaps, setTotalTaps] = useState(0);
  const [streak, setStreak] = useState(0);
  const [miningTime, setMiningTime] = useState('0h 0m');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const balance = await SecureStore.getItemAsync('genx_balance');
      const taps = await SecureStore.getItemAsync('genx_taps');
      const totalTapsStored = await SecureStore.getItemAsync('genx_total_taps');
      const streakCount = await SecureStore.getItemAsync('genx_streak');
      
      if (balance) setTotalMined(parseFloat(balance));
      if (taps) setTodayTaps(parseInt(taps));
      if (totalTapsStored) setTotalTaps(parseInt(totalTapsStored));
      else setTotalTaps(parseInt(taps || '0'));
      if (streakCount) setStreak(parseInt(streakCount));
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  return (
    <LinearGradient colors={['#0A0E27', '#1A1F3A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Mining Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalMined.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Total Mined</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayTaps}</Text>
            <Text style={styles.statLabel}>Today's Taps</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalTaps}</Text>
            <Text style={styles.statLabel}>Total Taps</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mining Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((todayTaps / 100) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{todayTaps}/100 daily energy used</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievement}>
            <Text style={styles.achievementIcon}>🎉</Text>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>First Tap</Text>
              <Text style={styles.achievementDesc}>Started mining journey</Text>
            </View>
          </View>
          {totalTaps >= 100 && (
            <View style={styles.achievement}>
              <Text style={styles.achievementIcon}>💎</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Century</Text>
                <Text style={styles.achievementDesc}>100 total taps</Text>
              </View>
            </View>
          )}
          {streak >= 7 && (
            <View style={styles.achievement}>
              <Text style={styles.achievementIcon}>🔥</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Week Warrior</Text>
                <Text style={styles.achievementDesc}>7 day streak</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leaderboard (Mock)</Text>
          <View style={styles.leaderboardItem}>
            <Text style={styles.rank}>1</Text>
            <Text style={styles.playerName}>You</Text>
            <Text style={styles.playerScore}>{totalMined.toFixed(1)} GENX</Text>
          </View>
          <View style={styles.leaderboardItem}>
            <Text style={styles.rank}>2</Text>
            <Text style={styles.playerName}>Miner123</Text>
            <Text style={styles.playerScore}>45.5 GENX</Text>
          </View>
          <View style={styles.leaderboardItem}>
            <Text style={styles.rank}>3</Text>
            <Text style={styles.playerName}>CryptoFan</Text>
            <Text style={styles.playerScore}>32.0 GENX</Text>
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { backgroundColor: '#1A1F3A', width: '48%', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#00D4FF' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 5 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 15 },
  progressBar: { height: 10, backgroundColor: '#1A1F3A', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00D4FF', borderRadius: 5 },
  progressText: { color: '#888', fontSize: 12, marginTop: 5 },
  achievement: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1F3A', padding: 15, borderRadius: 10, marginBottom: 10 },
  achievementIcon: { fontSize: 30, marginRight: 15 },
  achievementContent: { flex: 1 },
  achievementTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  achievementDesc: { color: '#888', fontSize: 12, marginTop: 2 },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1F3A', padding: 15, borderRadius: 10, marginBottom: 10 },
  rank: { color: '#00D4FF', fontSize: 18, fontWeight: 'bold', width: 30 },
  playerName: { flex: 1, color: '#FFF', fontSize: 16 },
  playerScore: { color: '#00D4FF', fontSize: 16, fontWeight: 'bold' },
});
