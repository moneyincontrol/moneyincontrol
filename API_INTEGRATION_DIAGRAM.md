# 🔌 API INTEGRATION VISUAL GUIDE

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER (Browser / Mobile)                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   React App        │
                    │  (src/App.jsx)     │
                    │  Components        │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
    ┌────▼─────┐          ┌───▼──────┐      ┌──────▼────┐
    │firebase.js│          │stocks.js │      │  .env     │
    │(helpers) │          │(API funcs)│      │(API Keys) │
    └────┬─────┘          └───┬──────┘      └──────┬────┘
         │                     │                     │
    ┌────▼─────────────────────▼─────────────────────▼────┐
    │                                                      │
    │    External APIs (via HTTPS)                        │
    │                                                      │
    └────┬──────────────────┬──────────────────┬────────┬─┘
         │                  │                  │        │
    ┌────▼─────┐  ┌────────▼────────┐  ┌────▼────┐ ┌──▼─────┐
    │ Firebase  │  │   Finnhub       │  │ NewsAPI │ │Twilio/ │
    │           │  │  (Stock Prices) │  │(News)   │ │SendGrid│
    │ Auth      │  │                 │  │         │ │        │
    │ Firestore │  │ Real-time data  │  │ Articles│ │Alerts  │
    │ Storage   │  │ Quotes          │  │ Updates │ │        │
    └───────────┘  │ Company info    │  │         │ │        │
                   └─────────────────┘  └─────────┘ └────────┘
```

---

## File Location Map

```
money-in-control/
│
├── .env                          ← 🔑 ADD ALL API KEYS HERE
│   ├─ VITE_FIREBASE_*
│   ├─ VITE_FINNHUB_API_KEY
│   ├─ VITE_NEWSAPI_KEY
│   ├─ VITE_TWILIO_*
│   └─ VITE_SENDGRID_API_KEY
│
├── .env.example                  ← 📋 TEMPLATE (Copy to .env)
│
├── src/
│   ├── firebase.js               ← 📞 CALL APIs HERE
│   │   ├─ getStockData()
│   │   ├─ getMarketNews()
│   │   ├─ getCompanyProfile()
│   │   └─ sendSMSAlert()
│   │
│   ├── App.jsx                   ← 📱 USE APIs IN COMPONENTS
│   │   └─ useEffect(() => {
│   │        getStockData('TCS')
│   │      })
│   │
│   └── components/
│       ├── Portfolio.jsx         ← 💼 CALL APIs FOR DATA
│       ├── Analytics.jsx         ← 📊 DISPLAY API DATA
│       └── AdminDashboard.jsx    ← 👨‍💼 MANAGE DATA
│
├── lib/
│   └── stocks.js                 ← 📦 OPTIONAL (Helper functions)
│       ├─ getRealStockData()
│       └─ getMultipleStocks()
│
└── .github/
    └── workflows/
        └── deploy.yml            ← ⚙️ USE GitHub Secrets
            ├─ ${{ secrets.VITE_FINNHUB_API_KEY }}
            └─ ${{ secrets.VITE_NEWSAPI_KEY }}
```

---

## Data Flow Diagram

```
Step 1: Setup
┌──────────────────────────────────┐
│ Get API Keys from:               │
│ • Finnhub (stocks)               │
│ • NewsAPI (news)                 │
│ • Twilio (SMS)                   │
│ • SendGrid (email)               │
└──────────────┬───────────────────┘
               │
Step 2: Add to .env
┌──────────────▼───────────────────┐
│ .env file                        │
│ VITE_FINNHUB_API_KEY=xxx         │
│ VITE_NEWSAPI_KEY=yyy             │
│ VITE_TWILIO_ACCOUNT_SID=zzz      │
└──────────────┬───────────────────┘
               │
Step 3: Create Functions
┌──────────────▼───────────────────┐
│ src/firebase.js or src/lib/      │
│ export getStockData() {}         │
│ export getMarketNews() {}        │
│ export sendSMSAlert() {}         │
└──────────────┬───────────────────┘
               │
Step 4: Use in Components
┌──────────────▼───────────────────┐
│ src/App.jsx or components/       │
│ useEffect(() => {                │
│   getStockData('TCS')            │
│   getMarketNews()                │
│ })                               │
└──────────────┬───────────────────┘
               │
Step 5: Deploy
┌──────────────▼───────────────────┐
│ GitHub Secrets                   │
│ + GitHub Actions Workflow        │
│ + Vercel Deployment              │
└──────────────────────────────────┘
```

---

## API Integration Timeline

```
MINUTE 1-5: Setup .env
┌─ Copy .env.example to .env
├─ Get API keys from services
├─ Add keys to .env
└─ Verify format

MINUTE 5-15: Add Functions
┌─ Open src/firebase.js
├─ Copy helper functions
├─ Save file
└─ Verify syntax

MINUTE 15-25: Use in Components
┌─ Open src/App.jsx
├─ Import functions
├─ Call in useEffect
├─ Display results
└─ Test locally

MINUTE 25-30: Deploy
┌─ Add keys to GitHub Secrets
├─ Push to GitHub
├─ Vercel auto-builds
└─ Live with real APIs!
```

---

## Complete Integration Example

### Step-by-Step Complete Code

```
STEP 1: Create/Edit .env
────────────────────────────────────────────
File: money-in-control/.env

VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_PROJECT_ID=money-in-control
VITE_FINNHUB_API_KEY=c123xyz
VITE_NEWSAPI_KEY=abc123def
VITE_TWILIO_ACCOUNT_SID=AC123...
VITE_TWILIO_AUTH_TOKEN=auth123...
VITE_SENDGRID_API_KEY=SG.123...


STEP 2: Create src/lib/stocks.js
────────────────────────────────────────────
File: money-in-control/src/lib/stocks.js

// Get real stock prices
export const getStockPrice = async (symbol) => {
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.VITE_FINNHUB_API_KEY}`;
  const res = await fetch(url);
  return res.json();
};

// Get financial news
export const getNews = async () => {
  const url = `https://newsapi.org/v2/everything?q=Indian%20stocks&sortBy=publishedAt&apiKey=${process.env.VITE_NEWSAPI_KEY}`;
  const res = await fetch(url);
  return res.json();
};

// Send SMS alert
export async function sendSMS(phone, message) {
  const response = await fetch('/api/send-sms', {
    method: 'POST',
    body: JSON.stringify({
      phone,
      message,
      accountSid: process.env.VITE_TWILIO_ACCOUNT_SID,
      authToken: process.env.VITE_TWILIO_AUTH_TOKEN
    })
  });
  return response.json();
}


STEP 3: Use in src/App.jsx
────────────────────────────────────────────
File: money-in-control/src/App.jsx

import { getStockPrice, getNews } from './lib/stocks';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Get stock prices
    const loadStocks = async () => {
      const tcs = await getStockPrice('TCS');
      const reliance = await getStockPrice('RELIANCE');
      setStocks([
        { symbol: 'TCS', price: tcs.c },
        { symbol: 'RELIANCE', price: reliance.c }
      ]);
    };

    // Get news
    const loadNews = async () => {
      const data = await getNews();
      setNews(data.articles);
    };

    loadStocks();
    loadNews();
  }, []);

  return (
    <div>
      <h2>Stock Prices</h2>
      {stocks.map(s => (
        <div key={s.symbol}>
          {s.symbol}: ₹{s.price}
        </div>
      ))}

      <h2>News</h2>
      {news.map(article => (
        <div key={article.url}>
          <h3>{article.title}</h3>
          <p>{article.description}</p>
        </div>
      ))}
    </div>
  );
}


STEP 4: Deploy to GitHub
────────────────────────────────────────────
git add .
git commit -m "Add API integration"
git push


STEP 5: Add Secrets to GitHub
────────────────────────────────────────────
Go to: Settings > Secrets and variables > Actions

Add:
- VITE_FINNHUB_API_KEY = c123xyz
- VITE_NEWSAPI_KEY = abc123def
- All other keys


STEP 6: Vercel Auto-Deploys
────────────────────────────────────────────
✅ App automatically rebuilds
✅ APIs available in production
✅ Live at your-app.vercel.app
```

---

## Quick Checklist: API Integration

```
GET API KEYS
  ☐ Finnhub.io - Stock prices
  ☐ NewsAPI.org - News
  ☐ Twilio.com - SMS (optional)
  ☐ SendGrid.com - Email (optional)

ADD TO .env
  ☐ Copy .env.example to .env
  ☐ Add all API keys
  ☐ Verify format

ADD FUNCTIONS
  ☐ Create src/lib/stocks.js
  ☐ Add getStockPrice()
  ☐ Add getNews()
  ☐ Add sendSMS() (optional)

USE IN APP
  ☐ Import functions
  ☐ Call in useEffect()
  ☐ Display results
  ☐ Test locally

DEPLOY
  ☐ Add keys to GitHub Secrets
  ☐ git push
  ☐ Vercel auto-deploys
  ☐ Test live APIs
```

---

## Environment Variable Mapping

```
Browser Request
       │
       ▼
process.env.VITE_FINNHUB_API_KEY  ← Read from .env
       │
       ▼
https://finnhub.io/api/v1/quote?token=XXX
       │
       ▼
Response: { "c": 2850, "h": 2875, ... }
       │
       ▼
setStocks([...])
       │
       ▼
<div>₹{price}</div>
```

---

## Where Each API Goes

```
Finnhub (Stock Prices)
└─ getStockPrice() in src/lib/stocks.js
   └─ Used in Portfolio.jsx, Analytics.jsx
      └─ Displayed as: ₹2850

NewsAPI (News)
└─ getNews() in src/lib/stocks.js
   └─ Used in App.jsx
      └─ Displayed as: Article cards

Twilio (SMS)
└─ sendSMS() in src/lib/stocks.js
   └─ Called from AlertsScreen
      └─ Sends: "TCS hit ₹3500"

SendGrid (Email)
└─ sendEmail() in src/lib/stocks.js
   └─ Called from notifications
      └─ Sends: Daily digest

Firebase (Database)
└─ Already configured
   └─ Stores user data
      └─ Authenticated access
```

---

## Common API Response Formats

```
Finnhub Quote:
{
  "c": 2850,           // Current price
  "h": 2875.50,        // High
  "l": 2820,           // Low
  "o": 2840,           // Open
  "pc": 2820.50        // Previous close
}

NewsAPI Articles:
{
  "articles": [
    {
      "title": "TCS stock...",
      "description": "...",
      "url": "...",
      "urlToImage": "...",
      "publishedAt": "2024-01-15T..."
    }
  ]
}

Twilio Send:
{
  "sid": "SM123...",
  "status": "queued",
  "to": "+911234567890",
  "body": "Your alert..."
}
```

---

**That's it! Your app is now API-integrated!** 🎉

