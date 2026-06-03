import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Invalid email format';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleEmailBlur = (e) => {
    setEmailError(validateEmail(e.target.value));
  };

  const handlePasswordBlur = (e) => {
    setPasswordError(validatePassword(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const pwdErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(pwdErr);
    if (emailErr || pwdErr) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/users';
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-md w-full p-6 sm:p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Sign in to your dashboard portal</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl text-sm font-semibold mb-5 border border-rose-200/60 flex items-start gap-2.5">
            <svg className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </div>
              <input
                type="email"
                className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400 ${
                  emailError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                }`}
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                onBlur={handleEmailBlur}
                placeholder="you@example.com"
              />
            </div>
            {emailError && <p className="text-rose-600 text-xs font-semibold mt-1.5">{emailError}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400 ${
                  passwordError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                }`}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                onBlur={handlePasswordBlur}
                placeholder="••••••••"
              />
            </div>
            {passwordError && <p className="text-rose-600 text-xs font-semibold mt-1.5">{passwordError}</p>}
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98] mt-2">
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}