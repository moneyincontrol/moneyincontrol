import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Trash2, Heart, Home, Newspaper, Zap, LogOut, User, Eye, EyeOff, Phone, ArrowRight, AlertCircle, BarChart3, Calculator, Bell, Loader, BookOpen, MessageSquare, LineChart, Share2, X, Filter } from 'lucide-react';
import { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  googleProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc
} from './firebase';

const FinanceApp = () => {
  const [authMode, setAuthMode] = useState('login');
  const [authStep, setAuthStep] = useState(1);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('home');
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ symbol: '', price: '', type: 'above' });
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(5);
  const [screenerFilters, setScreenerFilters] = useState({ peMin: 0, peMax: 50 });
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedForAlert, setSelectedForAlert] = useState(null);

  const [activeNewsTab, setActiveNewsTab] = useState('general');
  const [newsData, setNewsData] = useState({
    general: [],
    earnings: [],
    ipo: [],
    merger: [],
    sector: {}
  });
  const [newsLoading, setNewsLoading] = useState(false);
  const [selectedSector, setSelectedSector] = useState('all');
  const [newsSearchTerm, setNewsSearchTerm] = useState('');
  const [stocksData, setStocksData] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [indices, setIndices] = useState([
    { name: 'Nifty 50', value: 24850, change: 1.2 },
    { name: 'Sensex', value: 81920, change: 0.95 },
    { name: 'Bank Nifty', value: 52480, change: 1.8 },
    { name: 'Nifty IT', value: 41200, change: 2.1 },
  ]);

  const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'YOUR_FINNHUB_API_KEY';
  const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY || 'YOUR_NEWSAPI_KEY';
  const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({ 
          name: currentUser.displayName || currentUser.email || currentUser.phoneNumber,
          email: currentUser.email,
          uid: currentUser.uid,
          phoneNumber: currentUser.phoneNumber
        });
        setIsAuthenticated(true);
        await loadUserData(currentUser.uid);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setWatchlist([]);
        setAlerts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid) => {
    try {
      const watchlistRef = collection(db, 'users', uid, 'watchlist');
      const watchlistSnapshot = await getDocs(watchlistRef);
      const watchlistData = watchlistSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWatchlist(watchlistData);

      const alertsRef = collection(db, 'users', uid, 'alerts');
      const alertsSnapshot = await getDocs(alertsRef);
      const alertsData = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlerts(alertsData);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const analyzeSentiment = (headline) => {
    const text = (headline || '').toLowerCase();
    const positiveKeywords = ['beat', 'surge', 'rally', 'gain', 'rise', 'soar', 'profit', 'strong', 'record', 'bullish', 'up', 'growth', 'success', 'outperform', 'upgrade', 'boost', 'optimistic', 'positive', 'excellent', 'momentum', 'dividend'];
    const negativeKeywords = ['crash', 'fall', 'plunge', 'loss', 'weak', 'decline', 'bearish', 'down', 'downgrade', 'sell', 'pessimistic', 'negative', 'concern', 'risk', 'crisis', 'drop', 'slump', 'miss', 'disappointing', 'worst', 'warning'];
    const positiveCount = positiveKeywords.filter(word => text.includes(word)).length;
    const negativeCount = negativeKeywords.filter(word => text.includes(word)).length;
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const fetchGeneralNews = async () => {
    try {
      if (!NEWSAPI_KEY || NEWSAPI_KEY === 'YOUR_NEWSAPI_KEY') return [];
      const url = `https://newsapi.org/v2/everything?q=India stock market NSE BSE&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWSAPI_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.articles?.map((article, i) => ({
        id: `general_${i}`,
        title: article.title,
        source: article.source?.name || 'News',
        time: new Date(article.publishedAt).toLocaleDateString(),
        sentiment: analyzeSentiment(article.title),
        url: article.url,
        image: article.urlToImage,
        provider: 'NewsAPI'
      })) || [];
    } catch (err) {
      console.error('Error fetching general news:', err);
      return [];
    }
  };

  const fetchEarningsNews = async () => {
    try {
      if (!NEWSAPI_KEY || NEWSAPI_KEY === 'YOUR_NEWSAPI_KEY') return [];
      const url = `https://newsapi.org/v2/everything?q=India stock earnings results quarterly financial&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWSAPI_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.articles?.map((article, i) => ({
        id: `earnings_${i}`,
        title: article.title,
        source: article.source?.name || 'News',
        time: new Date(article.publishedAt).toLocaleDateString(),
        sentiment: analyzeSentiment(article.title),
        url: article.url,
        image: article.urlToImage,
        provider: 'NewsAPI'
      })) || [];
    } catch (err) {
      console.error('Error fetching earnings news:', err);
      return [];
    }
  };

  const fetchIPONews = async () => {
    try {
      if (!NEWSAPI_KEY || NEWSAPI_KEY === 'YOUR_NEWSAPI_KEY') return [];
      const url = `https://newsapi.org/v2/everything?q=India IPO initial public offering listing stock market&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWSAPI_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.articles?.map((article, i) => ({
        id: `ipo_${i}`,
        title: article.title,
        source: article.source?.name || 'News',
        time: new Date(article.publishedAt).toLocaleDateString(),
        sentiment: analyzeSentiment(article.title),
        url: article.url,
        image: article.urlToImage,
        provider: 'NewsAPI'
      })) || [];
    } catch (err) {
      console.error('Error fetching IPO news:', err);
      return [];
    }
  };

  const fetchMergerNews = async () => {
    try {
      if (!NEWSAPI_KEY || NEWSAPI_KEY === 'YOUR_NEWSAPI_KEY') return [];
      const url = `https://newsapi.org/v2/everything?q=India merger acquisition deal takeover stock&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWSAPI_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.articles?.map((article, i) => ({
        id: `merger_${i}`,
        title: article.title,
        source: article.source?.name || 'News',
        time: new Date(article.publishedAt).toLocaleDateString(),
        sentiment: analyzeSentiment(article.title),
        url: article.url,
        image: article.urlToImage,
        provider: 'NewsAPI'
      })) || [];
    } catch (err) {
      console.error('Error fetching merger news:', err);
      return [];
    }
  };

  const fetchSectorNewsFunction = async (sectorName, keywords) => {
    try {
      if (!NEWSAPI_KEY || NEWSAPI_KEY === 'YOUR_NEWSAPI_KEY') return [];
      const url = `https://newsapi.org/v2/everything?q=${keywords}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWSAPI_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.articles?.map((article, i) => ({
        id: `${sectorName}_${i}`,
        title: article.title,
        source: article.source?.name || 'News',
        time: new Date(article.publishedAt).toLocaleDateString(),
        sentiment: analyzeSentiment(article.title),
        url: article.url,
        image: article.urlToImage,
        provider: 'NewsAPI'
      })) || [];
    } catch (err) {
      console.error(`Error fetching ${sectorName} news:`, err);
      return [];
    }
  };

  const fetchAllNews = async () => {
    setNewsLoading(true);
    try {
      const [general, earnings, ipo, merger] = await Promise.all([
        fetchGeneralNews(),
        fetchEarningsNews(),
        fetchIPONews(),
        fetchMergerNews(),
      ]);
      setNewsData({
        general: general.slice(0, 20),
        earnings: earnings.slice(0, 20),
        ipo: ipo.slice(0, 20),
        merger: merger.slice(0, 20),
        sector: {}
      });
    } catch (err) {
      console.error('Error fetching all news:', err);
    }
    setNewsLoading(false);
  };

  const sectors = [
    { name: 'IT', keyword: 'India IT stocks TCS Infosys Wipro' },
    { name: 'Banking', keyword: 'India bank stocks HDFC SBI ICICI banking' },
    { name: 'Pharma', keyword: 'India pharma stocks pharmaceutical drugs medicine' },
    { name: 'Energy', keyword: 'India oil energy NTPC Power coal petroleum' },
    { name: 'Telecom', keyword: 'India telecom Jio Airtel Vodafone communication' },
  ];

  const fetchSectorNews = async (sectorName, keywords) => {
    try {
      const news = await fetchSectorNewsFunction(sectorName, keywords);
      setNewsData(prev => ({
        ...prev,
        sector: {
          ...prev.sector,
          [sectorName]: news
        }
      }));
    } catch (err) {
      console.error(`Error fetching ${sectorName} news:`, err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'news') {
      fetchAllNews();
    }
  }, [isAuthenticated, activeTab]);

  const fetchStockData = async (symbol) => {
    try {
      const quoteUrl = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const [quoteRes, profileRes] = await Promise.all([
        fetch(quoteUrl),
        fetch(profileUrl)
      ]);
      const quote = await quoteRes.json();
      const profile = await profileRes.json();
      return {
        id: Math.random(),
        symbol: symbol.replace('.NS', ''),
        name: profile.name || symbol,
        price: quote.c || 0,
        change: quote.d || 0,
        changePercent: quote.dp || 0,
        high: quote.h || 0,
        low: quote.l || 0,
        open: quote.o || 0,
        volume: quote.v || 0,
        marketCap: profile.marketCapitalization ? (profile.marketCapitalization / 10000000000).toFixed(1) : 'N/A',
        sector: profile.finnhubIndustry || 'N/A',
        website: profile.weburl || 'N/A',
        about: profile.description || 'No description',
        chartData: [quote.pc, quote.c - 5, quote.c - 2, quote.c + 1, quote.c + 3, quote.c],
        pe: 24.5,
        rating: 4.2,
        ratingText: 'BUY',
        target: (quote.c * 1.1).toFixed(2),
        dividend: 2.1,
        roe: 15.8,
      };
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!FINNHUB_API_KEY || FINNHUB_API_KEY === 'YOUR_FINNHUB_API_KEY') {
        setApiLoading(false);
        return;
      }
      setApiLoading(true);
      const symbols = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFC.NS', 'WIPRO.NS', 'AXISBANK.NS'];
      const stocks = await Promise.all(symbols.map(s => fetchStockData(s)));
      setStocksData(stocks.filter(s => s !== null));
      setApiLoading(false);
    };
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Google sign-in failed: ' + err.message);
    }
    setLoading(false);
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {},
        'expired-callback': () => {
          window.recaptchaVerifier = null;
        }
      });
    }
  };

  const handlePhoneSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!phoneNumber.match(/^\+91[6-9]\d{9}$/)) {
      setError('Enter valid phone number with +91');
      return;
    }
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setAuthStep(2);
    } catch (err) {
      setError('Error sending OTP: ' + err.message);
      window.recaptchaVerifier = null;
    }
    setLoading(false);
  };

  const handlePhoneOTPVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Enter valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
    } catch (err) {
      setError('Invalid OTP: ' + err.message);
    }
    setLoading(false);
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password || password !== confirmPassword) {
      setError('Fill all fields correctly');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: fullName,
        email: email,
        createdAt: new Date()
      });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Enter email & password');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const addToWatchlist = async (stock) => {
    if (!user || !watchlist.find(s => s.id === stock.id)) {
      try {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'watchlist'), stock);
        setWatchlist([...watchlist, { id: docRef.id, ...stock }]);
      } catch (err) {
        console.error('Error adding to watchlist:', err);
      }
    }
  };

  const removeFromWatchlist = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'watchlist', id));
      setWatchlist(watchlist.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  const isInWatchlist = (id) => {
    return watchlist.some(s => s.id === id);
  };

  const addAlert = async () => {
    if (selectedForAlert && newAlert.price && user) {
      try {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'alerts'), {
          ...newAlert,
          symbol: selectedForAlert.symbol,
          createdAt: new Date()
        });
        setAlerts([...alerts, { 
          id: docRef.id,
          ...newAlert, 
          symbol: selectedForAlert.symbol 
        }]);
        setNewAlert({ symbol: '', price: '', type: 'above' });
        setShowAlertDialog(false);
        setSelectedForAlert(null);
      } catch (err) {
        console.error('Error adding alert:', err);
      }
    }
  };

  const removeAlert = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'alerts', id));
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error removing alert:', err);
    }
  };

  const getFilteredNews = () => {
    let news = activeNewsTab === 'sector' 
      ? (newsData.sector[selectedSector] || [])
      : (newsData[activeNewsTab] || []);
    if (newsSearchTerm) {
      news = news.filter(article =>
        article.title.toLowerCase().includes(newsSearchTerm.toLowerCase())
      );
    }
    return news;
  };

  const sipReturn = sipAmount * sipYears * 12 * (1 + (0.12 * sipYears / 2));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
                <TrendingUp size={40} className="text-black" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300 mb-3">Money In Control</h1>
            <p className="text-gray-400 text-lg">Indian Stock Market Platform</p>
          </div>

          <div className="relative bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {authMode === 'phone' && authStep === 2 && confirmationResult && (
              <form onSubmit={handlePhoneOTPVerify} className="space-y-5">
                <div className="text-center mb-4">
                  <p className="text-gray-300">OTP sent to</p>
                  <p className="text-white font-semibold">{phoneNumber}</p>
                </div>
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">Enter OTP</label>
                  <input type="text" placeholder="000000" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-3xl tracking-widest font-mono focus:outline-none focus:border-emerald-500/50" maxLength="6" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-xl disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" onClick={() => { setAuthStep(1); setVerificationCode(''); setConfirmationResult(null); }} className="w-full text-gray-400 hover:text-white text-sm">
                  Back
                </button>
              </form>
            )}

            {authMode === 'phone' && authStep === 1 && (
              <form onSubmit={handlePhoneSignup} className="space-y-5">
                <label className="text-white text-sm font-semibold block">Mobile Number</label>
                <input type="tel" placeholder="+91 98765 43210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><Loader size={18} className="animate-spin" />Sending...</> : <>Send OTP <ArrowRight size={18} /></>}
                </button>
                <button type="button" onClick={() => { setAuthMode('login'); setError(''); }} className="w-full text-gray-400 hover:text-white text-sm">Back</button>
              </form>
            )}

            {authMode === 'login' && (
              <div className="space-y-5">
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">Email</label>
                  <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-gray-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" onClick={handleEmailLogin} disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-xl disabled:opacity-50">
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Sign in with Google
                </button>
                <button type="button" onClick={() => { setAuthMode('phone'); setError(''); }} className="w-full text-emerald-400 hover:text-emerald-300 font-semibold py-2">
                  Login with Phone Number
                </button>
                <button type="button" onClick={() => { setAuthMode('signup'); setError(''); }} className="w-full text-emerald-400 hover:text-emerald-300 font-semibold">
                  Don't have account? Sign up
                </button>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="space-y-5">
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">Full Name</label>
                  <input type="text" placeholder="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">Email</label>
                  <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-gray-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">Confirm Password</label>
                  <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <button type="submit" onClick={handleEmailSignup} disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-xl disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Sign Up'}
                </button>
                <button type="button" onClick={() => { setAuthMode('login'); setError(''); }} className="w-full text-gray-400 hover:text-white text-sm">Back to Login</button>
              </div>
            )}
          </div>
        </div>
        <div id="recaptcha-container"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-black/80 border-b border-white/10 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-black" />
            </div>
            <h1 className="text-2xl font-bold">Money In Control</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="text-gray-400">Welcome</p>
              <p className="font-semibold">{user?.name?.substring(0, 20)}</p>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-black/50 border-b border-white/10 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: 'home', label: '🏠 Home' },
              { id: 'stocks', label: '📈 Stocks' },
              { id: 'watchlist', label: '❤️ Watchlist' },
              { id: 'news', label: '📰 News' },
              { id: 'screener', label: '🔍 Screener' },
              { id: 'tools', label: '🧮 Tools' },
              { id: 'alerts', label: '🔔 Alerts' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-semibold whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {indices.map((idx, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="text-gray-400 text-sm font-semibold">{idx.name}</div>
                  <div className="text-3xl font-bold text-white mt-2">{idx.value.toLocaleString()}</div>
                  <div className={`text-sm font-semibold mt-2 ${idx.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {idx.change >= 0 ? '▲' : '▼'} {Math.abs(idx.change).toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Featured Stocks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stocksData.slice(0, 4).map(stock => (
                  <div
                    key={stock.id}
                    onClick={() => { setSelectedStock(stock); setActiveTab('stocks'); }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-white">{stock.symbol}</div>
                        <div className="text-xs text-gray-400">{stock.sector}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">₹{stock.price.toFixed(2)}</div>
                        <div className={`text-sm font-semibold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stock.changePercent >= 0 ? '▲' : '▼'} {stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stocks' && !selectedStock && (
          <div>
            {apiLoading ? (
              <div className="text-center py-12">
                <Loader size={32} className="animate-spin text-emerald-400 mx-auto" />
              </div>
            ) : (
              <div className="space-y-4">
                {stocksData.map(stock => (
                  <div key={stock.id} onClick={() => setSelectedStock(stock)} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 cursor-pointer flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">{stock.symbol}</div>
                      <div className="text-xs text-gray-400">{stock.sector}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">₹{stock.price.toFixed(2)}</div>
                      <div className={`font-semibold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stock.changePercent >= 0 ? '▲' : '▼'} {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stocks' && selectedStock && (
          <div className="space-y-6">
            <button onClick={() => setSelectedStock(null)} className="text-emerald-400 hover:text-emerald-300">← Back</button>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-4xl font-bold text-white">{selectedStock.symbol}</h2>
                  <p className="text-gray-400 mt-2">{selectedStock.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-5xl font-bold text-white">₹{selectedStock.price.toFixed(2)}</div>
                    <div className={`text-2xl font-bold mt-2 ${selectedStock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedStock.changePercent >= 0 ? '▲' : '▼'} {selectedStock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  <button onClick={() => { if (isInWatchlist(selectedStock.id)) { removeFromWatchlist(selectedStock.id); } else { addToWatchlist(selectedStock); } }} className={`p-3 rounded-lg transition ${isInWatchlist(selectedStock.id) ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400 hover:text-emerald-400'}`}>
                    <Heart size={24} fill={isInWatchlist(selectedStock.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => { setSelectedForAlert(selectedStock); setShowAlertDialog(true); }} className="p-3 bg-white/10 rounded-lg text-gray-400 hover:text-emerald-400">
                    <Bell size={24} />
                  </button>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-bold text-white mb-3">About</h4>
                <p className="text-gray-300 text-sm">{selectedStock.about}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div>
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {watchlist.map(stock => (
                  <div key={stock.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <div onClick={() => { setSelectedStock(stock); setActiveTab('stocks'); }} className="cursor-pointer flex-1">
                        <div className="font-bold text-white text-lg">{stock.symbol}</div>
                        <div className="text-sm text-gray-400">{stock.name}</div>
                      </div>
                      <button onClick={() => removeFromWatchlist(stock.id)} className="text-red-400 hover:text-red-300">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-3xl font-bold text-white">₹{stock.price.toFixed(2)}</div>
                      <div className={`flex items-center gap-1 font-bold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stock.changePercent >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-12 text-center">
                <p className="text-gray-300 text-lg">No stocks in watchlist</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-500" />
                  <input type="text" placeholder="Search news..." value={newsSearchTerm} onChange={(e) => setNewsSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <button onClick={fetchAllNews} disabled={newsLoading} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {newsLoading ? <Loader size={18} className="animate-spin" /> : 'Refresh'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
              {[
                { id: 'general', label: '📰 General' },
                { id: 'earnings', label: '💰 Earnings' },
                { id: 'ipo', label: '🚀 IPOs' },
                { id: 'merger', label: '🤝 M&A' },
                { id: 'sector', label: '🏢 Sectors' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveNewsTab(tab.id)}
                  className={`px-6 py-3 font-semibold whitespace-nowrap transition ${
                    activeNewsTab === tab.id
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeNewsTab === 'sector' && (
              <div className="grid grid-cols-5 gap-2">
                {sectors.map(sector => (
                  <button
                    key={sector.name}
                    onClick={() => {
                      setSelectedSector(sector.name);
                      fetchSectorNews(sector.name, sector.keyword);
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold transition ${
                      selectedSector === sector.name
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {sector.name}
                  </button>
                ))}
              </div>
            )}

            {newsLoading ? (
              <div className="text-center py-12">
                <Loader size={32} className="animate-spin text-emerald-400 mx-auto" />
              </div>
            ) : (
              <div className="grid gap-4">
                {getFilteredNews().map(article => (
                  <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition cursor-pointer group">
                    <div className="flex gap-4">
                      {article.image && <img src={article.image} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 line-clamp-2">{article.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                            article.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-300' :
                            article.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {article.sentiment}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex gap-3 text-sm text-gray-400">
                            <span>{article.source}</span>
                            <span>{article.time}</span>
                          </div>
                          <ArrowRight size={18} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'screener' && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Stock Screener</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-white text-sm font-semibold block mb-2">Price Min</label>
                <input type="number" value={screenerFilters.peMin} onChange={(e) => setScreenerFilters({...screenerFilters, peMin: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-white text-sm font-semibold block mb-2">Price Max</label>
                <input type="number" value={screenerFilters.peMax} onChange={(e) => setScreenerFilters({...screenerFilters, peMax: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              {stocksData.filter(s => s.price >= screenerFilters.peMin && s.price <= screenerFilters.peMax).map(stock => (
                <div key={stock.id} className="bg-white/5 rounded-lg p-4 flex justify-between items-center hover:bg-white/10 cursor-pointer" onClick={() => { setSelectedStock(stock); setActiveTab('stocks'); }}>
                  <div>
                    <div className="font-bold text-white">{stock.symbol}</div>
                    <div className="text-xs text-gray-400">{stock.sector}</div>
                  </div>
                  <div className={`font-semibold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stock.changePercent >= 0 ? '▲' : '▼'} {stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">SIP Calculator</h3>
            <div className="space-y-6">
              <div>
                <label className="text-white font-semibold block mb-2">Monthly SIP: ₹{sipAmount}</label>
                <input type="range" min="1000" max="100000" step="1000" value={sipAmount} onChange={(e) => setSipAmount(parseInt(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="text-white font-semibold block mb-2">Duration: {sipYears} years</label>
                <input type="range" min="1" max="30" value={sipYears} onChange={(e) => setSipYears(parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="bg-emerald-600/20 border border-emerald-500/50 rounded-lg p-4">
                <div className="text-emerald-300 text-sm">Expected Returns (12% annual)</div>
                <div className="text-3xl font-bold text-emerald-400 mt-2">₹{(sipReturn).toFixed(0)}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center">
                    <div className="text-white">
                      <span className="font-bold">{alert.symbol}</span> • {alert.type} ₹{alert.price}
                    </div>
                    <button onClick={() => removeAlert(alert.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {alerts.length === 0 && (
              <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-12 text-center">
                <p className="text-gray-300 text-lg">No price alerts set</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showAlertDialog && selectedForAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Set Price Alert</h2>
              <button onClick={() => { setShowAlertDialog(false); setSelectedForAlert(null); }} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <div className="text-emerald-400 font-semibold">Current: ₹{selectedForAlert.price.toFixed(2)}</div>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white text-sm font-semibold block mb-2">Alert Type</label>
                <div className="flex gap-2">
                  <button onClick={() => setNewAlert({...newAlert, type: 'above'})} className={`flex-1 py-2 rounded-lg font-semibold ${newAlert.type === 'above' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                    Above
                  </button>
                  <button onClick={() => setNewAlert({...newAlert, type: 'below'})} className={`flex-1 py-2 rounded-lg font-semibold ${newAlert.type === 'below' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                    Below
                  </button>
                </div>
              </div>
              <div>
                <label className="text-white text-sm font-semibold block mb-2">Price</label>
                <input type="number" placeholder="Enter price" value={newAlert.price} onChange={(e) => setNewAlert({...newAlert, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-center" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addAlert} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-lg">Set Alert</button>
              <button onClick={() => { setShowAlertDialog(false); setSelectedForAlert(null); }} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/20">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceApp;
