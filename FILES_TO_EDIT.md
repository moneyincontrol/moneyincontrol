# 📝 EDITING GUIDE - Which Files to Edit & How

## 🎯 Quick Reference

### ⭐ MUST EDIT (Before Deploying)

| File | Why | What to Change |
|------|-----|-----------------|
| `.env` | Add Firebase keys | Copy from `.env.example` and fill in values |
| `src/firebase.js` | Database connection | Already has placeholders for env vars |

### 📝 SHOULD EDIT (Customization)

| File | Why | What to Change |
|------|-----|-----------------|
| `src/App.jsx` | Branding & features | App name, colors, default stocks |
| `README.md` | Project info | Your name, links, description |
| `tailwind.config.js` | Colors/styling | Brand colors, fonts |

### 🔧 MIGHT EDIT (Advanced)

| File | Why | What to Change |
|------|-----|-----------------|
| `package.json` | Dependencies | Only if adding new packages |
| `.github/workflows/deploy.yml` | Deployment | Only if using different hosting |
| `mobile/firebase-config.ts` | Mobile Firebase | Same as web firebase.js |

---

## 1️⃣ STEP 1: Configure Firebase (.env file)

**Location:** `money-in-control/.env`

**Status:** 🔴 CRITICAL - Must do this first!

### How to get Firebase credentials:

1. Go to: https://console.firebase.google.com
2. Click "Create Project" → name it "money-in-control"
3. Wait for creation
4. Click on project
5. Go to **Settings > Project Settings**
6. Scroll down to find:
   - **API Key** → `VITE_FIREBASE_API_KEY`
   - **Auth Domain** → `VITE_FIREBASE_AUTH_DOMAIN`
   - **Project ID** → `VITE_FIREBASE_PROJECT_ID`
   - **Storage Bucket** → `VITE_FIREBASE_STORAGE_BUCKET`
   - **Messaging Sender ID** → `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - **App ID** → `VITE_FIREBASE_APP_ID`

### What to do:

```bash
# Open the project folder
cd money-in-control

# Copy template
cp .env.example .env

# Edit .env with your credentials
nano .env
# or use your editor (VS Code, etc.)
```

### Example .env file:
```
VITE_FIREBASE_API_KEY=AIzaSyDm2KXYZ123456789abcdef
VITE_FIREBASE_AUTH_DOMAIN=money-in-control-abc123.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=money-in-control-abc123
VITE_FIREBASE_STORAGE_BUCKET=money-in-control-abc123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123def456
```

---

## 2️⃣ STEP 2: Test Locally

**Location:** Command line

**Status:** ✅ Verification step

### Commands:
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Visit: http://localhost:5173
```

### Test these features:
- ✅ App loads
- ✅ Can sign up
- ✅ Can login
- ✅ Can add stock to watchlist
- ✅ Can set price alert

**If any error:** Check `.env` values are correct

---

## 3️⃣ STEP 3: Customize App (Optional)

**Location:** `money-in-control/src/App.jsx`

**Status:** ⚪ Optional - Do after deployment

### What you can change:

#### A. App Title (Line ~20)
```javascript
// Find this:
<h1 className="text-3xl font-bold">Money In Control</h1>

// Change to:
<h1 className="text-3xl font-bold">Your App Name</h1>
```

#### B. Default Stocks List (Line ~50-60)
```javascript
// Find this:
const stocks = [
  { id: 1, symbol: 'RELIANCE', price: 2850, change: 1.2, ... },
  { id: 2, symbol: 'TCS', price: 3280, change: 2.1, ... },
];

// Change to:
const stocks = [
  { id: 1, symbol: 'INFY', price: 1680, change: -0.5, ... },
  { id: 2, symbol: 'HDFC', price: 2450, change: 0.8, ... },
];
```

#### C. Brand Colors (Line ~100)
```javascript
// Find this:
className="text-emerald-400"  // Green color

// Change to:
className="text-blue-400"     // Or any color
```

**Available Tailwind colors:**
- `emerald`, `blue`, `purple`, `pink`, `red`, `yellow`, `green`, etc.

---

## 4️⃣ STEP 4: Push to GitHub

**Location:** GitHub repository

**Status:** 📤 Deployment step

### Commands:
```bash
# Stage changes
git add .

# Commit with message
git commit -m "Initial commit: Money In Control"

# Push to GitHub
git push -u origin main
```

### What happens next:
1. GitHub Actions runs tests
2. Vercel auto-builds your app
3. App deployed at: `https://money-in-control-xxx.vercel.app`

---

## 5️⃣ STEP 5: Setup Vercel (Auto-Deploy)

**Location:** https://vercel.com

**Status:** 🚀 Production deployment

### Steps:

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Paste: `https://github.com/YOUR_USERNAME/money-in-control`
4. Click "Import"
5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all values from your `.env` file
6. Click "Deploy"
7. **Get your URL:** `https://money-in-control-xxx.vercel.app`

### Auto-deploy setup:
- Every time you `git push`
- Vercel auto-builds & deploys
- Your live app updates automatically!

---

## 📋 File-by-File Editing Guide

### `.env` - Configuration
```
File: .env
Status: MUST EDIT
What: Add Firebase credentials
When: Before first run
How: Copy .env.example and fill in values
```

### `src/firebase.js` - Database
```
File: src/firebase.js
Status: Usually don't edit (uses .env)
What: Database helper functions
When: Only if changing Firestore structure
How: Advanced - see PHASE_4_SECURITY.md
```

### `src/App.jsx` - Main App
```
File: src/App.jsx
Status: Edit for customization
What: App title, default stocks, colors
When: After deployment working
How: Find and replace values
```

