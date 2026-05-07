import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import MineScreen from './src/screens/MineScreen';
import WalletScreen from './src/screens/WalletScreen';
import StatsScreen from './src/screens/StatsScreen';
import PremiumScreen from './src/screens/PremiumScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0A0E27',
            borderTopColor: '#1A1F3A',
            borderTopWidth: 1,
            paddingBottom: 5,
            height: 60,
          },
          tabBarActiveTintColor: '#00D4FF',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tab.Screen
          name="Mine"
          component={MineScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="diamond" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Wallet"
          component={WalletScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Premium"
          component={PremiumScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="star" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
