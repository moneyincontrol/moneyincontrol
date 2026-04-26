# 📱 PHASE 1: Foundation - Setup & Implementation Guide

## What You're Getting

This phase includes 3 complete, production-ready features:

1. **React Native Mobile App** 📱
2. **Advanced Features (Portfolio & Analytics)** 📊  
3. **Admin Dashboard** 👨‍💼

---

## 🔧 SETUP INSTRUCTIONS

### STEP 1: React Native Mobile App

#### 1.1 Create React Native Project
```bash
# Create new Expo project
npx create-expo-app money-in-control-mobile
cd money-in-control-mobile

# Or use Expo CLI
npx expo init money-in-control-mobile
```

#### 1.2 Install Dependencies
```bash
npm install

# Install navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# Install Firebase
npm install firebase

# Install icons
npm install @expo/vector-icons

# Install utilities
npm install date-fns
```

#### 1.3 Copy Files
```
Copy into your project:
- mobile-App.tsx → App.tsx
- mobile-firebase-config.ts → firebase-config.ts
- mobile-package.json → package.json (or merge dependencies)
```

#### 1.4 Update Firebase Config
In `firebase-config.ts`, add your environment variables:
```javascript
// Or use .env
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... rest of config
};
```

#### 1.5 Create .env File
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### 1.6 Run Mobile App
```bash
# Start development server
npm start

# Open in iOS Simulator (Mac only)
npm run ios

# Open in Android Emulator
npm run android

# Or scan QR code with Expo Go app
```

---

### STEP 2: Web App Advanced Features

#### 2.1 Add Components to Web App
In your web app (money-in-control):

```
Copy into src/components/:
- features-Portfolio.jsx → components/Portfolio.jsx
- features-Analytics.jsx → components/Analytics.jsx
- admin-AdminDashboard.jsx → components/AdminDashboard.jsx
```

#### 2.2 Add Recharts for Charts
```bash
npm install recharts
```

#### 2.3 Update App.jsx Navigation
```javascript
// Add to your web app main component
import Portfolio from './components/Portfolio';
import Analytics from './components/Analytics';
import AdminDashboard from './components/AdminDashboard';

// Add new tabs:
const tabs = [
  // ... existing tabs
  { id: 'portfolio', label: '💼 Portfolio' },
  { id: 'analytics', label: '📊 Analytics' },
  { id: 'admin', label: '👨‍💼 Admin' },
];
```

#### 2.4 Integrate into Main App
```javascript
{activeTab === 'portfolio' && <Portfolio />}
{activeTab === 'analytics' && <Analytics />}
{activeTab === 'admin' && <AdminDashboard />}
```

---

## 🗄️ Firestore Schema Updates

Add these collections to your Firestore for Phase 1:

### User Portfolio Collection
```
users/{uid}/portfolio/
├── {docId}
│   ├── symbol: "TCS"
│   ├── quantity: 10
│   ├── buyPrice: 3200
│   ├── currentPrice: 3350
│   ├── sector: "IT"
│   ├── purchaseDate: "2024-01-15"
│   └── createdAt: timestamp
```

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User-specific data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Admin data
    match /admin/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

---

## 📱 Mobile App Features

### Screens Included

1. **Login Screen**
   - Email/password authentication
   - Sign up capability
   - Firebase integration
   - Error handling

2. **Home Screen**
   - Real-time stock prices
   - Pull-to-refresh
   - Trending stocks
   - Market overview

3. **Watchlist Screen**
   - View saved stocks
   - Remove stocks
   - View price changes
   - Persistent storage in Firestore

4. **Alerts Screen**
   - Set price alerts (above/below)
   - View active alerts
   - Delete alerts
   - Real-time updates

5. **Profile Screen**
   - User information
   - Account settings
   - Logout functionality
   - App preferences

### Mobile Features
✅ Bottom tab navigation  
✅ Firebase authentication  
✅ Firestore real-time sync  
✅ Pull-to-refresh  
✅ Error handling  
✅ Loading states  
✅ Responsive design  

---

## 📊 Web App Advanced Features

### Portfolio Component Features

**Functionality:**
- Add new stock holdings
- Track buy price vs current price
- Calculate gains/losses
- Update current prices in real-time
- Remove holdings
- Portfolio summary metrics

**Data Stored:**
- Symbol, quantity, buy price, current price
- Sector classification
- Purchase date
- Investment amount & returns

