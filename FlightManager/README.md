# FlightManager — iPhone App

A React Native (Expo) app to manage all your flights in one place.

## Features

- **Add flights by confirmation number** — enter your conf #, airline, and last name
- **Live flight data** — pulls gate, terminal, and status via AviationStack API
- **Boarding pass** — QR code boarding pass display for all flights
- **Check-in** — opens the airline's check-in page pre-filled with your info; tracks check-in status
- **Push notifications** — reminds you when check-in opens (T-24h) and when boarding starts (T-45min)
- **Real-time refresh** — pull down on any screen to refresh flight status
- **14 airlines supported** — AA, DL, UA, WN/SW, B6, AS, F9, NK, HA, SY, AC, LH, BA, and more

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your iPhone (from the App Store)

### Install & Run

```bash
cd FlightManager
npm install
npx expo start
```

Scan the QR code with your iPhone's camera (or Expo Go app) to open on device.

### API Key (optional but recommended)

For live flight data, get a free key at [aviationstack.com](https://aviationstack.com) and add it to `app.json`:

```json
{
  "expo": {
    "extra": {
      "aviationstackApiKey": "YOUR_KEY_HERE"
    }
  }
}
```

Or set `AVIATION_API_KEY=your_key` in a `.env` file.

Without a key the app still works — you can manually enter flight details and the boarding pass, check-in, and notification features all function normally.

## Supported Airlines

| Code | Airline |
|------|---------|
| AA | American Airlines |
| DL | Delta Air Lines |
| UA | United Airlines |
| WN | Southwest Airlines |
| B6 | JetBlue Airways |
| AS | Alaska Airlines |
| F9 | Frontier Airlines |
| NK | Spirit Airlines |
| HA | Hawaiian Airlines |
| AC | Air Canada |
| LH | Lufthansa |
| BA | British Airways |
| SY | Sun Country Airlines |

## Building for the App Store

```bash
npm install -g eas-cli
eas build --platform ios
```

Requires an Apple Developer account ($99/year).

## Project Structure

```
FlightManager/
├── App.js                        # Navigation root
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js         # Flight list
│   │   ├── AddFlightScreen.js    # Add flight by conf #
│   │   ├── FlightDetailScreen.js # Flight info + boarding pass
│   │   └── CheckInScreen.js      # Check-in + boarding pass display
│   ├── components/
│   │   ├── FlightCard.js         # Card used in the list
│   │   ├── BoardingPassCard.js   # Full boarding pass with QR
│   │   └── StatusBadge.js        # Status pill (On Time, Boarding, etc.)
│   ├── services/
│   │   ├── flightService.js      # AviationStack API + flight record builder
│   │   ├── storageService.js     # AsyncStorage persistence
│   │   └── notificationService.js # Expo push notifications
│   └── utils/
│       ├── airlines.js           # Airline data, check-in URLs, status logic
│       └── theme.js              # Design tokens (colors, spacing, typography)
```
