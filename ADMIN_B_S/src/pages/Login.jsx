import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    const userStr = queryParams.get('user');
    if (token && userStr) {
      try {
        const userObj = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_profile', JSON.stringify({
          id: userObj.id,
          full_name: userObj.name || userObj.fullName || 'Admin User',
          phone: userObj.phone,
          email: userObj.email,
          role: userObj.role,
          account_status: userObj.status || 'active'
        }));
        // Clean URL and redirect to dashboard
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Error parsing autologin credentials:', err);
      }
    }
  }, [navigate]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d1f] relative overflow-hidden font-sans">
      {/* Visual background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4f6bff]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md p-8 bg-[#0c122c]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-2xl relative z-10 transition-all duration-300">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4f6bff] to-[#3b4ecc] flex items-center justify-center shadow-lg shadow-[#4f6bff]/20 mb-4 animate-pulse">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back Admin</h2>
          <p className="text-sm text-gray-400 mt-1.5">Sign in to manage the Customer marketplace</p>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#070b1e]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#4f6bff] focus:ring-1 focus:ring-[#4f6bff] transition-all text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#070b1e]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#4f6bff] focus:ring-1 focus:ring-[#4f6bff] transition-all text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#4f6bff] hover:bg-[#3b4ecc] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#4f6bff]/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-gray-500">
          Marketplace Administration Portal &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Login;
