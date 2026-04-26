import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Trash2, Heart, Home, Newspaper, Zap, LogOut, User, Eye, EyeOff, Phone, ArrowRight, AlertCircle, BarChart3, Calculator, Bell, Loader, BookOpen, MessageSquare, LineChart, Share2, X, Filter } from 'lucide-react';
import { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
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
  const [otp, setOtp] = useState('');
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
          name: currentUser.displayName || currentUser.email,
          email: currentUser.email,
          uid: currentUser.uid 
        });
        setIsAuthenticated(true);
        // Load user data from Firestore
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
      // Load watchlist
      const watchlistRef = collection(db, 'users', uid, 'watchlist');
      const watchlistSnapshot = await getDocs(watchlistRef);
      const watchlistData = watchlistSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWatchlist(watchlistData);

      // Load alerts
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

  // ===================== FETCH NEWS FROM FINNHUB =====================
  const fetchFinnhubNews = async (category) => {
    try {
      const url = `${FINNHUB_BASE_URL}/news?category=${category}&minId=0&token=${FINNHUB_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      return data.slice(0, 15).map((article, i) => ({
        id: `finnhub_${category}_${i}`,
        title: article.headline || 'Market Update',
        source: article.source || 'Finnhub',
        time: new Date(article.datetime * 1000).toLocaleDateString(),
        sentiment: analyzeSentiment(article.headline),
        url: article.url,
        image: article.image,
        provider: 'Finnhub'
      }));
    } catch (err) {
      console.error(`Error fetching Finnhub ${category}:`, err);
      return [];
    }
  };

  // ===================== FETCH NEWS FROM NewsAPI =====================
  const fetchNewsAPIArticles = async (query) => {
    try {
      if (!NEWSAPI_KEY || NEWSAPI_KEY === 'YOUR_NEWSAPI_KEY') return [];

      const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&apiKey=${NEWSAPI_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      return data.articles?.slice(0, 15).map((article, i) => ({
        id: `newsapi_${query}_${i}`,
        title: article.title,
        source: article.source?.name || 'News',
        time: new Date(article.publishedAt).toLocaleDateString(),
        sentiment: analyzeSentiment(article.title),
        url: article.url,
        image: article.urlToImage,
        provider: 'NewsAPI'
      })) || [];
    } catch (err) {
      console.error('Error fetching NewsAPI:', err);
      return [];
    }
  };

  // ===================== FETCH ALL NEWS =====================
  const fetchAllNews = async () => {
    setNewsLoading(true);

    try {
      const [gen, earn, ipo, merger, newsGen, newsEarn, newsIpo, newsMerge] = await Promise.all([
        fetchFinnhubNews('general'),
        fetchFinnhubNews('earnings'),
        fetchFinnhubNews('ipo'),
        fetchFinnhubNews('merger'),
        fetchNewsAPIArticles('India stocks market'),
        fetchNewsAPIArticles('India stock earnings results'),
        fetchNewsAPIArticles('India IPO'),
        fetchNewsAPIArticles('India merger acquisition'),
      ]);

      setNewsData({
        general: [...gen, ...newsGen].slice(0, 20),
        earnings: [...earn, ...newsEarn].slice(0, 20),
        ipo: [...ipo, ...newsIpo].slice(0, 20),
        merger: [...merger, ...newsMerge].slice(0, 20),
        sector: {}
      });
    } catch (err) {
      console.error('Error fetching news:', err);
    }

    setNewsLoading(false);
  };

  // ===================== FETCH SECTOR NEWS =====================
  const sectors = [
    { name: 'IT', keyword: 'IT stocks TCS Infosys Wipro' },
    { name: 'Banking', keyword: 'bank stocks HDFC SBI ICICI' },
    { name: 'Pharma', keyword: 'pharma stocks medications' },
    { name: 'Energy', keyword: 'oil energy NTPC Power' },
    { name: 'Telecom', keyword: 'telecom Jio Airtel Vodafone' },
  ];

  const fetchSectorNews = async (sectorName, keyword) => {
    try {
      const [finnNews, apiNews] = await Promise.all([
        fetchFinnhubNews('general'),
        fetchNewsAPIArticles(keyword)
      ]);

      setNewsData(prev => ({
        ...prev,
        sector: {
          ...prev.sector,
          [sectorName]: [...finnNews, ...apiNews].slice(0, 15)
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
  const handlePhoneSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!phoneNumber.match(/^[6-9]\d{9}$/)) {
      setError('Enter valid 10-digit mobile');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setAuthStep(2);
      setLoading(false);
    }, 1000);
  };

  const handlePhoneOTPVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (otp !== '123456') {
      setError('Demo OTP: 123456');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setUser({ name: '+91' + phoneNumber, email: null });
      setIsAuthenticated(true);
      setLoading(false);
    }, 1000);
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
      setUser({ name: fullName, email: email, uid: userCredential.user.uid });
      setIsAuthenticated(true);
      // Create user document in Firestore
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

  // ===================== LOGIN PAGE =====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          .premium-glow { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.4; pointer-events: none; }
          .glow-1 { width: 500px; height: 500px; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); top: -200px; right: -100px; animation: float 20s ease-in-out infinite; }
          .glow-2 { width: 400px; height: 400px; background: linear-gradient(135deg, #0891b2 0%, #10b981 100%); bottom: -150px; left: -50px; animation: float 25s ease-in-out infinite reverse; }
          @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, 30px); } }
          @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .auth-card { animation: slideInUp 0.6s ease-out; }
        `}</style>

        <div className="premium-glow glow-1"></div>
        <div className="premium-glow glow-2"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
                <TrendingUp size={40} className="text-black" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent mb-3">Money In Control</h1>
            <p className="text-gray-400 text-lg">Indian Stock Market Platform</p>
          </div>

          <div className="auth-card relative">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10"></div>
            
            <div className="relative p-8 space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {authMode === 'phone' && authStep === 1 && (
                <form onSubmit={handlePhoneSignup} className="space-y-5">
                  <label className="text-white text-sm font-semibold block">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center">
                      <span className="text-gray-400 text-sm">+91</span>
                    </div>
                    <input type="tel" placeholder="9876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" maxLength="10" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><Loader size={18} className="animate-spin" />Sending...</> : <>Send OTP <ArrowRight size={18} /></>}
                  </button>
                  <button type="button" onClick={() => { setAuthMode('login'); setError(''); }} className="w-full text-gray-400 hover:text-white text-sm">Back</button>
                </form>
              )}

              {authMode === 'phone' && authStep === 2 && (
                <form onSubmit={handlePhoneOTPVerify} className="space-y-5">
                  <label className="text-white text-sm font-semibold block">OTP Code</label>
                  <input type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-3xl tracking-widest font-mono focus:outline-none focus:border-emerald-500/50" maxLength="6" />
                  <p className="text-gray-500 text-xs mt-3 text-center">Demo: <span className="text-emerald-400 font-semibold">123456</span></p>
                  <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-xl disabled:opacity-50">
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
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
        </div>
      </div>
    );
  }

  // ===================== MAIN APP =====================
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Navbar */}
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
              <p className="font-semibold">{user?.name}</p>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-black/50 border-b border-white/10 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: 'home', label: '🏠 Home', icon: Home },
              { id: 'stocks', label: '📈 Stocks', icon: BarChart3 },
              { id: 'watchlist', label: '❤️ Watchlist', icon: Heart },
              { id: 'news', label: '📰 News', icon: Newspaper },
              { id: 'screener', label: '🔍 Screener', icon: Filter },
              { id: 'tools', label: '🧮 Tools', icon: Calculator },
              { id: 'alerts', label: '🔔 Alerts', icon: Bell },
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Home */}
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

            {/* Search */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search stocks, symbols..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Featured Stocks */}
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

        {/* Stocks */}
        {activeTab === 'stocks' && !selectedStock && (
          <div className="space-y-8">
            {apiLoading ? (
              <div className="text-center py-12">
                <Loader size={32} className="animate-spin text-emerald-400 mx-auto" />
              </div>
            ) : (
              <>
                {/* Trending Stocks */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap size={24} className="text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">Trending Stocks</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stocksData
                      .sort((a, b) => b.volume - a.volume)
                      .slice(0, 3)
                      .map(stock => (
                        <div
                          key={stock.id}
                          onClick={() => setSelectedStock(stock)}
                          className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-4 hover:bg-yellow-500/15 cursor-pointer transition"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-white text-lg">{stock.symbol}</div>
                              <div className="text-xs text-gray-400">{stock.sector}</div>
                            </div>
                            <div className="text-yellow-400 text-xs font-semibold">HIGH VOLUME</div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="font-bold text-white">₹{stock.price.toFixed(2)}</div>
                            <div className={`font-semibold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {stock.changePercent >= 0 ? '▲' : '▼'} {stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Top Gainers */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={24} className="text-emerald-400" />
                    <h3 className="text-xl font-bold text-white">Top Gainers</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stocksData
                      .sort((a, b) => b.changePercent - a.changePercent)
                      .slice(0, 3)
                      .map(stock => (
                        <div
                          key={stock.id}
                          onClick={() => setSelectedStock(stock)}
                          className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 hover:bg-emerald-500/15 cursor-pointer transition"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-white text-lg">{stock.symbol}</div>
                              <div className="text-xs text-gray-400">{stock.sector}</div>
                            </div>
                            <div className="text-emerald-400 text-xs font-semibold">GAINERS</div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="font-bold text-white">₹{stock.price.toFixed(2)}</div>
                            <div className="font-semibold text-emerald-400">
                              ▲ {stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Top Losers */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={24} className="text-red-400" />
                    <h3 className="text-xl font-bold text-white">Top Losers</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stocksData
                      .sort((a, b) => a.changePercent - b.changePercent)
                      .slice(0, 3)
                      .map(stock => (
                        <div
                          key={stock.id}
                          onClick={() => setSelectedStock(stock)}
                          className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl p-4 hover:bg-red-500/15 cursor-pointer transition"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-white text-lg">{stock.symbol}</div>
                              <div className="text-xs text-gray-400">{stock.sector}</div>
                            </div>
                            <div className="text-red-400 text-xs font-semibold">LOSERS</div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="font-bold text-white">₹{stock.price.toFixed(2)}</div>
                            <div className="font-semibold text-red-400">
                              ▼ {stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* All Stocks List */}
                <div className="space-y-4 mt-8">
                  <h3 className="text-xl font-bold text-white">All Stocks</h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="space-y-3">
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
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Stock Detail */}
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
                  <button
                    onClick={() => {
                      if (isInWatchlist(selectedStock.id)) {
                        removeFromWatchlist(selectedStock.id);
                      } else {
                        addToWatchlist(selectedStock);
                      }
                    }}
                    className={`p-3 rounded-lg transition ${isInWatchlist(selectedStock.id) ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400 hover:text-emerald-400'}`}
                  >
                    <Heart size={24} fill={isInWatchlist(selectedStock.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => { setSelectedForAlert(selectedStock); setShowAlertDialog(true); }} className="p-3 bg-white/10 rounded-lg text-gray-400 hover:text-emerald-400">
                    <Bell size={24} />
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-lg flex items-center justify-center mb-8 border border-white/10">
                <div className="flex items-end gap-2 h-40">
                  {selectedStock.chartData.map((val, i) => (
                    <div key={i} className="w-12 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t" style={{ height: `${(val / Math.max(...selectedStock.chartData)) * 100}%` }}></div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">High</div>
                  <div className="text-2xl font-bold text-white mt-2">₹{selectedStock.high.toFixed(2)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Low</div>
                  <div className="text-2xl font-bold text-white mt-2">₹{selectedStock.low.toFixed(2)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Volume</div>
                  <div className="text-2xl font-bold text-white mt-2">{(selectedStock.volume / 1000000).toFixed(2)}M</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Market Cap</div>
                  <div className="text-2xl font-bold text-white mt-2">{selectedStock.marketCap}L Cr</div>
                </div>
              </div>

              {/* About */}
              <div className="bg-white/5 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-bold text-white mb-3">About</h4>
                <p className="text-gray-300 text-sm">{selectedStock.about}</p>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist */}
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

        {/* News */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={newsSearchTerm}
                    onChange={(e) => setNewsSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <button
                  onClick={fetchAllNews}
                  disabled={newsLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  {newsLoading ? <Loader size={18} className="animate-spin" /> : 'Refresh'}
                </button>
              </div>
            </div>

            {/* News Category Tabs */}
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

            {/* Sector Filter */}
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

            {/* News List */}
            {newsLoading && activeNewsTab !== 'sector' ? (
              <div className="text-center py-12">
                <Loader size={32} className="animate-spin text-emerald-400 mx-auto" />
                <p className="text-gray-400 mt-4">Loading news...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {getFilteredNews().map(article => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      {article.image && (
                        <img src={article.image} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 line-clamp-2">
                            {article.title}
                          </h3>
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

            {(!newsLoading && getFilteredNews().length === 0) && (
              <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-12 text-center">
                <p className="text-gray-300 text-lg">No news found</p>
              </div>
            )}

            {(!FINNHUB_API_KEY || FINNHUB_API_KEY === 'YOUR_FINNHUB_API_KEY') && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
                <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-semibold">Add API Keys for Full News Coverage</p>
                  <p className="text-yellow-200/70 text-sm mt-1">
                    1. Get Finnhub key from finnhub.io 2. Get NewsAPI key from newsapi.org 3. Replace in .env
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Screener */}
        {activeTab === 'screener' && (
          <div className="space-y-6">
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
          </div>
        )}

        {/* Tools */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-2 gap-6">
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

            <div className="space-y-6">
              {[
                { name: 'Stock Comparator', icon: '⚖️' },
                { name: 'Loan EMI', icon: '📊' },
                { name: 'Compound Interest', icon: '📈' },
              ].map((tool, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10">
                  <div className="text-4xl mb-3">{tool.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{tool.name}</h3>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg">Open</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
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

      {/* Alert Dialog */}
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
                <label className="text-white text-sm font-semibold block mb-2">Price (₹)</label>
                <input
                  type="number"
                  placeholder="Enter price"
                  value={newAlert.price}
                  onChange={(e) => setNewAlert({...newAlert, price: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-center"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={addAlert}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-lg"
              >
                Set Alert
              </button>
              <button
                onClick={() => { setShowAlertDialog(false); setSelectedForAlert(null); }}
                className="flex-1 bg-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceApp;
