import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Target, AlertCircle } from 'lucide-react';
import { getDocs, collection } from 'firebase/firestore';
import { db, auth } from './firebase';

const Analytics = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [sectorBreakdown, setSectorBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1M');

  useEffect(() => {
    if (auth.currentUser) {
      loadAnalytics(auth.currentUser.uid);
    }
  }, []);

  const loadAnalytics = async (uid) => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(
        collection(db, 'users', uid, 'portfolio')
      );
      const holdings = querySnapshot.docs.map(doc => doc.data());

      // Generate mock performance data
      const mockData = generatePerformanceData(holdings);
      setPerformanceData(mockData);

      // Calculate sector breakdown
      const breakdown = calculateSectorBreakdown(holdings);
      setSectorBreakdown(breakdown);

      // Calculate portfolio stats
      const stats = calculatePortfolioStats(holdings);
      setPortfolio(stats);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
    setLoading(false);
  };

  const generatePerformanceData = (holdings) => {
    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    return days.map((day, idx) => ({
      name: day,
      value: 100000 + Math.random() * 5000 - 2500,
      change: Math.random() * 2 - 1,
    }));
  };

  const calculateSectorBreakdown = (holdings) => {
    const breakdown = {};
    holdings.forEach(holding => {
      const sector = holding.sector || 'Other';
      const value = holding.quantity * holding.currentPrice;
      breakdown[sector] = (breakdown[sector] || 0) + value;
    });

    return Object.entries(breakdown).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  };

  const calculatePortfolioStats = (holdings) => {
    let totalValue = 0;
    let bestPerformer = null;
    let worstPerformer = null;
    let maxReturn = -Infinity;
    let minReturn = Infinity;

    holdings.forEach(holding => {
      const current = holding.quantity * holding.currentPrice;
      const invested = holding.quantity * holding.buyPrice;
      const returnPercent = ((current - invested) / invested) * 100;

      totalValue += current;

      if (returnPercent > maxReturn) {
        maxReturn = returnPercent;
        bestPerformer = holding.symbol;
      }
      if (returnPercent < minReturn) {
        minReturn = returnPercent;
        worstPerformer = holding.symbol;
      }
    });

    return {
      totalValue: totalValue.toFixed(2),
      bestPerformer,
      worstPerformer,
      holdingCount: holdings.length,
      averageReturn: ((maxReturn + minReturn) / 2).toFixed(2),
    };
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Portfolio Value</p>
          <p className="text-3xl font-bold text-white mt-2">₹{portfolio?.totalValue}</p>
          <p className="text-xs text-emerald-400 mt-2">↑ 2.5% this month</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Holdings</p>
          <p className="text-3xl font-bold text-white mt-2">{portfolio?.holdingCount}</p>
          <p className="text-xs text-gray-400 mt-2">Stocks in portfolio</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Best Performer</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{portfolio?.bestPerformer}</p>
          <p className="text-xs text-gray-400 mt-2">+15.2% return</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Worst Performer</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{portfolio?.worstPerformer}</p>
          <p className="text-xs text-gray-400 mt-2">-8.5% return</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Portfolio Performance</h3>
          <div className="flex gap-2">
            {['1W', '1M', '3M', '6M', '1Y'].map(period => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                  timeframe === period
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sector Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Sector Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Analysis */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Risk Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400">Portfolio Volatility</p>
                <span className="text-yellow-400 font-semibold">Medium</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full w-2/3"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400">Beta Coefficient</p>
                <span className="text-white font-semibold">1.24</span>
              </div>
              <p className="text-xs text-gray-500">Higher volatility than market</p>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mt-6">
              <div className="flex gap-3">
                <AlertCircle className="text-blue-400 flex-shrink-0" size={20} />
                <div>
                  <p className="text-blue-300 font-semibold">Diversification Tip</p>
                  <p className="text-blue-200/70 text-sm mt-1">
                    Consider increasing exposure to defensive sectors like utilities and consumer staples.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Sharpe Ratio</p>
            <p className="text-2xl font-bold text-white mt-2">1.85</p>
            <p className="text-xs text-emerald-400 mt-1">Good risk-adjusted return</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Sortino Ratio</p>
            <p className="text-2xl font-bold text-white mt-2">2.12</p>
            <p className="text-xs text-emerald-400 mt-1">Strong downside protection</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Max Drawdown</p>
            <p className="text-2xl font-bold text-red-400 mt-2">-8.5%</p>
            <p className="text-xs text-gray-400 mt-1">Worst peak-to-trough</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Win Rate</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">68%</p>
            <p className="text-xs text-gray-400 mt-1">Profitable months</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
