import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { getFlights, saveFlight } from '../services/storageService';
import { getAirline, buildCheckInUrl, isCheckInOpen } from '../utils/airlines';
import BoardingPassCard from '../components/BoardingPassCard';
import { colors, spacing, radius, typography } from '../utils/theme';

export default function CheckInScreen({ route, navigation }) {
  const { flightId } = route.params;
  const [flight, setFlight] = useState(null);
  const [mode, setMode] = useState('options'); // 'options' | 'boarding-pass' | 'web'
  const [webUrl, setWebUrl] = useState(null);

  useEffect(() => {
    loadFlight();
  }, [flightId]);

  async function loadFlight() {
    const flights = await getFlights();
    const f = flights.find((x) => x.id === flightId);
    setFlight(f || null);
  }

  async function markCheckedIn() {
    if (!flight) return;
    const updated = { ...flight, checkedIn: true, checkedInAt: new Date().toISOString() };
    await saveFlight(updated);
    setFlight(updated);
    Alert.alert('Checked In!', 'Your check-in has been recorded. Your boarding pass is ready below.');
    setMode('boarding-pass');
  }

  function handleOpenAirlineApp() {
    const airline = getAirline(flight.airlineCode);
    if (!airline) return;
    const url = buildCheckInUrl(airline, flight.confirmationNumber, flight.firstName, flight.lastName);
    if (!url) return;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        }
        // Fall back to web
        setWebUrl(url);
        setMode('web');
      })
      .catch(() => {
        setWebUrl(url);
        setMode('web');
      });
  }

  function handleOpenWeb() {
    const airline = getAirline(flight.airlineCode);
    if (!airline) return;
    const url = buildCheckInUrl(airline, flight.confirmationNumber, flight.firstName, flight.lastName);
    setWebUrl(url);
    setMode('web');
  }

  if (!flight) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const airline = getAirline(flight.airlineCode);
  const checkInOpen = isCheckInOpen(flight);
  const airlineColor = airline?.color || colors.primary;

  if (mode === 'web' && webUrl) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => setMode('options')} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Check In</Text>
          <TouchableOpacity onPress={markCheckedIn} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done ✓</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: webUrl }}
          style={{ flex: 1 }}
          onNavigationStateChange={(state) => {
            // Detect common confirmation page patterns
            if (
              state.url.includes('confirmed') ||
              state.url.includes('success') ||
              state.url.includes('checkin-confirmation')
            ) {
              markCheckedIn();
            }
          }}
        />
      </SafeAreaView>
    );
  }

  if (mode === 'boarding-pass') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Boarding Pass</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.checkedBanner}>
            <Text style={styles.checkedBannerIcon}>✅</Text>
            <View>
              <Text style={styles.checkedBannerTitle}>You're checked in!</Text>
              <Text style={styles.checkedBannerSub}>
                Show this boarding pass at the gate.
              </Text>
            </View>
          </View>

          {airline?.note ? (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>ℹ️  {airline.note}</Text>
            </View>
          ) : null}

          <BoardingPassCard flight={flight} />

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>At the Airport</Text>
            <Text style={styles.tipItem}>• Arrive at least 90 min before domestic flights</Text>
            <Text style={styles.tipItem}>• Check your gate — it may change</Text>
            <Text style={styles.tipItem}>• TSA PreCheck / Clear lines if you have it</Text>
            {flight.departureGate ? (
              <Text style={styles.tipItem}>• Current gate: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{flight.departureGate}</Text></Text>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Options screen
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Check In</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={[styles.airlineHeader, { borderColor: airlineColor + '55' }]}>
          <View style={[styles.airlineDot, { backgroundColor: airlineColor }]} />
          <View style={styles.airlineHeaderText}>
            <Text style={styles.airlineHeaderName}>{airline?.name || flight.airlineName}</Text>
            <Text style={styles.airlineHeaderConf}>Conf: {flight.confirmationNumber}</Text>
          </View>
          {flight.checkedIn && (
            <View style={styles.checkedSmall}>
              <Text style={styles.checkedSmallText}>✓ Checked In</Text>
            </View>
          )}
        </View>

        {!checkInOpen && !flight.checkedIn ? (
          <View style={styles.closedCard}>
            <Text style={styles.closedIcon}>🔒</Text>
            <Text style={styles.closedTitle}>Check-in Not Open Yet</Text>
            <Text style={styles.closedSub}>
              Online check-in opens 24 hours before your departure.
            </Text>
          </View>
        ) : (
          <>
            {!flight.checkedIn && (
              <View style={styles.openBanner}>
                <Text style={styles.openBannerText}>✈️  Check-in is open!</Text>
              </View>
            )}

            <Text style={styles.sectionLabel}>CHECK IN OPTIONS</Text>

            {/* Option: Airline app */}
            <TouchableOpacity style={styles.optionCard} onPress={handleOpenAirlineApp}>
              <View style={[styles.optionIcon, { backgroundColor: airlineColor + '22' }]}>
                <Text style={{ fontSize: 22 }}>📱</Text>
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Open Airline Website</Text>
                <Text style={styles.optionSub}>
                  Check in on {airline?.name || 'the airline'}'s official website
                </Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>

            {/* Option: Mark as checked in */}
            <TouchableOpacity
              style={[styles.optionCard, flight.checkedIn && styles.optionCardChecked]}
              onPress={flight.checkedIn ? () => setMode('boarding-pass') : markCheckedIn}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.successDim }]}>
                <Text style={{ fontSize: 22 }}>✅</Text>
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  {flight.checkedIn ? 'View Boarding Pass' : 'Mark as Checked In'}
                </Text>
                <Text style={styles.optionSub}>
                  {flight.checkedIn
                    ? 'Show your boarding pass at the gate'
                    : 'Already checked in? Mark it here to show your boarding pass'}
                </Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Passenger info reminder */}
        <Text style={styles.sectionLabel}>YOUR INFO</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>
              {[flight.firstName, flight.lastName].filter(Boolean).join(' ') || '—'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Confirmation</Text>
            <Text style={styles.infoValue}>{flight.confirmationNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Flight</Text>
            <Text style={styles.infoValue}>{flight.flightNumber || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Route</Text>
            <Text style={styles.infoValue}>
              {flight.departureAirport} → {flight.arrivalAirport}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  doneBtn: { width: 60, alignItems: 'flex-end' },
  doneBtnText: { color: colors.success, fontSize: 15, fontWeight: '600' },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  airlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  airlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  airlineHeaderText: { flex: 1 },
  airlineHeaderName: { ...typography.headline },
  airlineHeaderConf: { ...typography.subhead, color: colors.textTertiary },
  checkedSmall: {
    backgroundColor: colors.successDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  checkedSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  closedCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  closedIcon: { fontSize: 40 },
  closedTitle: { ...typography.headline },
  closedSub: { ...typography.subhead, textAlign: 'center', lineHeight: 20 },
  openBanner: {
    backgroundColor: colors.primaryDim,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  openBannerText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  sectionLabel: {
    ...typography.caption1,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  optionCardChecked: {
    borderColor: colors.success + '55',
    backgroundColor: colors.successDim,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1 },
  optionTitle: { ...typography.headline, marginBottom: 2 },
  optionSub: { ...typography.footnote, lineHeight: 18 },
  optionArrow: { fontSize: 22, color: colors.textTertiary },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { ...typography.subhead, color: colors.textTertiary },
  infoValue: { ...typography.subhead, fontWeight: '500' },
  checkedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.successDim,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  checkedBannerIcon: { fontSize: 32 },
  checkedBannerTitle: { ...typography.headline, color: colors.success },
  checkedBannerSub: { ...typography.footnote, color: colors.success, opacity: 0.8 },
  noteCard: {
    backgroundColor: colors.warningDim,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noteText: { ...typography.footnote, color: colors.warning, lineHeight: 18 },
  tipsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tipsTitle: { ...typography.headline, marginBottom: spacing.xs },
  tipItem: { ...typography.subhead, lineHeight: 22, color: colors.textSecondary },
});
