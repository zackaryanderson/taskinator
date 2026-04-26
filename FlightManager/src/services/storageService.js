import AsyncStorage from '@react-native-async-storage/async-storage';

const FLIGHTS_KEY = '@flightmanager_flights';

export async function getFlights() {
  try {
    const data = await AsyncStorage.getItem(FLIGHTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveFlight(flight) {
  const flights = await getFlights();
  const idx = flights.findIndex((f) => f.id === flight.id);
  if (idx >= 0) {
    flights[idx] = flight;
  } else {
    flights.unshift(flight);
  }
  await AsyncStorage.setItem(FLIGHTS_KEY, JSON.stringify(flights));
  return flights;
}

export async function deleteFlight(id) {
  const flights = await getFlights();
  const updated = flights.filter((f) => f.id !== id);
  await AsyncStorage.setItem(FLIGHTS_KEY, JSON.stringify(updated));
  return updated;
}

export async function updateFlightCheckedIn(id, checkedIn) {
  const flights = await getFlights();
  const updated = flights.map((f) => (f.id === id ? { ...f, checkedIn } : f));
  await AsyncStorage.setItem(FLIGHTS_KEY, JSON.stringify(updated));
  return updated;
}
