import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('flights', {
      name: 'Flight Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0A84FF',
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleCheckInReminder(flight) {
  if (!flight.departureTime) return;
  const dep = new Date(flight.departureTime);
  // Remind 24h before departure (check-in opens)
  const checkInTime = new Date(dep.getTime() - 24 * 60 * 60 * 1000);
  if (checkInTime <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `checkin_${flight.id}`,
    content: {
      title: '✈️ Check-in is now open',
      body: `${flight.airlineName} ${flight.flightNumber} — ${flight.departureAirport} → ${flight.arrivalAirport}. Tap to check in.`,
      data: { flightId: flight.id, action: 'checkin' },
      sound: true,
    },
    trigger: { date: checkInTime },
  });
}

export async function scheduleBoardingReminder(flight) {
  if (!flight.departureTime) return;
  const dep = new Date(flight.departureTime);
  // Remind 45 minutes before departure
  const boardingTime = new Date(dep.getTime() - 45 * 60 * 1000);
  if (boardingTime <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `boarding_${flight.id}`,
    content: {
      title: '🚪 Boarding soon',
      body: `${flight.airlineName} ${flight.flightNumber} boards in ~45 min. Gate ${flight.departureGate || 'TBD'}.`,
      data: { flightId: flight.id, action: 'boarding' },
      sound: true,
    },
    trigger: { date: boardingTime },
  });
}

export async function cancelFlightNotifications(flightId) {
  await Notifications.cancelScheduledNotificationAsync(`checkin_${flightId}`);
  await Notifications.cancelScheduledNotificationAsync(`boarding_${flightId}`);
}

export async function scheduleAllReminders(flight) {
  await Promise.all([
    scheduleCheckInReminder(flight),
    scheduleBoardingReminder(flight),
  ]);
}
