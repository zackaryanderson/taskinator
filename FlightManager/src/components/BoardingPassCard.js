import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, radius, typography } from '../utils/theme';
import { getAirline } from '../utils/airlines';
import { format, parseISO, isValid } from 'date-fns';

function fmt(iso, pattern) {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? parseISO(iso) : new Date(iso);
    return isValid(d) ? format(d, pattern) : '—';
  } catch {
    return '—';
  }
}

function InfoCell({ label, value, large, style }) {
  return (
    <View style={[styles.cell, style]}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={[styles.cellValue, large && styles.cellValueLarge]}>{value || '—'}</Text>
    </View>
  );
}

export default function BoardingPassCard({ flight }) {
  const airline = getAirline(flight.airlineCode);
  const airlineColor = airline?.color || colors.primary;

  const passengerName = [flight.firstName, flight.lastName].filter(Boolean).join(' ').toUpperCase() || 'PASSENGER';
  const qrData = JSON.stringify({
    conf: flight.confirmationNumber,
    flight: flight.flightNumber,
    name: passengerName,
    dep: flight.departureAirport,
    arr: flight.arrivalAirport,
  });

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[airlineColor + 'CC', airlineColor + '44']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerAirline}>{airline?.name || flight.airlineName || flight.airlineCode}</Text>
        <Text style={styles.headerFlight}>{flight.flightNumber || ''}</Text>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.routeRow}>
          <View style={styles.routeAirport}>
            <Text style={styles.routeIata}>{flight.departureAirport || '???'}</Text>
            <Text style={styles.routeTime}>{fmt(flight.departureTime, 'h:mm a')}</Text>
            <Text style={styles.routeDate}>{fmt(flight.departureTime, 'EEE, MMM d')}</Text>
          </View>
          <View style={styles.routeMid}>
            <Text style={styles.planeIcon}>✈</Text>
          </View>
          <View style={[styles.routeAirport, { alignItems: 'flex-end' }]}>
            <Text style={styles.routeIata}>{flight.arrivalAirport || '???'}</Text>
            <Text style={styles.routeTime}>{fmt(flight.arrivalTime, 'h:mm a')}</Text>
            <Text style={styles.routeDate}>{fmt(flight.arrivalTime, 'EEE, MMM d')}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailGrid}>
          <InfoCell label="PASSENGER" value={passengerName} style={{ flex: 2 }} />
          <InfoCell label="CONFIRMATION" value={flight.confirmationNumber} />
        </View>

        <View style={styles.detailGrid}>
          <InfoCell label="TERMINAL" value={flight.departureTerminal} />
          <InfoCell label="GATE" value={flight.departureGate} large />
          <InfoCell label="SEAT" value={flight.seat || 'TBD'} large />
          <InfoCell label="CLASS" value={flight.cabinClass || 'ECONOMY'} />
        </View>

        {/* Perforation line */}
        <View style={styles.perforationRow}>
          <View style={[styles.perfCircle, { left: -16 }]} />
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={styles.perfDash} />
          ))}
          <View style={[styles.perfCircle, { right: -16 }]} />
        </View>

        {/* Stub */}
        <View style={styles.stub}>
          <View style={styles.stubLeft}>
            <Text style={styles.stubRoute}>
              {flight.departureAirport} → {flight.arrivalAirport}
            </Text>
            <Text style={styles.stubConf}>{flight.confirmationNumber}</Text>
            {flight.checkedIn && (
              <View style={styles.checkedBadge}>
                <Text style={styles.checkedText}>✓ CHECKED IN</Text>
              </View>
            )}
          </View>
          <View style={styles.qrContainer}>
            <QRCode
              value={qrData}
              size={80}
              color="#FFFFFF"
              backgroundColor="transparent"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerAirline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerFlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  body: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  routeAirport: {
    flex: 1,
  },
  routeIata: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  routeTime: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  routeDate: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
  routeMid: {
    paddingHorizontal: spacing.md,
  },
  planeIcon: {
    fontSize: 22,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cell: {
    flex: 1,
  },
  cellLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cellValueLarge: {
    fontSize: 20,
    fontWeight: '700',
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
    position: 'relative',
  },
  perfCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    top: -10,
  },
  perfDash: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  stub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stubLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  stubRoute: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  stubConf: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  checkedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  checkedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
    letterSpacing: 0.5,
  },
  qrContainer: {
    padding: spacing.sm,
    backgroundColor: '#1C2640',
    borderRadius: radius.sm,
  },
});
