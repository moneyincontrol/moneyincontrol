# Money In Control Mobile App

React Native mobile app for iOS and Android.

## Setup

```bash
cd mobile
npm install
```

## Run

### iOS Simulator (Mac only)
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Or use Expo Go
```bash
npm start
```

Then scan QR code with Expo Go app on your phone.

## Environment Setup

Create `.env` in mobile folder:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
# ... rest of Firebase config
```

## Build for App Stores

```bash
# Install EAS CLI
npm install -g eas-cli

# Build
eas build --platform ios
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Features

- ✅ Stock watchlist
- ✅ Price alerts
- ✅ Portfolio tracking
- ✅ Push notifications
- ✅ Offline support
