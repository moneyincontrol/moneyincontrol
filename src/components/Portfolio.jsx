import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Percent, Calendar } from 'lucide-react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, auth } from './firebase';

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [portfolio, setPortfolio] = useState({
    totalInvested: 0,
    currentValue: 0,
    totalGain: 0,
    gainPercent: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    buyPrice: '',
    currentPrice: '',
    sector: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (auth.currentUser) {
      loadPortfolio(auth.currentUser.uid);
    }
  }, []);

  const loadPortfolio = async (uid) => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(
        collection(db, 'users', uid, 'portfolio')
      );
      const holdings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHoldings(holdings);
      calculatePortfolioMetrics(holdings);
    } catch (err) {
      console.error('Error loading portfolio:', err);
    }
    setLoading(false);
  };

  const calculatePortfolioMetrics = (holdings) => {
    let totalInvested = 0;
    let currentValue = 0;

    holdings.forEach(holding => {
      const invested = holding.quantity * holding.buyPrice;
      const current = holding.quantity * holding.currentPrice;
      totalInvested += invested;
      currentValue += current;
    });

    const totalGain = currentValue - totalInvested;
    const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    setPortfolio({
      totalInvested: totalInvested.toFixed(2),
      currentValue: currentValue.toFixed(2),
      totalGain: totalGain.toFixed(2),
      gainPercent: gainPercent.toFixed(2),
    });
  };

  const addHolding = async (e) => {
    e.preventDefault();
    if (!formData.symbol || !formData.quantity || !formData.buyPrice) return;

    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'portfolio'), {
        ...formData,
        quantity: parseFloat(formData.quantity),
        buyPrice: parseFloat(formData.buyPrice),
        currentPrice: parseFloat(formData.currentPrice),
        createdAt: new Date(),
      });

      setFormData({
        symbol: '',
        quantity: '',
        buyPrice: '',
        currentPrice: '',
        sector: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      loadPortfolio(auth.currentUser.uid);
    } catch (err) {
      console.error('Error adding holding:', err);
    }
  };

  const updateHolding = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'portfolio', id), updates);
      loadPortfolio(auth.currentUser.uid);
    } catch (err) {
      console.error('Error updating holding:', err);
    }
  };

  const removeHolding = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'portfolio', id));
      loadPortfolio(auth.currentUser.uid);
    } catch (err) {
      console.error('Error removing holding:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Invested</p>
              <p className="text-2xl font-bold text-white mt-2">₹{portfolio.totalInvested}</p>
            </div>
            <DollarSign className="text-emerald-400" size={32} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Value</p>
              <p className="text-2xl font-bold text-white mt-2">₹{portfolio.currentValue}</p>
            </div>
            <BarChart3 className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Gain/Loss</p>
              <p className={`text-2xl font-bold mt-2 ${
                parseFloat(portfolio.totalGain) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                ₹{portfolio.totalGain}
              </p>
            </div>
            {parseFloat(portfolio.totalGain) >= 0 ? (
              <TrendingUp className="text-emerald-400" size={32} />
            ) : (
              <TrendingDown className="text-red-400" size={32} />
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Return %</p>
              <p className={`text-2xl font-bold mt-2 ${
                parseFloat(portfolio.gainPercent) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {portfolio.gainPercent}%
              </p>
            </div>
            <Percent className="text-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* Add Holding Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Holdings</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold"
        >
          {showForm ? 'Cancel' : '+ Add Holding'}
        </button>
      </div>

      {/* Add Holding Form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Add New Holding</h3>
          <form onSubmit={addHolding} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-semibold block mb-2">Stock Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                placeholder="E.g., TCS"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold block mb-2">Sector</label>
              <input
                type="text"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="E.g., IT"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold block mb-2">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Number of shares"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold block mb-2">Purchase Price</label>
              <input
                type="number"
                value={formData.buyPrice}
                onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                placeholder="Price per share"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold block mb-2">Current Price</label>
              <input
                type="number"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                placeholder="Current price per share"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold block mb-2">Purchase Date</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <button
              type="submit"
              className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-semibold"
            >
              Add Holding
            </button>
          </form>
        </div>
      )}

      {/* Holdings List */}
      <div className="space-y-3">
        {holdings.map(holding => {
          const invested = holding.quantity * holding.buyPrice;
          const current = holding.quantity * holding.currentPrice;
          const gain = current - invested;
          const gainPercent = ((gain / invested) * 100).toFixed(2);

          return (
            <div key={holding.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{holding.symbol}</h3>
                  <p className="text-sm text-gray-400">{holding.sector}</p>
                </div>
                <button
                  onClick={() => removeHolding(holding.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-semibold"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Quantity</p>
                  <p className="text-white font-semibold">{holding.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-400">Buy Price</p>
                  <p className="text-white font-semibold">₹{holding.buyPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current Price</p>
                  <input
                    type="number"
                    value={holding.currentPrice}
                    onChange={(e) => updateHolding(holding.id, { currentPrice: parseFloat(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gain >= 0 ? 'Gain' : 'Loss'}: {gainPercent}%
                  </p>
                  <p className={`font-bold ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ₹{Math.abs(gain).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-sm">
                <div>
                  <p className="text-gray-400">Invested</p>
                  <p className="text-white font-semibold">₹{invested.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current Value</p>
                  <p className="text-white font-semibold">₹{current.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {holdings.length === 0 && !showForm && (
        <div className="text-center py-12">
          <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No holdings yet. Add your first stock!</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
