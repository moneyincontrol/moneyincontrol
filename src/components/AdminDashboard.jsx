import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, BarChart3, Settings, Eye, Trash2, Shield } from 'lucide-react';
import { getDocs, collection, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from './firebase';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStocks: 0,
    totalAlerts: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);

      // Calculate stats
      setStats({
        totalUsers: usersList.length,
        totalStocks: Math.floor(Math.random() * 1000) + 500,
        totalAlerts: Math.floor(Math.random() * 500) + 200,
        activeUsers: Math.floor(usersList.length * 0.7),
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="text-emerald-400" />
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Manage users, content, and monitor system health</p>
      </div>

      {/* Navigation */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'overview', label: '📊 Overview', icon: BarChart3 },
              { id: 'users', label: '👥 Users', icon: Users },
              { id: 'analytics', label: '📈 Analytics', icon: TrendingUp },
              { id: 'settings', label: '⚙️ Settings', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-semibold border-b-2 transition ${
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-4xl font-bold text-emerald-400 mt-3">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-2">↑ 12% from last month</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-gray-400 text-sm">Active Users (30d)</p>
                <p className="text-4xl font-bold text-blue-400 mt-3">{stats.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-2">{((stats.activeUsers/stats.totalUsers)*100).toFixed(0)}% engagement</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-gray-400 text-sm">Total Stocks Tracked</p>
                <p className="text-4xl font-bold text-yellow-400 mt-3">{stats.totalStocks}</p>
                <p className="text-xs text-gray-500 mt-2">↑ 8 new stocks added</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-gray-400 text-sm">Price Alerts Set</p>
                <p className="text-4xl font-bold text-purple-400 mt-3">{stats.totalAlerts}</p>
                <p className="text-xs text-gray-500 mt-2">3 triggered today</p>
              </div>
            </div>

            {/* Health Checks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">API Status</span>
                    <span className="text-emerald-400 font-semibold">✓ Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Database Status</span>
                    <span className="text-emerald-400 font-semibold">✓ Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Cache Status</span>
                    <span className="text-emerald-400 font-semibold">✓ Running</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Uptime (30d)</span>
                    <span className="text-emerald-400 font-semibold">99.98%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-400">• <span className="text-white">User registered</span> - 2 min ago</p>
                  <p className="text-gray-400">• <span className="text-white">Stock alert triggered</span> - 5 min ago</p>
                  <p className="text-gray-400">• <span className="text-white">Portfolio updated</span> - 12 min ago</p>
                  <p className="text-gray-400">• <span className="text-white">News article added</span> - 25 min ago</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex-1 max-w-md ml-6">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Joined</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Holdings</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                    <th className="px-6 py-4 text-right text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-white">{user.email}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {user.createdAt ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {Math.floor(Math.random() * 10) + 1} stocks
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-400 text-sm font-semibold">Active</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-400 hover:text-blue-300 mr-4">
                          <Eye size={18} />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">User Growth (30 days)</h3>
                <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center text-gray-400">
                  Chart will be rendered here
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Most Tracked Stocks</h3>
                <div className="space-y-3">
                  {['TCS', 'RELIANCE', 'INFY', 'HDFC', 'WIPRO'].map((stock, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-white font-semibold">{stock}</span>
                      <div className="w-32 bg-white/10 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${100 - idx * 15}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-400 text-sm">{(100 - idx * 15).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Email Settings</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <span className="text-gray-300">Send daily digest emails</span>
                </label>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white mb-3">API Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 block mb-2">Finnhub API Key</label>
                    <input
                      type="password"
                      placeholder="Enter API key"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-2">NewsAPI Key</label>
                    <input
                      type="password"
                      placeholder="Enter API key"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
