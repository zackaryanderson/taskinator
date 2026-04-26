import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getFlights, saveFlight } from '../services/storageService';
import { refreshFlight } from '../services/flightService';
import { getAirline, getFlightStatus, isCheckInOpen, isBoardingOpen } from '../utils/airlines';
import BoardingPassCard from '../components/BoardingPassCard';
import StatusBadge from '../components/StatusBadge';
import { colors, spacing, radius, typography } from '../utils/theme';
import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';

function fmt(iso, pattern) {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? parseISO(iso) : new Date(iso);
    return isValid(d) ? format(d, pattern) : '—';
  } catch {
    return '—';
  }
}

function InfoRow({ label, value, highlight }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: colors.primary }]}>
        {value || '—'}
      </Text>
    </View>
  );
}

export default function FlightDetailScreen({ route, navigation }) {
  const { flightId } = route.params;
  const [flight, setFlight] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFlight();
    }, [flightId])
  );

  async function loadFlight() {
    const flights = await getFlights();
    const f = flights.find((x) => x.id === flightId);
    setFlight(f || null);
  }

  async function handleRefresh() {
    if (!flight) return;
    setRefreshing(true);
    const updated = await refreshFlight(flight);
    await saveFlight(updated);
    setFlight(updated);
    setRefreshing(false);
  }

  if (!flight) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const airline = getAirline(flight.airlineCode);
  const airlineColor = airline?.color || colors.primary;
  const checkInOpen = isCheckInOpen(flight);
  const boardingNow = isBoardingOpen(flight);
  const { label: statusLabel, color: statusColor } = getFlightStatus(flight);

  const timeUntilDep = flight.departureTime
    ? formatDistanceToNow(
        typeof flight.departureTime === 'string'
          ? parseISO(flight.departureTime)
          : new Date(flight.departureTime),
        { addSuffix: true }
      )
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{flight.flightNumber || flight.confirmationNumber}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero */}
        <LinearGradient
          colors={[airlineColor + '44', colors.background]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.airlineName}>
                {airline?.name || flight.airlineName || flight.airlineCode}
              </Text>
              {flight.flightNumber ? (
                <Text style={styles.flightNum}>{flight.flightNumber}</Text>
              ) : null}
            </View>
            <StatusBadge flight={flight} />
          </View>

          <View style={styles.heroRoute}>
            <View style={styles.heroAirport}>
              <Text style={styles.heroIata}>{flight.departureAirport || '???'}</Text>
              <Text style={styles.heroTime}>{fmt(flight.departureTime, 'h:mm a')}</Text>
              <Text style={styles.heroDate}>{fmt(flight.departureTime, 'EEE, MMM d')}</Text>
            </View>
            <View style={styles.heroDivider}>
              <Text style={styles.heroDividerText}>✈</Text>
            </View>
            <View style={[styles.heroAirport, { alignItems: 'flex-end' }]}>
              <Text style={styles.heroIata}>{flight.arrivalAirport || '???'}</Text>
              <Text style={styles.heroTime}>{fmt(flight.arrivalTime, 'h:mm a')}</Text>
              <Text style={styles.heroDate}>{fmt(flight.arrivalTime, 'EEE, MMM d')}</Text>
            </View>
          </View>

          {timeUntilDep && (
            <Text style={styles.countdown}>Departs {timeUntilDep}</Text>
          )}
        </LinearGradient>

        {/* Action buttons */}
        {(checkInOpen || boardingNow) && (
          <View style={styles.actionSection}>
            {boardingNow && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.success }]}
                onPress={() => navigation.navigate('CheckIn', { flightId: flight.id })}
              >
                <Text style={styles.actionBtnText}>🚪 Boarding Now — View Pass</Text>
              </TouchableOpacity>
            )}
            {checkInOpen && !flight.checkedIn && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('CheckIn', { flightId: flight.id })}
              >
                <Text style={styles.actionBtnText}>Check In Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Boarding pass */}
        <Text style={styles.sectionTitle}>Boarding Pass</Text>
        <BoardingPassCard flight={flight} />

        {/* Departure info */}
        <Text style={styles.sectionTitle}>Departure</Text>
        <View style={styles.card}>
          <InfoRow label="Airport" value={`${flight.departureAirport}${flight.departureCity ? ' · ' + flight.departureCity : ''}`} />
          <InfoRow label="Terminal" value={flight.departureTerminal} />
          <InfoRow label="Gate" value={flight.departureGate} highlight />
          <InfoRow label="Scheduled" value={fmt(flight.departureTime, 'h:mm a, EEE MMM d')} />
        </View>

        {/* Arrival info */}
        <Text style={styles.sectionTitle}>Arrival</Text>
        <View style={styles.card}>
          <InfoRow label="Airport" value={`${flight.arrivalAirport}${flight.arrivalCity ? ' · ' + flight.arrivalCity : ''}`} />
          <InfoRow label="Terminal" value={flight.arrivalTerminal} />
          <InfoRow label="Gate" value={flight.arrivalGate} highlight />
          <InfoRow label="Scheduled" value={fmt(flight.arrivalTime, 'h:mm a, EEE MMM d')} />
        </View>

        {/* Booking info */}
        <Text style={styles.sectionTitle}>Booking</Text>
        <View style={styles.card}>
          <InfoRow label="Confirmation" value={flight.confirmationNumber} />
          <InfoRow label="Passenger" value={[flight.firstName, flight.lastName].filter(Boolean).join(' ') || '—'} />
          <InfoRow label="Aircraft" value={flight.aircraft} />
          {airline?.note ? (
            <View style={styles.noteRow}>
              <Text style={styles.noteText}>ℹ️  {airline.note}</Text>
            </View>
          ) : null}
        </View>

        {flight.lastRefreshed && (
          <Text style={styles.refreshNote}>
            Last updated {formatDistanceToNow(new Date(flight.lastRefreshed), { addSuffix: true })}
            {' · Pull down to refresh'}
          </Text>
        )}

        {/* Check-in button at bottom */}
        <TouchableOpacity
          style={[
            styles.checkInBtn,
            flight.checkedIn && { backgroundColor: colors.success },
            !checkInOpen && !flight.checkedIn && { opacity: 0.5 },
          ]}
          onPress={() => navigation.navigate('CheckIn', { flightId: flight.id })}
          disabled={!checkInOpen && !flight.checkedIn}
        >
          <Text style={styles.checkInBtnText}>
            {flight.checkedIn ? '✓ Checked In — View Options' : 'Check In'}
          </Text>
        </TouchableOpacity>

        {!checkInOpen && !flight.checkedIn && flight.departureTime && (
          <Text style={styles.checkInNote}>
            Check-in opens 24 hours before departure
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 60 },
  backText: { color: colors.primary, fontSize: 17 },
  navTitle: { ...typography.headline },
  scroll: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  hero: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  airlineName: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  flightNum: {
    ...typography.title3,
    marginTop: 2,
  },
  heroRoute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroAirport: {
    flex: 1,
  },
  heroIata: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  heroTime: {
    ...typography.subhead,
    marginTop: 2,
  },
  heroDate: {
    ...typography.caption1,
  },
  heroDivider: {
    paddingHorizontal: spacing.md,
  },
  heroDividerText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  countdown: {
    ...typography.footnote,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  actionSection: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.footnote,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.subhead,
    color: colors.textTertiary,
  },
  infoValue: {
    ...typography.subhead,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  noteRow: {
    padding: spacing.md,
    backgroundColor: colors.warningDim,
    borderRadius: radius.md,
    margin: spacing.sm,
  },
  noteText: {
    ...typography.footnote,
    color: colors.warning,
    lineHeight: 18,
  },
  refreshNote: {
    ...typography.caption2,
    color: colors.textTertiary,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  checkInBtn: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  checkInNote: {
    ...typography.caption1,
    color: colors.textTertiary,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
});
