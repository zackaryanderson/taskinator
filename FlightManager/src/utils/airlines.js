export const AIRLINES = {
  AA: {
    name: 'American Airlines',
    iata: 'AA',
    color: '#EF3340',
    checkInUrl: 'https://www.aa.com/reservation/view/find-your-reservation',
    checkInDeepLink: 'https://www.aa.com/reservation/view/find-your-reservation?confirmationNumber={conf}&lastName={lastName}',
    mobileApp: 'american-airlines://',
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 30,
  },
  DL: {
    name: 'Delta Air Lines',
    iata: 'DL',
    color: '#E01933',
    checkInUrl: 'https://www.delta.com/us/en/check-in/overview',
    checkInDeepLink: 'https://www.delta.com/us/en/check-in/overview?confirmationNumber={conf}&lastName={lastName}',
    mobileApp: 'fly-delta://',
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 30,
  },
  UA: {
    name: 'United Airlines',
    iata: 'UA',
    color: '#005DAA',
    checkInUrl: 'https://www.united.com/en/us/checkin',
    checkInDeepLink: 'https://www.united.com/en/us/checkin?Record={conf}&lastName={lastName}',
    mobileApp: 'united://',
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 35,
  },
  SW: {
    name: 'Southwest Airlines',
    iata: 'WN',
    iataAlt: 'SW',
    color: '#304CB2',
    checkInUrl: 'https://www.southwest.com/air/check-in/',
    checkInDeepLink: 'https://www.southwest.com/air/check-in/?confirmationNumber={conf}&firstName={firstName}&lastName={lastName}',
    mobileApp: 'southwest://',
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 30,
    note: 'Southwest uses open seating — check in exactly at T-24h for best boarding position.',
  },
  WN: {
    name: 'Southwest Airlines',
    iata: 'WN',
    color: '#304CB2',
    checkInUrl: 'https://www.southwest.com/air/check-in/',
    checkInDeepLink: 'https://www.southwest.com/air/check-in/?confirmationNumber={conf}&firstName={firstName}&lastName={lastName}',
    mobileApp: 'southwest://',
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 30,
    note: 'Southwest uses open seating — check in exactly at T-24h for best boarding position.',
  },
  B6: {
    name: 'JetBlue Airways',
    iata: 'B6',
    color: '#003876',
    checkInUrl: 'https://www.jetblue.com/manage-trips/check-in',
    checkInDeepLink: 'https://www.jetblue.com/manage-trips/check-in?confirmationCode={conf}&lastName={lastName}',
    mobileApp: 'jetblue://',
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 25,
  },
  AS: {
    name: 'Alaska Airlines',
    iata: 'AS',
    color: '#01426A',
    checkInUrl: 'https://www.alaskaair.com/check-in',
    checkInDeepLink: 'https://www.alaskaair.com/check-in?confCode={conf}&lastName={lastName}',
    mobileApp: 'alaskaair://',
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 30,
  },
  F9: {
    name: 'Frontier Airlines',
    iata: 'F9',
    color: '#11AC35',
    checkInUrl: 'https://www.flyfrontier.com/travel/my-trips/check-in/',
    checkInDeepLink: 'https://www.flyfrontier.com/travel/my-trips/check-in/?confirmationCode={conf}&lastName={lastName}',
    mobileApp: null,
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 30,
  },
  NK: {
    name: 'Spirit Airlines',
    iata: 'NK',
    color: '#FFD600',
    checkInUrl: 'https://www.spirit.com/check-in',
    checkInDeepLink: 'https://www.spirit.com/check-in?confirmationCode={conf}&lastName={lastName}',
    mobileApp: null,
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 30,
  },
  HA: {
    name: 'Hawaiian Airlines',
    iata: 'HA',
    color: '#4B2163',
    checkInUrl: 'https://www.hawaiianairlines.com/check-in',
    checkInDeepLink: 'https://www.hawaiianairlines.com/check-in?confirmationCode={conf}&lastName={lastName}',
    mobileApp: null,
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 30,
  },
  SY: {
    name: 'Sun Country Airlines',
    iata: 'SY',
    color: '#0033A0',
    checkInUrl: 'https://www.suncountry.com/check-in',
    checkInDeepLink: 'https://www.suncountry.com/check-in',
    mobileApp: null,
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 30,
  },
  AC: {
    name: 'Air Canada',
    iata: 'AC',
    color: '#D22730',
    checkInUrl: 'https://www.aircanada.com/ca/en/aco/home/check-in.html',
    checkInDeepLink: 'https://www.aircanada.com/ca/en/aco/home/check-in.html',
    mobileApp: null,
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 30,
  },
  LH: {
    name: 'Lufthansa',
    iata: 'LH',
    color: '#05164D',
    checkInUrl: 'https://www.lufthansa.com/us/en/online-check-in',
    checkInDeepLink: 'https://www.lufthansa.com/us/en/online-check-in',
    mobileApp: null,
    logo: '✈️',
    checkInWindowHours: 23,
    boardingMinutesBefore: 40,
  },
  BA: {
    name: 'British Airways',
    iata: 'BA',
    color: '#2B5BBF',
    checkInUrl: 'https://www.britishairways.com/travel/olcilandingpageauthreq/public/en_gb',
    checkInDeepLink: 'https://www.britishairways.com/travel/olcilandingpageauthreq/public/en_gb',
    mobileApp: null,
    logo: '✈️',
    checkInWindowHours: 24,
    boardingMinutesBefore: 35,
  },
};

