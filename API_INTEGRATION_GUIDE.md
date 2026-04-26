# 🔌 WHERE TO ADD APIs - Complete Guide

## 📍 API Configuration Locations

---

## 1️⃣ ADD API KEYS TO `.env` FILE

**Location:** `money-in-control/.env`

### Step 1: Copy Template
```bash
cp .env.example .env
```

### Step 2: Edit `.env` with ALL API keys

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

# Stock Data API (Finnhub)
VITE_FINNHUB_API_KEY=your_finnhub_key

# News API (NewsAPI)
VITE_NEWSAPI_KEY=your_newsapi_key

# SMS Service (Twilio) - Optional
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE_NUMBER=+1234567890

# Email Service (SendGrid) - Optional
VITE_SENDGRID_API_KEY=your_sendgrid_key

# Error Tracking (Sentry) - Optional
VITE_SENTRY_DSN=your_sentry_dsn
```

---

## 2️⃣ GET API KEYS (Step by Step)

### 📊 Finnhub (Stock Data) - RECOMMENDED

**What it does:** Real-time stock prices, company info, technical indicators

1. Go to: https://finnhub.io
2. Sign up (free account)
3. Go to: Dashboard > API tokens
4. Copy your API key
5. Add to `.env`:
```env
VITE_FINNHUB_API_KEY=c1234567890abcdef
```

### 📰 NewsAPI (News Data) - RECOMMENDED

**What it does:** Financial news, market updates, stock-specific news

1. Go to: https://newsapi.org
2. Sign up (free account)
3. Go to: Dashboard > API keys
4. Copy your API key
5. Add to `.env`:
```env
VITE_NEWSAPI_KEY=abc123def456789
```

### 📱 Twilio (SMS Alerts) - OPTIONAL

**What it does:** Send SMS price alerts to users

1. Go to: https://twilio.com
2. Sign up (free trial with $15 credit)
3. Go to: Console > Account SID
4. Get your credentials
5. Add to `.env`:
```env
VITE_TWILIO_ACCOUNT_SID=AC1234567890abcdef
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

### 📧 SendGrid (Email Alerts) - OPTIONAL

**What it does:** Send email notifications to users

1. Go to: https://sendgrid.com
2. Sign up (free account)
3. Go to: Settings > API Keys
4. Create new API key
5. Copy the key
6. Add to `.env`:
```env
VITE_SENDGRID_API_KEY=SG.abc123...
```

### 🔍 Sentry (Error Tracking) - OPTIONAL

**What it does:** Monitor errors in production

1. Go to: https://sentry.io
2. Sign up (free account)
3. Create project: Node.js
4. Copy DSN
5. Add to `.env`:
```env
VITE_SENTRY_DSN=https://abc123@sentry.io/123456
```

---

## 3️⃣ USE APIs IN CODE

### File: `src/firebase.js`

Add these helper functions:

```javascript
// Stock Data (Finnhub)
export const getStockData = async (symbol) => {
  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.VITE_FINNHUB_API_KEY}`
  );
  return response.json();
};

// News Data (NewsAPI)
export const getMarketNews = async (query = 'stock market') => {
  const response = await fetch(
    `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&apiKey=${process.env.VITE_NEWSAPI_KEY}`
  );
  return response.json();
};

// Company Profile (Finnhub)
export const getCompanyProfile = async (symbol) => {
  const response = await fetch(
    `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${process.env.VITE_FINNHUB_API_KEY}`
  );
  return response.json();
};
```

### Use in Components

**File: `src/App.jsx`**

```javascript
import { getStockData, getMarketNews, getCompanyProfile } from './firebase';

