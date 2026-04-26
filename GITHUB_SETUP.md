# GitHub Setup Guide for Money In Control

Complete step-by-step guide to set up your repository on GitHub.

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web
1. Go to https://github.com/new
2. Enter repository name: `money-in-control`
3. Description: "Free stock market platform with AI"
4. Choose: **Public** (for visibility)
5. Add .gitignore: **Node** (already in our project)
6. Add README: No (we have one)
7. Click **Create Repository**

### Option B: Using GitHub CLI
```bash
gh repo create money-in-control --public --source=. --remote=origin --push
```

---

## Step 2: Clone Repository Locally

If you created it on GitHub first:
```bash
git clone https://github.com/YOUR_USERNAME/money-in-control.git
cd money-in-control
```

---

## Step 3: Initialize Git (If starting fresh)

```bash
cd money-in-control
git init
git add .
git commit -m "Initial commit: Money In Control platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/money-in-control.git
git push -u origin main
```

---

## Step 4: Add Environment Variables (GitHub Secrets)

### For Deployment (Vercel):

Go to: **GitHub Settings > Secrets and variables > Actions**

Add these secrets:

```
VITE_FIREBASE_API_KEY         = your_api_key
VITE_FIREBASE_AUTH_DOMAIN     = your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID      = your_project_id
VITE_FIREBASE_STORAGE_BUCKET  = your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your_id
VITE_FIREBASE_APP_ID          = your_app_id

VERCEL_TOKEN                  = your_vercel_token
VERCEL_ORG_ID                 = your_vercel_org_id
VERCEL_PROJECT_ID             = your_vercel_project_id
```

### How to get Vercel secrets:

1. Go to https://vercel.com/account/tokens
2. Create new token (copy it)
3. Go to Vercel dashboard > Settings
4. Find ORG ID and PROJECT ID
5. Add to GitHub secrets

---

## Step 5: Setup Vercel Integration (Optional but Recommended)

### Option A: Auto-Deploy from GitHub (Best)

1. Go to https://vercel.com/import
2. Select "Other Git Provider"
3. Enter repository URL: `https://github.com/YOUR_USERNAME/money-in-control`
4. Click Import
5. Add environment variables in Vercel dashboard
6. Deploy!

**Now every git push auto-deploys!**

### Option B: Manual Deployment

```bash
npm install -g vercel
vercel
# Follow prompts
```

---

## File Structure for GitHub

```
money-in-control/
├── src/                    # Web app source
│   ├── App.jsx            # ⭐ EDIT: Main app
│   ├── firebase.js        # ⭐ EDIT: Add Firebase keys
│   ├── main.jsx
│   ├── index.css
│   └── components/
│       ├── Portfolio.jsx
│       ├── Analytics.jsx
│       └── AdminDashboard.jsx
├── mobile/                # React Native app
│   ├── App.tsx
│   ├── firebase-config.ts
│   └── package.json
├── public/                # Static assets
├── .github/workflows/     # CI/CD pipelines
├── .env.example          # ⭐ COPY TO .env & EDIT
├── .gitignore            # Files to ignore
├── package.json          # Web dependencies
├── vite.config.js        # Vite config
├── tailwind.config.js    # Tailwind config
├── README.md             # Project overview
├── GITHUB_SETUP.md       # This file
└── Documentation/        # All guides
```

---

## Files to Edit

### 1️⃣ .env (MOST IMPORTANT!)

```bash
# Copy from template
cp .env.example .env

# Edit with your credentials
nano .env
# Or use any editor
```

**Never commit .env to GitHub!** (.gitignore already ignores it)

### 2️⃣ src/firebase.js

Add your Firebase credentials:
```javascript
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // ... rest
};
```

### 3️⃣ src/App.jsx

Customize:
- Stock list (around line 50)
- Default features
- UI colors
- App name/branding

### 4️⃣ package.json (Usually don't edit)

If you add new packages:
```bash
npm install package-name
git add package.json package-lock.json
git commit -m "Add package-name"
git push
```

---

## Common Git Commands

### Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/money-in-control.git
cd money-in-control
```

### Make Changes
```bash
git status                    # See what changed
git add .                     # Stage changes
git commit -m "Your message"  # Commit
git push                      # Push to GitHub
```

### Create Feature Branch
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature
# Create Pull Request on GitHub
```

### Update from GitHub
```bash
git pull
```

---

## Deployment Pipeline

### On Every Git Push:

1. **GitHub Actions** runs tests
2. **Vercel** auto-builds your app
3. **Vercel** deploys to production
4. **Your app** is live!

All automatic. No manual steps needed.

---

## Environment Variables Reference

### Development (.env)
```
VITE_FIREBASE_API_KEY=local_key
VITE_FIREBASE_PROJECT_ID=local_project
```

### Production (Vercel)
Set in Vercel dashboard or GitHub secrets.

### GitHub Actions
Used in `.github/workflows/deploy.yml`

---

## First Deployment Checklist

- [ ] Create GitHub repository
- [ ] Clone locally
- [ ] Copy .env.example to .env
- [ ] Add Firebase credentials to .env
- [ ] Run `npm install`
- [ ] Run `npm run dev` (test locally)
- [ ] Git add/commit/push
- [ ] Setup Vercel
- [ ] Add secrets to Vercel/GitHub
- [ ] Trigger first deploy
- [ ] Check vercel.app URL

---

## Troubleshooting

### "Build failed"
- Check `.env` has all variables
- Run `npm run build` locally to debug
- Check GitHub Actions logs

### "Cannot find module"
- Run `npm install` again
- Delete node_modules and package-lock.json
- Run `npm install` again

### "Firebase connection error"
- Check API keys in .env
- Make sure Firestore is enabled in Firebase
- Check Firebase security rules

### "Deployment stuck"
- Check Vercel dashboard logs
- Check GitHub Actions logs
- Retry deployment from Vercel dashboard

---

## Next Steps After Deployment

1. **Test the app** at your vercel.app URL
2. **Invite users** to test
3. **Collect feedback**
4. **Make improvements**
5. **Push changes** (auto-deploys)
6. **Share with ProductHunt**

---

## Useful Links

- GitHub: https://github.com/YOUR_USERNAME/money-in-control
- Vercel: https://vercel.com/dashboard
- Firebase: https://console.firebase.google.com
- Vite: https://vitejs.dev
- React: https://react.dev

---

## Quick Command Cheatsheet

```bash
# Setup
git clone <url>
npm install

# Development
npm run dev           # Run locally
npm run build         # Build for production
npm run lint          # Check code

# Git Workflow
git status            # See changes
git add .             # Stage changes
git commit -m "msg"   # Commit
git push              # Push to GitHub
git pull              # Get latest changes

# Branches
git checkout -b name  # Create branch
git switch main       # Switch branch
git merge feature      # Merge branch
```

---

**You're ready to deploy!** 🚀

Start with Step 1 and follow through.