export const AIRLINE_LIST = Object.values(AIRLINES).filter(
  (a, i, arr) => arr.findIndex((b) => b.name === a.name) === i
);

export function getAirline(iata) {
  if (!iata) return null;
  return AIRLINES[iata.toUpperCase()] || null;
}

export function buildCheckInUrl(airline, confirmationNumber, firstName, lastName) {
  if (!airline) return null;
  return airline.checkInDeepLink
    .replace('{conf}', encodeURIComponent(confirmationNumber || ''))
    .replace('{firstName}', encodeURIComponent(firstName || ''))
    .replace('{lastName}', encodeURIComponent(lastName || ''));
}

export function isCheckInOpen(flight) {
  if (!flight.departureTime) return false;
  const airline = getAirline(flight.airlineCode);
  const windowHours = airline?.checkInWindowHours || 24;
  const dep = new Date(flight.departureTime);
  const now = new Date();
  const hoursUntilDep = (dep - now) / (1000 * 60 * 60);
  return hoursUntilDep <= windowHours && hoursUntilDep > 0;
}

export function isBoardingOpen(flight) {
  if (!flight.departureTime) return false;
  const airline = getAirline(flight.airlineCode);
  const minutesBefore = airline?.boardingMinutesBefore || 30;
  const dep = new Date(flight.departureTime);
  const now = new Date();
  const minutesUntilDep = (dep - now) / (1000 * 60);
  return minutesUntilDep <= minutesBefore && minutesUntilDep > 0;
}

export function getFlightStatus(flight) {
  if (!flight.departureTime) return { label: 'Unknown', color: '#8E9BB5' };
  const dep = new Date(flight.departureTime);
  const arr = flight.arrivalTime ? new Date(flight.arrivalTime) : null;
  const now = new Date();

  if (flight.status === 'cancelled') return { label: 'Cancelled', color: '#FF453A' };
  if (flight.status === 'diverted') return { label: 'Diverted', color: '#FF9F0A' };
  if (arr && now > arr) return { label: 'Arrived', color: '#30D158' };
  if (now > dep) return { label: 'En Route', color: '#0A84FF' };
  if (isBoardingOpen(flight)) return { label: 'Boarding', color: '#30D158' };
  if (isCheckInOpen(flight)) return { label: 'Check-in Open', color: '#FFD60A' };
  if (flight.status === 'delayed') return { label: 'Delayed', color: '#FF9F0A' };
  return { label: 'On Time', color: '#30D158' };
}