// Inside component:
useEffect(() => {
  // Get stock price
  getStockData('TCS').then(data => {
    console.log('Stock price:', data);
  });

  // Get news
  getMarketNews('Indian stocks').then(data => {
    console.log('News:', data.articles);
  });

  // Get company info
  getCompanyProfile('RELIANCE').then(data => {
    console.log('Company:', data);
  });
}, []);
```

---

## 4️⃣ WHERE TO CALL APIs

### Option A: In `App.jsx` (Main App)

```javascript
// src/App.jsx
import { getStockData, getMarketNews } from './firebase';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Fetch stocks
    Promise.all([
      getStockData('RELIANCE'),
      getStockData('TCS'),
      getStockData('INFY'),
    ]).then(responses => {
      setStocks(responses);
    });

    // Fetch news
    getMarketNews('Indian stocks').then(data => {
      setNews(data.articles);
    });
  }, []);

  return (
    <div>
      {stocks.map(stock => (
        <div key={stock.symbol}>
          {stock.symbol}: ₹{stock.c}
        </div>
      ))}
      
      {news.map(article => (
        <div key={article.url}>
          <h3>{article.title}</h3>
          <p>{article.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Option B: In Components

**File: `src/components/Portfolio.jsx`**

```javascript
import { getStockData } from '../firebase';

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    // Update prices for each holding
    holdings.forEach(holding => {
      getStockData(holding.symbol).then(data => {
        holding.currentPrice = data.c;
        setHoldings([...holdings]);
      });
    });
  }, []);

  return (
    // Your portfolio UI
  );
}
```

### Option C: In Backend Function

**File: `src/lib/priceUpdater.js` (Create new file)**

```javascript
import { getStockData } from '../firebase';

export const updateAllPrices = async (stocks) => {
  const updated = await Promise.all(
    stocks.map(stock => getStockData(stock.symbol))
  );
  return updated;
};
```

---

## 5️⃣ API RESPONSE EXAMPLES

### Finnhub Stock Quote
```json
{
  "c": 2850.00,        // Current price
  "h": 2875.50,        // High
  "l": 2820.00,        // Low
  "o": 2840.00,        // Open
  "pc": 2820.50,       // Previous close
  "t": 1234567890      // Timestamp
}
```

Use in code:
```javascript
const stockData = await getStockData('RELIANCE');
console.log(`Price: ₹${stockData.c}`);
console.log(`High: ₹${stockData.h}`);
console.log(`Low: ₹${stockData.l}`);
```

### NewsAPI Articles
```json
{
  "articles": [
    {
      "title": "TCS stock rises 2%",
      "description": "...",
      "url": "https://...",
      "urlToImage": "https://...",
      "publishedAt": "2024-01-15T10:30:00Z",
      "source": {"name": "Business Standard"}
    }
  ]
}
```

Use in code:
```javascript
const news = await getMarketNews('TCS');
news.articles.forEach(article => {
  console.log(article.title);
  console.log(article.source.name);
});
```

---

## 6️⃣ COMPLETE `.env.example` FILE

Create/update: `money-in-control/.env.example`

```env
# =================================
# Firebase Configuration (Required)
# =================================
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# =================================
# Stock Data API (Recommended)
# Get from: https://finnhub.io
# =================================
VITE_FINNHUB_API_KEY=your_finnhub_api_key

# =================================
# News API (Recommended)
# Get from: https://newsapi.org
# =================================
VITE_NEWSAPI_KEY=your_newsapi_key

# =================================
# SMS Service - Twilio (Optional)
# Get from: https://twilio.com
# =================================
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE_NUMBER=+1234567890

# =================================
# Email Service - SendGrid (Optional)
# Get from: https://sendgrid.com
# =================================
VITE_SENDGRID_API_KEY=your_sendgrid_key

# =================================
# Error Tracking - Sentry (Optional)
# Get from: https://sentry.io
# =================================
VITE_SENTRY_DSN=your_sentry_dsn_url

# =================================
# Optional - Future APIs
# =================================
# VITE_ALPHA_VANTAGE_KEY=your_key
# VITE_POLYGON_API_KEY=your_key
# VITE_IEX_CLOUD_KEY=your_key
```

---

## 7️⃣ COMPLETE EXAMPLE: Get & Display Stock

### Step 1: Add API Key to `.env`
```env
VITE_FINNHUB_API_KEY=c123xyz
```

### Step 2: Add Function to `firebase.js`
```javascript
export const getStockData = async (symbol) => {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.VITE_FINNHUB_API_KEY}`
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching stock:', error);
    return null;
  }
};
```

### Step 3: Use in `App.jsx`
```javascript
import { getStockData } from './firebase';

export default function App() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    getStockData('RELIANCE').then(data => {
      if (data) {
        setStocks([{
          symbol: 'RELIANCE',
          price: data.c,
          change: ((data.c - data.pc) / data.pc * 100).toFixed(2)
        }]);
      }
    });
  }, []);

  return (
    <div>
      {stocks.map(stock => (
        <div key={stock.symbol}>
          <h3>{stock.symbol}</h3>
          <p>₹{stock.price}</p>
          <p className={stock.change > 0 ? 'text-green-500' : 'text-red-500'}>
            {stock.change}%
          </p>
        </div>
      ))}
    </div>
  );
}
```

---

## 8️⃣ GITHUB SECRETS FOR PRODUCTION

Go to: **GitHub > Settings > Secrets and variables > Actions**

Add ALL API keys as secrets:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FINNHUB_API_KEY
VITE_NEWSAPI_KEY
VITE_TWILIO_ACCOUNT_SID
VITE_TWILIO_AUTH_TOKEN
VITE_TWILIO_PHONE_NUMBER
VITE_SENDGRID_API_KEY
VITE_SENTRY_DSN
```

