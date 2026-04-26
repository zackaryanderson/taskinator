import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { colors } from './src/utils/theme';
import HomeScreen from './src/screens/HomeScreen';
import AddFlightScreen from './src/screens/AddFlightScreen';
import FlightDetailScreen from './src/screens/FlightDetailScreen';
import CheckInScreen from './src/screens/CheckInScreen';

const Stack = createNativeStackNavigator();

const NavTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

export default function App() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      // Navigation from notification tap is handled inside the nav ref below
    });
    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer theme={NavTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddFlight" component={AddFlightScreen} />
        <Stack.Screen name="FlightDetail" component={FlightDetailScreen} />
        <Stack.Screen name="CheckIn" component={CheckInScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
