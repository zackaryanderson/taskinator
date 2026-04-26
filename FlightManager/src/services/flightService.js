import { getAirline } from '../utils/airlines';

// AviationStack free-tier endpoint (100 req/month).
// Users should add their key to app.json extra.aviationstackApiKey
// or set AVIATION_API_KEY in a .env file.
const AVIATION_KEY = process.env.AVIATION_API_KEY || '';
const BASE_URL = 'https://api.aviationstack.com/v1';

export async function lookupFlightByNumber(flightNumber, date) {
  if (!AVIATION_KEY) return null;
  try {
    const dateStr = date || new Date().toISOString().split('T')[0];
    const url = `${BASE_URL}/flights?access_key=${AVIATION_KEY}&flight_iata=${flightNumber}&flight_date=${dateStr}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data?.[0];
    if (!data) return null;
    return mapAviationStackFlight(data);
  } catch {
    return null;
  }
}

export async function lookupFlightsByAirport(iata, type = 'departure') {
  if (!AVIATION_KEY) return [];
  try {
    const key = type === 'departure' ? 'dep_iata' : 'arr_iata';
    const url = `${BASE_URL}/flights?access_key=${AVIATION_KEY}&${key}=${iata}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data || []).map(mapAviationStackFlight);
  } catch {
    return [];
  }
}

function mapAviationStackFlight(data) {
  return {
    flightNumber: data.flight?.iata || '',
    airlineCode: data.airline?.iata || '',
    airlineName: data.airline?.name || '',
    departureAirport: data.departure?.iata || '',
    departureCity: data.departure?.airport || '',
    departureTime: data.departure?.scheduled || null,
    departureTerminal: data.departure?.terminal || null,
    departureGate: data.departure?.gate || null,
    arrivalAirport: data.arrival?.iata || '',
    arrivalCity: data.arrival?.airport || '',
    arrivalTime: data.arrival?.scheduled || null,
    arrivalTerminal: data.arrival?.terminal || null,
    arrivalGate: data.arrival?.gate || null,
    status: data.flight_status || 'scheduled',
    aircraft: data.aircraft?.iata || null,
  };
}

// Builds a flight record from user-supplied confirmation data.
// Attempts API lookup; falls back to manual fields.
export async function buildFlightRecord({
  confirmationNumber,
  airlineCode,
  flightNumber,
  firstName,
  lastName,
  departureDate,
  departureAirport,
  arrivalAirport,
}) {
  const id = `${confirmationNumber}_${airlineCode}_${Date.now()}`;
  const airline = getAirline(airlineCode);

  // Try to pull live data
  let liveData = null;
  if (flightNumber && departureDate) {
    liveData = await lookupFlightByNumber(flightNumber, departureDate);
  }

  return {
    id,
    confirmationNumber: confirmationNumber.toUpperCase(),
    airlineCode: airlineCode.toUpperCase(),
    airlineName: airline?.name || liveData?.airlineName || airlineCode,
    flightNumber: flightNumber?.toUpperCase() || liveData?.flightNumber || '',
    firstName,
    lastName,
    departureAirport: liveData?.departureAirport || departureAirport?.toUpperCase() || '',
    departureCity: liveData?.departureCity || '',
    departureTime: liveData?.departureTime || null,
    departureTerminal: liveData?.departureTerminal || null,
    departureGate: liveData?.departureGate || null,
    arrivalAirport: liveData?.arrivalAirport || arrivalAirport?.toUpperCase() || '',
    arrivalCity: liveData?.arrivalCity || '',
    arrivalTime: liveData?.arrivalTime || null,
    arrivalTerminal: liveData?.arrivalTerminal || null,
    arrivalGate: liveData?.arrivalGate || null,
    status: liveData?.status || 'scheduled',
    aircraft: liveData?.aircraft || null,
    checkedIn: false,
    boardingPass: null,
    addedAt: new Date().toISOString(),
    lastRefreshed: liveData ? new Date().toISOString() : null,
  };
}

export async function refreshFlight(flight) {
  if (!flight.flightNumber) return flight;
  const date = flight.departureTime
    ? new Date(flight.departureTime).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  const liveData = await lookupFlightByNumber(flight.flightNumber, date);
  if (!liveData) return flight;
  return {
    ...flight,
    departureTime: liveData.departureTime || flight.departureTime,
    departureTerminal: liveData.departureTerminal || flight.departureTerminal,
    departureGate: liveData.departureGate || flight.departureGate,
    arrivalTime: liveData.arrivalTime || flight.arrivalTime,
    arrivalTerminal: liveData.arrivalTerminal || flight.arrivalTerminal,
    arrivalGate: liveData.arrivalGate || flight.arrivalGate,
    status: liveData.status || flight.status,
    aircraft: liveData.aircraft || flight.aircraft,
    lastRefreshed: new Date().toISOString(),
  };
}