### `src/components/Portfolio.jsx` - Portfolio
```
File: src/components/Portfolio.jsx
Status: Optional customization
What: Portfolio tracking features
When: For advanced customization
How: See PHASE_1_SETUP.md
```

### `src/components/Analytics.jsx` - Analytics
```
File: src/components/Analytics.jsx
Status: Optional customization
What: Analytics display
When: For custom metrics
How: See PHASE_1_SETUP.md
```

### `tailwind.config.js` - Styling
```
File: tailwind.config.js
Status: Edit for branding
What: Colors, fonts, spacing
When: For custom design
How: Tailwind documentation
```

### `package.json` - Dependencies
```
File: package.json
Status: Usually don't edit
What: List of packages used
When: Only when adding packages
How: npm install package-name
```

### `vite.config.js` - Build Config
```
File: vite.config.js
Status: Don't edit
What: Vite build settings
When: Never needed
How: Leave as-is
```

### `.github/workflows/deploy.yml` - CI/CD
```
File: .github/workflows/deploy.yml
Status: Don't edit
What: Auto-deployment pipeline
When: Not needed
How: GitHub Actions handles it
```

---

## 🔐 Important Security Notes

### DO NOT:
❌ Commit `.env` file to GitHub  
❌ Share your API keys  
❌ Hardcode secrets in code  
❌ Upload `node_modules`  

### DO:
✅ Use `.env` for secrets  
✅ Add to `.gitignore` (already done)  
✅ Use GitHub Secrets for production  
✅ Rotate keys periodically  

---

## 📱 Mobile App (Optional)

**Location:** `money-in-control/mobile/`

**Status:** Optional after web app works

### To edit:

#### 1. Mobile Firebase Config
```typescript
// File: mobile/firebase-config.ts
// Add same Firebase credentials as web
```

#### 2. Mobile App Code
```typescript
// File: mobile/App.tsx
// Same changes as web App.jsx
```

### To deploy:
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

See `PHASE_1_SETUP.md` for complete guide

---

## 🎨 Customization Examples

### Example 1: Change App Title
```javascript
// File: src/App.jsx
// Line ~20

BEFORE:
<h1>Money In Control</h1>

AFTER:
<h1>Stock Masters India</h1>
```

### Example 2: Change Primary Color
```javascript
// File: src/App.jsx (many places)
// Or file: src/index.css

BEFORE:
className="bg-emerald-600"

AFTER:
className="bg-blue-600"
```

### Example 3: Add New Stock
```javascript
// File: src/App.jsx
// Line ~50-60

BEFORE:
{ id: 1, symbol: 'RELIANCE', price: 2850, change: 1.2 }

AFTER:
{ id: 1, symbol: 'RELIANCE', price: 2850, change: 1.2 },
{ id: 10, symbol: 'LT', price: 2200, change: 0.5 }
```

---

## ✅ Pre-Launch Checklist

- [ ] `.env` created with Firebase keys
- [ ] `npm install` successful
- [ ] `npm run dev` works locally
- [ ] Can login/signup
- [ ] Can add stocks to watchlist
- [ ] Can set alerts
- [ ] GitHub repository created
- [ ] `git push` successful
- [ ] Vercel imported and deployed
- [ ] Live URL working
- [ ] Test on mobile browser

---

## 🚀 Typical Workflow

### Day 1: Setup
```bash
# Extract zip
unzip money-in-control.zip
cd money-in-control

# Setup Firebase
cp .env.example .env
# Edit .env with your Firebase keys

# Test locally
npm install
npm run dev
# Visit http://localhost:5173
```

### Day 2: GitHub
```bash
# Create GitHub repo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOU/money-in-control.git
git push -u origin main
```

### Day 3: Deploy
```bash
# Go to vercel.com/new
# Import GitHub repository
# Add environment variables
# Deploy!
```

### Day 4: Customize (Optional)
```bash
# Edit src/App.jsx
# Change title, colors, stocks
git add .
git commit -m "Customize branding"
git push
# Auto-deploys to Vercel!
```

---

## 📞 Troubleshooting While Editing

### Issue: "Variable not defined"
**Solution:** Check `.env` file exists and has correct key names

### Issue: "Cannot find Firebase"
**Solution:** Verify Firebase project is created and keys are correct

### Issue: "Localhost won't start"
**Solution:** Run `npm install` again, delete node_modules

### Issue: "Styles not showing"
**Solution:** Make sure `index.css` is imported in `main.jsx`

### Issue: "Can't deploy to Vercel"
**Solution:** Check GitHub Secrets have all Firebase keys

---

## 📚 Detailed Guides for Each Phase

For more detailed editing instructions:
- `PHASE_1_SETUP.md` - Features customization
- `PHASE_3_AI_FEATURES.md` - AI integration
- `PHASE_4_SECURITY.md` - Security setup
- `FREE_STRATEGY_ROADMAP.md` - Growth customization

---

## 🎯 Summary

### Files to Edit:
1. **`.env`** ← DO THIS FIRST (Firebase keys)
2. **`src/App.jsx`** ← Customize app
3. **`tailwind.config.js`** ← Colors/design
4. **`README.md`** ← Your project info

### Files NOT to Edit:
- `package.json` (unless adding packages)
- `.github/workflows/` (auto-deploy)
- `vite.config.js` (build config)
- `src/firebase.js` (unless advanced)

### Deployment Process:
1. Edit `.env`
2. Test locally with `npm run dev`
3. Push to GitHub
4. Vercel auto-deploys
5. Share your URL!

---

**You're ready to edit and deploy!** 🚀

Start with `.env` → Test → Push → Deploy → Success!

