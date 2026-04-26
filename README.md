# Money In Control - Free Stock Market Platform

Complete stock market platform with portfolio tracking, AI predictions, and community features.

**Status:** Production Ready | **Cost:** Free Forever | **Users:** Unlimited

## ✨ Features

- 📱 Mobile app (iOS/Android)
- 💻 Web app (React)
- 💼 Portfolio tracking
- 📊 Advanced analytics
- 🤖 AI predictions
- 📢 Price alerts (unlimited)
- 🏆 Contests & leaderboards
- 👥 Community features
- 🎁 Referral rewards
- 🔒 Enterprise security

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/YOUR_USERNAME/money-in-control.git
cd money-in-control
npm install
```

### 2. Firebase Setup
- Go to https://console.firebase.google.com
- Create new project: "money-in-control"
- Enable Authentication (Email/Password)
- Create Firestore database
- Copy config to `.env`

### 3. Run Locally
```bash
npm run dev
```

Visit: http://localhost:5173

## 📁 Project Structure

```
money-in-control/
├── src/
│   ├── App.jsx              # Main app (EDIT HERE)
│   ├── firebase.js          # Database config (EDIT - Add keys)
│   ├── main.jsx             # React entry
│   ├── index.css            # Styles
│   └── components/
│       ├── Portfolio.jsx     # Portfolio tracking
│       ├── Analytics.jsx     # Analytics dashboard
│       └── AdminDashboard.jsx # Admin panel
├── mobile/                  # React Native app
├── public/                  # Static assets
├── .github/workflows/       # CI/CD
├── .env.example             # Config template (COPY & EDIT)
├── package.json             # Dependencies
└── README.md                # This file
```

## 📝 Files to Edit

### 1. `.env` (Most Important!)
```bash
cp .env.example .env
# Edit with your Firebase credentials
```

**Get credentials from:** Firebase Console > Project Settings > General

### 2. `src/firebase.js`
- Add Firebase API keys
- Update Firestore collections if needed
- Modify helper functions if needed

### 3. `src/App.jsx`
- Customize stock list
- Add your branding
- Modify default features

## 🔑 Environment Variables

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🚀 Deployment

### Deploy Web App to Vercel

1. Push to GitHub
2. Go to https://vercel.com
3. Import repository
4. Add environment variables
5. Deploy (automatic on git push)

### Deploy Mobile App

```bash
# Install Expo CLI
npm install -g expo-cli

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 📚 Documentation

- `START_HERE_FREE.md` - Platform overview
- `QUICK_START_FREE.md` - 3-week launch plan
- `LAUNCH_GUIDE.md` - Detailed deployment
- `PHASE_1_SETUP.md` - Mobile setup
- `FREE_STRATEGY_ROADMAP.md` - Growth strategy

## 🛠️ Tech Stack

- React 18 + Vite
- React Native + Expo
- Firebase (Auth + Firestore)
- Tailwind CSS
- TensorFlow.js

## 💡 Key Features to Customize

### 1. Stock List
Edit `src/App.jsx` - Stocks array:
```javascript
const stocks = [
  { symbol: 'TCS', price: 3280, sector: 'IT' },
  // Add more stocks
];
```

### 2. Branding
Edit colors in:
- `src/index.css`
- `tailwind.config.js`
- Component JSX files

### 3. Default Alerts
Edit in `src/App.jsx`:
```javascript
const defaultAlerts = [
  { symbol: 'TCS', type: 'above', price: 3500 },
];
```

## 🔐 Security

- Firestore rules deployed
- API keys in .env
- Never commit .env
- Use environment variables in production

## 📊 Database Schema

### Users Collection
```
users/{uid}/
├── email: string
├── createdAt: timestamp
└── subscription: object
```

### Watchlist Subcollection
```
users/{uid}/watchlist/{stockId}/
├── symbol: string
├── price: number
├── changePercent: number
└── sector: string
```

### Alerts Subcollection
```
users/{uid}/alerts/{alertId}/
├── symbol: string
├── price: number
├── type: string (above/below)
└── createdAt: timestamp
```

## 🚦 Development Workflow

1. Create feature branch
2. Make changes
3. Test locally
4. Commit with clear messages
5. Push to GitHub
6. Auto-deploys to Vercel

## 📞 Support

Check documentation files for:
- Setup issues
- Deployment help
- Feature customization
- Growth strategies

## 📈 Growth Roadmap

- Week 1-2: Deploy & test
- Week 3: ProductHunt launch
- Month 1: 10,000 users
- Month 6: 100,000+ users

See `FREE_STRATEGY_ROADMAP.md` for details.

## 📄 License

MIT

---

**Built with ❤️ using React, Firebase & Tailwind CSS**

**Made for Indian stock market enthusiasts**
