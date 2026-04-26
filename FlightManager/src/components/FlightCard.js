import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography } from '../utils/theme';
import { getAirline, getFlightStatus } from '../utils/airlines';
import StatusBadge from './StatusBadge';
import { format, parseISO, isValid } from 'date-fns';

function formatTime(iso) {
  if (!iso) return '--:--';
  try {
    const d = typeof iso === 'string' ? parseISO(iso) : new Date(iso);
    return isValid(d) ? format(d, 'h:mm a') : '--:--';
  } catch {
    return '--:--';
  }
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = typeof iso === 'string' ? parseISO(iso) : new Date(iso);
    return isValid(d) ? format(d, 'EEE, MMM d') : '';
  } catch {
    return '';
  }
}

export default function FlightCard({ flight, onPress }) {
  const airline = getAirline(flight.airlineCode);
  const { color: statusColor } = getFlightStatus(flight);
  const airlineColor = airline?.color || colors.primary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.wrapper}>
      <LinearGradient
        colors={[colors.surfaceElevated, colors.surface]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Airline stripe */}
        <View style={[styles.stripe, { backgroundColor: airlineColor }]} />

        <View style={styles.content}>
          {/* Top row */}
          <View style={styles.topRow}>
            <View style={styles.airlineRow}>
              <Text style={styles.airlineText}>
                {airline?.name || flight.airlineName || flight.airlineCode}
              </Text>
              {flight.flightNumber ? (
                <Text style={styles.flightNum}>{flight.flightNumber}</Text>
              ) : null}
            </View>
            <StatusBadge flight={flight} />
          </View>

          {/* Route row */}
          <View style={styles.routeRow}>
            <View style={styles.airport}>
              <Text style={styles.iata}>{flight.departureAirport || '???'}</Text>
              <Text style={styles.time}>{formatTime(flight.departureTime)}</Text>
              {flight.departureGate ? (
                <Text style={styles.gate}>Gate {flight.departureGate}</Text>
              ) : null}
            </View>

            <View style={styles.routeMid}>
              <View style={[styles.dot, { backgroundColor: airlineColor }]} />
              <View style={[styles.dashes, { borderColor: airlineColor + '60' }]} />
              <Text style={styles.planeIcon}>✈</Text>
              <View style={[styles.dashes, { borderColor: airlineColor + '60' }]} />
              <View style={[styles.dot, { backgroundColor: airlineColor }]} />
            </View>

            <View style={[styles.airport, styles.airportRight]}>
              <Text style={styles.iata}>{flight.arrivalAirport || '???'}</Text>
              <Text style={styles.time}>{formatTime(flight.arrivalTime)}</Text>
              {flight.arrivalGate ? (
                <Text style={styles.gate}>Gate {flight.arrivalGate}</Text>
              ) : null}
            </View>
          </View>

          {/* Bottom row */}
          <View style={styles.bottomRow}>
            <Text style={styles.date}>{formatDate(flight.departureTime)}</Text>
            <View style={styles.confRow}>
              <Text style={styles.confLabel}>Confirmation  </Text>
              <Text style={styles.conf}>{flight.confirmationNumber}</Text>
            </View>
          </View>

          {flight.checkedIn && (
            <View style={styles.checkedInBadge}>
              <Text style={styles.checkedInText}>✓ Checked In</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stripe: {
    height: 3,
    width: '100%',
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  airlineText: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  flightNum: {
    ...typography.footnote,
    color: colors.textTertiary,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  airport: {
    alignItems: 'flex-start',
    minWidth: 70,
  },
  airportRight: {
    alignItems: 'flex-end',
  },
  iata: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  time: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gate: {
    ...typography.caption1,
    color: colors.textTertiary,
    marginTop: 2,
  },
  routeMid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dashes: {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  planeIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
  confRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confLabel: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
  conf: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  checkedInBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  checkedInText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
});
