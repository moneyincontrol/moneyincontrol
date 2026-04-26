import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from './firebase-config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ===================== SCREENS =====================

// LOGIN SCREEN
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', result.user.uid), {
        email: email,
        createdAt: new Date(),
      });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView contentContainerStyle={styles.loginContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="chart-line" size={50} color="#10b981" />
          <Text style={styles.title}>Money In Control</Text>
          <Text style={styles.subtitle}>Stock Market on Your Phone</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isSignup ? handleSignup : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignup ? 'Sign Up' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
            <Text style={styles.toggleText}>
              {isSignup
                ? 'Already have account? Login'
                : "Don't have account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// HOME SCREEN
function HomeScreen() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API call
      const mockStocks = [
        { id: 1, symbol: 'RELIANCE', price: 2850, change: 1.2, sector: 'Energy' },
        { id: 2, symbol: 'TCS', price: 3280, change: 2.1, sector: 'IT' },
        { id: 3, symbol: 'INFY', price: 1680, change: -0.5, sector: 'IT' },
        { id: 4, symbol: 'HDFC', price: 2450, change: 0.8, sector: 'Banking' },
      ];
      setStocks(mockStocks);
    } catch (err) {
      Alert.alert('Error', 'Failed to load stocks');
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStocks();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Market Overview</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
      ) : (
        <View style={styles.stockList}>
          {stocks.map((stock) => (
            <View key={stock.id} style={styles.stockCard}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockSector}>{stock.sector}</Text>
              </View>
              <View style={styles.stockPrice}>
                <Text style={styles.stockValue}>₹{stock.price}</Text>
                <Text
                  style={[
                    styles.stockChange,
                    { color: stock.change >= 0 ? '#10b981' : '#ef4444' },
                  ]}
                >
                  {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// WATCHLIST SCREEN
function WatchlistScreen() {
  const [watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadWatchlist(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  const loadWatchlist = async (uid) => {
    try {
      const querySnapshot = await getDocs(
        collection(db, 'users', uid, 'watchlist')
      );
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWatchlist(items);
    } catch (err) {
      console.error('Error loading watchlist:', err);
    }
    setLoading(false);
  };

  const removeFromWatchlist = async (stockId) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'watchlist', stockId));
      setWatchlist(watchlist.filter((s) => s.id !== stockId));
      Alert.alert('Success', 'Removed from watchlist');
    } catch (err) {
      Alert.alert('Error', 'Failed to remove stock');
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>My Watchlist</Text>

      {watchlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={50} color="#888" />
          <Text style={styles.emptyText}>No stocks in watchlist</Text>
        </View>
      ) : (
        <View style={styles.stockList}>
          {watchlist.map((stock) => (
            <View key={stock.id} style={styles.watchlistCard}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockSector}>{stock.sector}</Text>
              </View>
              <View style={styles.stockPrice}>
                <Text style={styles.stockValue}>₹{stock.price}</Text>
                <Text
                  style={[
                    styles.stockChange,
                    { color: stock.changePercent >= 0 ? '#10b981' : '#ef4444' },
                  ]}
                >
                  {stock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent)}%
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeFromWatchlist(stock.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ALERTS SCREEN
function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadAlerts(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  const loadAlerts = async (uid) => {
    try {
      const querySnapshot = await getDocs(
        collection(db, 'users', uid, 'alerts')
      );
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlerts(items);
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
    setLoading(false);
  };

  const removeAlert = async (alertId) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'alerts', alertId));
      setAlerts(alerts.filter((a) => a.id !== alertId));
      Alert.alert('Success', 'Alert removed');
    } catch (err) {
      Alert.alert('Error', 'Failed to remove alert');
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Price Alerts</Text>

      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={50} color="#888" />
          <Text style={styles.emptyText}>No price alerts set</Text>
        </View>
      ) : (
        <View style={styles.alertList}>
          {alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertInfo}>
                <Text style={styles.alertSymbol}>{alert.symbol}</Text>
                <Text style={styles.alertCondition}>
                  Alert when price {alert.type} ₹{alert.price}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeAlert(alert.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// PROFILE SCREEN
function ProfileScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'Logged out successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle" size={80} color="#10b981" />
        <Text style={styles.profileName}>{user?.email}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.profileOption}>
          <Text style={styles.profileOptionText}>Account Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileOption}>
          <Text style={styles.profileOptionText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileOption}>
          <Text style={styles.profileOptionText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// ===================== MAIN APP =====================

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: 'home',
            Watchlist: 'heart',
            Alerts: 'notifications',
            Profile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppStack() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="MainApp" component={AppTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}

// ===================== STYLES =====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loginContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  formContainer: {
    marginTop: 30,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#10b981',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  screen: {
    flex: 1,
    backgroundColor: '#000',
    padding: 15,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 10,
  },
  loader: {
    marginTop: 50,
  },
  stockList: {
    marginBottom: 20,
  },
  stockCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#333',
    borderWidth: 1,
  },
  watchlistCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#333',
    borderWidth: 1,
  },
  alertCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#333',
    borderWidth: 1,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  stockSector: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  stockPrice: {
    alignItems: 'flex-end',
    marginRight: 15,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  stockChange: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
  },
  alertInfo: {
    flex: 1,
  },
  alertSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  alertCondition: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  alertList: {
    marginBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  profileSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 15,
  },
  profileOption: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#333',
    borderWidth: 1,
  },
  profileOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
  },
  tabBar: {
    backgroundColor: '#1a1a1a',
    borderTopColor: '#333',
    borderTopWidth: 1,
    paddingBottom: 5,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 5,
  },
});
