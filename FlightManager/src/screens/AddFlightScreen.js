import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buildFlightRecord } from '../services/flightService';
import { saveFlight } from '../services/storageService';
import { scheduleAllReminders, requestPermissions } from '../services/notificationService';
import { AIRLINE_LIST } from '../utils/airlines';
import { colors, spacing, radius, typography } from '../utils/theme';

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function AddFlightScreen({ navigation }) {
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [flightNumber, setFlightNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [airlineSearch, setAirlineSearch] = useState('');

  const filteredAirlines = AIRLINE_LIST.filter((a) =>
    a.name.toLowerCase().includes(airlineSearch.toLowerCase()) ||
    a.iata.toLowerCase().includes(airlineSearch.toLowerCase())
  );

  async function handleAdd() {
    if (!confirmationNumber.trim()) {
      Alert.alert('Missing info', 'Please enter your confirmation number.');
      return;
    }
    if (!selectedAirline) {
      Alert.alert('Missing info', 'Please select an airline.');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Missing info', 'Please enter your last name.');
      return;
    }

    setLoading(true);
    try {
      const flight = await buildFlightRecord({
        confirmationNumber: confirmationNumber.trim(),
        airlineCode: selectedAirline.iata,
        flightNumber: flightNumber.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        departureAirport: departureAirport.trim(),
        arrivalAirport: arrivalAirport.trim(),
        departureDate: null,
      });

      await saveFlight(flight);

      const granted = await requestPermissions();
      if (granted) {
        await scheduleAllReminders(flight);
      }

      navigation.replace('FlightDetail', { flightId: flight.id });
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Add Flight</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.intro}>
            Enter your confirmation number and we'll look up your flight details.
          </Text>

          <View style={styles.card}>
            <Field label="Confirmation Number *">
              <TextInput
                style={styles.input}
                value={confirmationNumber}
                onChangeText={(t) => setConfirmationNumber(t.toUpperCase())}
                placeholder="e.g. ABC123"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
              />
            </Field>

            <Field label="Airline *">
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setPickerVisible(true)}
              >
                <Text
                  style={selectedAirline ? styles.pickerValue : styles.pickerPlaceholder}
                >
                  {selectedAirline ? selectedAirline.name : 'Select airline…'}
                </Text>
                <Text style={styles.pickerChevron}>›</Text>
              </TouchableOpacity>
            </Field>

            <Field label="Last Name *">
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Your last name"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
              />
            </Field>

            <Field label="First Name">
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Your first name"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
              />
            </Field>
          </View>

          <Text style={styles.sectionTitle}>Flight Details (optional)</Text>
          <Text style={styles.sectionSub}>
            If you have your flight number we can pull live status. Otherwise enter manually.
          </Text>

          <View style={styles.card}>
            <Field label="Flight Number">
              <TextInput
                style={styles.input}
                value={flightNumber}
                onChangeText={(t) => setFlightNumber(t.toUpperCase())}
                placeholder="e.g. AA1234"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={8}
              />
            </Field>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="From (Airport Code)">
                  <TextInput
                    style={styles.input}
                    value={departureAirport}
                    onChangeText={(t) => setDepartureAirport(t.toUpperCase())}
                    placeholder="LAX"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={3}
                  />
                </Field>
              </View>
              <Text style={styles.arrow}>→</Text>
              <View style={{ flex: 1 }}>
                <Field label="To (Airport Code)">
                  <TextInput
                    style={styles.input}
                    value={arrivalAirport}
                    onChangeText={(t) => setArrivalAirport(t.toUpperCase())}
                    placeholder="JFK"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={3}
                  />
                </Field>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.addButtonText}>Look Up & Add Flight</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Airline picker modal */}
      <Modal visible={pickerVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Airline</Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.modalSearch}
            value={airlineSearch}
            onChangeText={setAirlineSearch}
            placeholder="Search airlines…"
            placeholderTextColor={colors.textTertiary}
          />
          <FlatList
            data={filteredAirlines}
            keyExtractor={(a) => a.iata}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.airlineRow,
                  selectedAirline?.iata === item.iata && styles.airlineRowSelected,
                ]}
                onPress={() => {
                  setSelectedAirline(item);
                  setPickerVisible(false);
                  setAirlineSearch('');
                }}
              >
                <View
                  style={[styles.airlineDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.airlineName}>{item.name}</Text>
                <Text style={styles.airlineIata}>{item.iata}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
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
  backBtn: {
    width: 60,
  },
  backText: {
    color: colors.primary,
    fontSize: 17,
  },
  navTitle: {
    ...typography.headline,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  intro: {
    ...typography.subhead,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.caption1,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.textTertiary,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  picker: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValue: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: colors.textTertiary,
    fontSize: 16,
  },
  pickerChevron: {
    color: colors.textTertiary,
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  arrow: {
    color: colors.textTertiary,
    fontSize: 18,
    paddingTop: 24,
  },
  sectionTitle: {
    ...typography.headline,
    marginTop: spacing.sm,
  },
  sectionSub: {
    ...typography.subhead,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.headline,
  },
  modalClose: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  modalSearch: {
    margin: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  airlineRowSelected: {
    backgroundColor: colors.primaryDim,
  },
  airlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  airlineName: {
    flex: 1,
    ...typography.body,
  },
  airlineIata: {
    ...typography.subhead,
    color: colors.textTertiary,
    fontWeight: '600',
  },
});
