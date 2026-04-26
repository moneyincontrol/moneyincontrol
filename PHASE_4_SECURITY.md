# 🔒 PHASE 4: Security & CI/CD - Complete Implementation

## Part 1: Security & Compliance

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - only accessible by owner
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Subcollections
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    // Admin data
    match /admin/{document=**} {
      allow read, write: if isAdmin();
    }

    // Public news (read-only)
    match /news/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Helper functions
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

---

### Data Encryption

```javascript
// security/encryption.js
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const secretKey = process.env.ENCRYPTION_SECRET_KEY;

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag.toString('hex'),
  };
};

export const decrypt = (encryptedObj) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    Buffer.from(encryptedObj.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

---

### Audit Logger

```javascript
// security/audit-logger.js
import admin from 'firebase-admin';

export const logActivity = async (userId, action, details) => {
  await admin
    .firestore()
    .collection('audit_logs')
    .add({
      userId,
      action,
      details,
      timestamp: new Date(),
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
    });
};

export const logSecurityEvent = async (userId, event, severity) => {
  await admin
    .firestore()
    .collection('security_logs')
    .add({
      userId,
      event,
      severity, // 'low', 'medium', 'high'
      timestamp: new Date(),
    });

  if (severity === 'high') {
    // Send alert
    sendSecurityAlert(userId, event);
  }
};

export const getAuditTrail = async (userId, days = 30) => {
  const snapshot = await admin
    .firestore()
    .collection('audit_logs')
    .where('userId', '==', userId)
    .where('timestamp', '>=', new Date(Date.now() - days * 24 * 60 * 60 * 1000))
    .orderBy('timestamp', 'desc')
    .get();

  return snapshot.docs.map(doc => doc.data());
};
```

---

### 2FA Authentication

```javascript
// security/two-factor.js
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const generateSecret = (email) => {
  return speakeasy.generateSecret({
    name: `Money In Control (${email})`,
    issuer: 'Money In Control',
    length: 32,
  });
};

export const generateQRCode = async (secret) => {
  return await QRCode.toDataURL(secret.otpauth_url);
};

export const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2,
  });
};
```

---

## Part 2: CI/CD Automation

### GitHub Actions Deploy Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          # ... all other env vars
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

### Testing Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

### Sentry Error Tracking

```javascript
// monitoring/sentry-config.js
import * as Sentry from "@sentry/react";

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // Filter sensitive data
      if (event.request?.url) {
        event.request.url = event.request.url.split('?')[0];
      }
      return event;
    },
  });
};

export const captureException = (error, context) => {
  Sentry.captureException(error, { contexts: { custom: context } });
};

export const captureMessage = (message, level) => {
  Sentry.captureMessage(message, level);
};
```

---

### Performance Monitoring

```javascript
// monitoring/performance.js
import * as Sentry from "@sentry/react";

export const initPerformanceMonitoring = () => {
  // Track Web Vitals
  if ('web-vital' in window) {
    window.addEventListener('web-vital', ({ detail }) => {
      const { name, value } = detail;
      Sentry.captureMessage(`Web Vital: ${name}`, 'info', {
        measurements: {
          [name]: { value },
        },
      });
    });
  }
};

export const startTransaction = (name) => {
  return Sentry.startTransaction({ name });
};

export const trackAPICall = async (endpoint, fn) => {
  const transaction = startTransaction(`API ${endpoint}`);
  try {
    const result = await fn();
    transaction.finish();
    return result;
  } catch (error) {
    transaction.finish();
    throw error;
  }
};
```

---

## GDPR Compliance

```javascript
// compliance/gdpr.js
export const exportUserData = async (userId) => {
  const userData = await db.collection('users').doc(userId).get();
  const portfolio = await db.collection('users').doc(userId).collection('portfolio').get();
  const watchlist = await db.collection('users').doc(userId).collection('watchlist').get();
  
  return {
    user: userData.data(),
    portfolio: portfolio.docs.map(d => d.data()),
    watchlist: watchlist.docs.map(d => d.data()),
  };
};

export const deleteUserData = async (userId) => {
  // Delete all user data and comply with GDPR
  const batch = db.batch();
  
  batch.delete(db.collection('users').doc(userId));
  
  const subcollections = ['portfolio', 'watchlist', 'alerts', 'transactions'];
  for (const collection of subcollections) {
    const docs = await db.collection('users').doc(userId).collection(collection).get();
    docs.forEach(doc => batch.delete(doc.ref));
  }
  
  await batch.commit();
};
```

---

## ✅ Implementation Checklist

- [ ] Deploy Firestore security rules
- [ ] Setup data encryption
- [ ] Implement audit logging
- [ ] Add 2FA support
- [ ] Configure GitHub Actions
- [ ] Setup Sentry monitoring
- [ ] Add GDPR compliance
- [ ] Test security rules
- [ ] Documentation review
- [ ] Security audit

---

## 🎯 Next: Phase 5 - Performance Optimization

