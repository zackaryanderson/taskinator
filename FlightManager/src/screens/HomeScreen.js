import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getFlights, deleteFlight } from '../services/storageService';
import { refreshFlight, buildFlightRecord } from '../services/flightService';
import { saveFlight } from '../services/storageService';
import { cancelFlightNotifications } from '../services/notificationService';
import FlightCard from '../components/FlightCard';
import { colors, spacing, radius, typography } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const [flights, setFlights] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFlights();
    }, [])
  );

  async function loadFlights() {
    const data = await getFlights();
    setFlights(data);
  }

  async function handleRefresh() {
    setRefreshing(true);
    const data = await getFlights();
    const refreshed = await Promise.all(data.map(refreshFlight));
    for (const f of refreshed) {
      await saveFlight(f);
    }
    setFlights(refreshed);
    setRefreshing(false);
  }

  function handleDelete(id) {
    Alert.alert('Remove Flight', 'Remove this flight from your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await cancelFlightNotifications(id);
          const updated = await deleteFlight(id);
          setFlights(updated);
        },
      },
    ]);
  }

  function renderEmpty() {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyPlane}>✈</Text>
        <Text style={styles.emptyTitle}>No flights yet</Text>
        <Text style={styles.emptySubtitle}>
          Add a flight with your confirmation number and we'll keep track of everything.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('AddFlight')}
        >
          <Text style={styles.emptyButtonText}>Add Your First Flight</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderFlight({ item }) {
    return (
      <FlightCard
        flight={item}
        onPress={() => navigation.navigate('FlightDetail', { flightId: item.id })}
        onLongPress={() => handleDelete(item.id)}
      />
    );
  }

  const upcomingFlights = flights.filter((f) => {
    if (!f.departureTime) return true;
    const dep = new Date(f.departureTime);
    const hoursAgo = (Date.now() - dep.getTime()) / (1000 * 60 * 60);
    return hoursAgo < 6;
  });

  const pastFlights = flights.filter((f) => {
    if (!f.departureTime) return false;
    const dep = new Date(f.departureTime);
    const hoursAgo = (Date.now() - dep.getTime()) / (1000 * 60 * 60);
    return hoursAgo >= 6;
  });

  const sections = [];
  if (upcomingFlights.length > 0) {
    sections.push({ type: 'header', title: 'Upcoming' });
    upcomingFlights.forEach((f) => sections.push({ type: 'flight', data: f }));
  }
  if (pastFlights.length > 0) {
    sections.push({ type: 'header', title: 'Past' });
    pastFlights.forEach((f) => sections.push({ type: 'flight', data: f }));
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[colors.background, colors.surface + '00']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Flights</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddFlight')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {flights.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item, idx) =>
            item.type === 'flight' ? item.data.id : `header_${idx}`
          }
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return <Text style={styles.sectionHeader}>{item.title}</Text>;
            }
            return (
              <FlightCard
                flight={item.data}
                onPress={() =>
                  navigation.navigate('FlightDetail', { flightId: item.data.id })
                }
                onLongPress={() => handleDelete(item.data.id)}
              />
            );
          }}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.largeTitle,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  list: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    ...typography.footnote,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyPlane: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.title2,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.subhead,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
