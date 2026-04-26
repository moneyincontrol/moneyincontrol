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
  // ===================== AUTH STATE =====================
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

  // ===================== APP STATE =====================
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

  // ===================== NEWS STATE =====================
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
  
  // API Data
  const [stocksData, setStocksData] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [indices, setIndices] = useState([
    { name: 'Nifty 50', value: 24850, change: 1.2 },
    { name: 'Sensex', value: 81920, change: 0.95 },
    { name: 'Bank Nifty', value: 52480, change: 1.8 },
    { name: 'Nifty IT', value: 41200, change: 2.1 },
  ]);

  // ===================== API CONFIG =====================
  const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'YOUR_FINNHUB_API_KEY';
  const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY || 'YOUR_NEWSAPI_KEY';
  const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

  // ===================== AUTH EFFECTS =====================
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

  // ===================== LOAD USER DATA FROM FIRESTORE =====================
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

  // ===================== SENTIMENT ANALYSIS =====================
  const analyzeSentiment = (headline) => {
    const text = (headline || '').toLowerCase();

    const positiveKeywords = [
      'beat', 'surge', 'rally', 'gain', 'rise', 'soar', 'profit', 'strong',
      'record', 'bullish', 'up', 'growth', 'success', 'outperform', 'upgrade',
      'boost', 'optimistic', 'positive', 'excellent', 'momentum', 'dividend'
    ];

    const negativeKeywords = [
      'crash', 'fall', 'plunge', 'loss', 'weak', 'decline', 'bearish', 'down',
      'downgrade', 'sell', 'pessimistic', 'negative', 'concern', 'risk', 'crisis',
      'drop', 'slump', 'miss', 'disappointing', 'worst', 'warning'
    ];

    const positiveCount = positiveKeywords.filter(word => text.includes(word)).length;
    const negativeCount = negativeKeywords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  // ===================== FETCH GENERAL NEWS =====================
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

  // ===================== FETCH EARNINGS NEWS =====================
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

  // ===================== FETCH IPO NEWS =====================
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

  // ===================== FETCH MERGER & ACQUISITION NEWS =====================
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

  // ===================== FETCH SECTOR-SPECIFIC NEWS =====================
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

  // ===================== FETCH ALL NEWS =====================
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

  // ===================== SECTORS FOR NEWS =====================
  const sectors = [
    { name: 'IT', keyword: 'India IT stocks TCS Infosys Wipro' },
    { name: 'Banking', keyword: 'India bank stocks HDFC SBI ICICI banking' },
    { name: 'Pharma', keyword: 'India pharma stocks pharmaceutical drugs medicine' },
    { name: 'Energy', keyword: 'India oil energy NTPC Power coal petroleum' },
    { name: 'Telecom', keyword: 'India telecom Jio Airtel Vodafone communication' },
  ];

  // ===================== FETCH SECTOR NEWS =====================
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

  // Load news on mount
  useEffect(() => {
    if (isAuthenticated && activeTab === 'news') {
      fetchAllNews();
    }
  }, [isAuthenticated, activeTab]);

  // ===================== STOCK HANDLERS =====================
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

  // ===================== AUTH HANDLERS =====================
  
  // Google Sign-In
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

  // Setup reCAPTCHA
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

  // Phone Number - Send OTP
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

  // Phone Number - Verify OTP
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

  // Email Sign-Up
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

  // Email Login
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

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Watchlist handlers
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

  // Alert handlers
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

  // ===================== LOGIN PAGE =====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          .premium-glow {
            position: fixed;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.4;
            pointer-events: none;
          }
          .glow-1 {
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
            top: -200px;
            right: -100px;
            animation: float 20s ease-in-out infinit