### Analytics Component Features

**Visualizations:**
- Line chart of portfolio performance
- Bar chart of sector allocation
- Risk analysis metrics

**Metrics Calculated:**
- Sharpe Ratio (risk-adjusted returns)
- Sortino Ratio (downside risk)
- Max Drawdown (worst peak-to-trough)
- Win Rate (profitable months %)
- Best/worst performers

**Time Filters:**
- 1 Week, 1 Month, 3 Months, 6 Months, 1 Year

---

## 👨‍💼 Admin Dashboard Features

### Overview Tab
- Total users count
- Active users metrics
- Total stocks tracked
- Price alerts set
- System health status
- Recent activity log

### Users Tab
- Search users by email
- View user information
- View joined date
- Holdings count
- User status
- Delete users
- View user profile

### Analytics Tab
- User growth chart (30 days)
- Most tracked stocks
- Platform statistics
- Engagement metrics
- Performance analytics

### Settings Tab
- Email notification settings
- API configuration
- System preferences
- Feature toggles

---

## 🔐 Admin Access Control

### Setup Admin Users

In Firestore, create an admin document:
```javascript
// In Firebase Console, create:
admin/roles/{userId}
  └── admin: true
```

Or use Firebase CLI:
```bash
firebase auth:import users.json
```

### Custom Claims (Advanced)
```javascript
// Firebase Cloud Function to set admin
const admin = require('firebase-admin');

exports.setAdminUser = functions.https.onCall(async (data, context) => {
  await admin.auth().setCustomUserClaims(data.uid, { admin: true });
  return { message: 'Admin set successfully' };
});
```

---

## 🧪 Testing Phase 1

### Mobile App Testing
```bash
# Test on iOS simulator
npm run ios

# Test on Android emulator
npm run android

# Test login
- Email: test@example.com
- Password: password123

# Test features:
- Add stock to watchlist
- Set price alert
- Update portfolio
- Check persistence
```

### Web App Testing
```bash
# Start dev server
npm run dev

# Test Portfolio tab:
- Add new holdings
- Update current prices
- Calculate returns
- Delete holdings

# Test Analytics tab:
- View performance chart
- Check sector breakdown
- View risk metrics
- Change time periods

# Test Admin Dashboard:
- View user list
- Search users
- Check system health
- Update settings
```

---

## 📈 Metrics to Track

After Phase 1 launch:

- **Mobile App**
  - Download count
  - Daily active users
  - Crash rate
  - Average session time

- **Features**
  - Portfolio accuracy
  - Performance calculation speed
  - Chart rendering performance

- **Admin**
  - User engagement
  - System uptime
  - Error rates
  - API response times

---

## 🚀 Deployment

### Deploy Mobile App
```bash
# Build for production
eas build --platform ios
eas build --platform android

# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### Deploy Web App
```bash
# Build
npm run build

# Deploy to Vercel (auto-deploy on git push)
git push origin main
```

---

## ❓ Troubleshooting

### Issue: Mobile app crashes on startup
**Solution:** Check Firebase config keys are correct in .env

### Issue: Watchlist not saving
**Solution:** Ensure Firestore rules allow user write access

### Issue: Charts not displaying
**Solution:** Install recharts: `npm install recharts`

### Issue: Admin dashboard shows no users
**Solution:** Check Firestore security rules permissions

---

## 📝 Next Steps (Phase 2)

After Phase 1 is complete:
1. ✅ Test all features thoroughly
2. ✅ Get user feedback
3. ✅ Deploy to production
4. ✅ Then move to Phase 2: Monetization

Phase 2 includes:
- Payment integration (Razorpay)
- Subscription system
- Premium features
- Revenue tracking

---

## 📚 Documentation Links

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [Firebase Mobile](https://firebase.google.com/docs/auth/mobile)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Recharts](https://recharts.org)

---

## ✨ Success Checklist

- [ ] React Native app installed & running
- [ ] Mobile app connects to Firebase
- [ ] Can create account on mobile
- [ ] Can add/remove stocks from watchlist
- [ ] Portfolio component displays correctly
- [ ] Analytics charts render
- [ ] Admin dashboard loads
- [ ] All data persists in Firestore
- [ ] Mobile app tested on device
- [ ] Web features integrated

**You're ready for Phase 1!** 🎉
