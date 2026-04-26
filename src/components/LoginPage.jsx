import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  auth,
  googleProvider,
  createUserWithEmailAndPassword
} from '../firebase';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('email'); // 'email' or 'phone'

  // Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          alert('Passwords do not match!');
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (error) {
      alert('Google login failed: ' + error.message);
    }
    setLoading(false);
  };

  // Setup reCAPTCHA
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          window.recaptchaVerifier = null;
        }
      });
    }
  };

  // Phone Number Login - Send OTP
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setShowVerification(true);
      alert('OTP sent to ' + phoneNumber);
    } catch (error) {
      alert('Error sending OTP: ' + error.message);
      window.recaptchaVerifier = null;
    }
    setLoading(false);
  };

  // Phone Number Login - Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      onLoginSuccess();
    } catch (error) {
      alert('Error verifying OTP: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-black to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📈</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Money In Control</h1>
          <p className="text-gray-400">Indian Stock Market Platform</p>
        </div>

        {/* Tab Switcher */}
        {!showVerification && (
          <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('email');
                setIsSignUp(false);
              }}
              className={`flex-1 py-2 rounded font-semibold transition ${
                activeTab === 'email'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => {
                setActiveTab('phone');
                setVerificationCode('');
              }}
              className={`flex-1 py-2 rounded font-semibold transition ${
                activeTab === 'phone'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Phone
            </button>
          </div>
        )}

        {/* Email Login/SignUp Form */}
        {!showVerification && activeTab === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-emerald-500 outline-none"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Login'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-emerald-400 hover:text-emerald-300 text-sm"
              >
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        )}

        {/* Phone Number Form */}
        {!showVerification && activeTab === 'phone' && (
          <form onSubmit={handlePhoneLogin} className="space-y-4 mb-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-emerald-500 outline-none"
                required
              />
              <p className="text-gray-400 text-xs mt-2">Format: +91 followed by 10 digits (with spaces)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Phone OTP Verification */}
        {showVerification && (
          <form onSubmit={handleVerifyOTP} className="space-y-4 mb-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-center mb-4">
              <p className="text-gray-300">Enter OTP sent to</p>
              <p className="text-white font-semibold">{phoneNumber}</p>
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength="6"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-emerald-500 outline-none text-center text-2xl tracking-widest font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowVerification(false);
                setVerificationCode('');
                setConfirmationResult(null);
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded transition"
            >
              Back
            </button>
          </form>
        )}

        {/* Google Login Button */}
        {!showVerification && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-2 rounded transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        )}

        {/* reCAPTCHA Container */}
        <div id="recaptcha-container" className="mt-4"></div>
      </div>
    </div>
  );
}