Then in GitHub Actions workflow (`.github/workflows/deploy.yml`):
```yaml
env:
  VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
  VITE_FINNHUB_API_KEY: ${{ secrets.VITE_FINNHUB_API_KEY }}
  # ... all other secrets
```

---

## 🎯 SUMMARY: API SETUP CHECKLIST

```
SETUP APIs
  ☐ Get Finnhub API key (stocks)
  ☐ Get NewsAPI key (news)
  ☐ Get Twilio credentials (SMS) - optional
  ☐ Get SendGrid key (email) - optional
  ☐ Get Sentry DSN (errors) - optional

ADD TO FILES
  ☐ Copy .env.example to .env
  ☐ Add all API keys to .env
  ☐ Add helper functions to firebase.js
  ☐ Import & use in components
  ☐ Test locally (npm run dev)

DEPLOY
  ☐ Add API keys to GitHub Secrets
  ☐ Add secrets to GitHub Actions workflow
  ☐ Push to GitHub (auto-deploys)
  ☐ Test on live site
```

---

## 📋 QUICK REFERENCE TABLE

| API | Use Case | Free Tier | Where to Add |
|-----|----------|-----------|--------------|
| Firebase | Database & Auth | ✅ Yes | .env |
| Finnhub | Stock prices | ✅ 60/min | .env |
| NewsAPI | Financial news | ✅ 100/day | .env |
| Twilio | SMS alerts | ✅ Trial | .env |
| SendGrid | Email alerts | ✅ 100/day | .env |
| Sentry | Error tracking | ✅ Yes | .env |

---

## ⚠️ IMPORTANT NOTES

### Security
- ❌ Never commit `.env` to GitHub
- ✅ Use GitHub Secrets for production
- ✅ Rotate keys periodically
- ✅ Use environment variables only

### Rate Limits
- Finnhub: 60 requests/minute (free)
- NewsAPI: 100 requests/day (free)
- Twilio: Pay per SMS
- SendGrid: 100 emails/day (free)

### Error Handling
Always wrap API calls in try-catch:
```javascript
try {
  const data = await getStockData('TCS');
  // Use data
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error
}
```

---

## 🚀 NEXT STEPS

1. **Get API Keys:**
   - Finnhub: https://finnhub.io
   - NewsAPI: https://newsapi.org

2. **Add to `.env`:**
   ```bash
   cp .env.example .env
   nano .env  # Add your keys
   ```

3. **Add to `firebase.js`:**
   - Copy helper functions from this guide

4. **Use in Components:**
   - Call functions from components
   - Display data to users

5. **Test Locally:**
   ```bash
   npm run dev
   # Test in browser
   ```

6. **Deploy:**
   - Add keys to GitHub Secrets
   - Push to GitHub (auto-deploys)

---

## 💡 EXAMPLE: Complete API Integration

**File: `src/lib/stocks.js` (Create new file)**

```javascript
// Get real stock data
export const getRealStockData = async (symbol) => {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.VITE_FINNHUB_API_KEY}`
    );
    const data = await response.json();
    return {
      symbol,
      price: data.c,
      change: data.c - data.pc,
      changePercent: ((data.c - data.pc) / data.pc * 100).toFixed(2),
      high: data.h,
      low: data.l,
      open: data.o,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
};

// Get multiple stocks at once
export const getMultipleStocks = async (symbols) => {
  return Promise.all(symbols.map(sym => getRealStockData(sym)));
};

// Get financial news
export const getFinancialNews = async (query = 'Indian stocks') => {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${process.env.VITE_NEWSAPI_KEY}`
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return { articles: [] };
  }
};
```

**Use in `App.jsx`:**

```javascript
import { getMultipleStocks, getFinancialNews } from './lib/stocks';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Get stocks
    getMultipleStocks(['TCS', 'RELIANCE', 'INFY']).then(data => {
      setStocks(data.filter(s => s)); // Remove nulls
    });

    // Get news
    getFinancialNews('stock market India').then(data => {
      setNews(data.articles);
    });
  }, []);

  return (
    // Display stocks and news
  );
}
```

---

**All set!** Your app now has real APIs integrated! 🎉

