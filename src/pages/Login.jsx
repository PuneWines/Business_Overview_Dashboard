import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Wine, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(username, password);
      if (result.success) navigate('/dashboard');
      else setError(result.error);
      setLoading(false);
    }, 600);
  };

  const fillDummy = (type) => {
    if (type === 'admin') { setUsername('Admin'); setPassword('Admin123..'); }
    else { setUsername('User'); setPassword('User123....'); }
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100 p-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white border border-sky-200 rounded-2xl shadow-xl shadow-sky-100 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl shadow-lg mb-4">
              <Wine size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-sky-800">Master System</h1>
            <p className="text-sky-400 text-sm mt-1">Pune Wine Management Portal</p>
          </div>

          {/* Quick login */}
          <div className="flex gap-2 mb-6">
            <button type="button" onClick={() => fillDummy('admin')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold py-2 px-3 rounded-lg transition-all">
              <ShieldCheck size={12} /> Admin Login
            </button>
            <button type="button" onClick={() => fillDummy('user')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold py-2 px-3 rounded-lg transition-all">
              <ShieldCheck size={12} /> User Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-sky-700 mb-1.5">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username" required
                className="w-full bg-sky-50 border border-sky-200 text-sky-900 placeholder-sky-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-sky-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password" required
                  className="w-full bg-sky-50 border border-sky-200 text-sky-900 placeholder-sky-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-200 disabled:opacity-70">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="mt-6 border-t border-sky-100 pt-4">
            <p className="text-center text-sky-300 text-xs">
              Admin: <span className="text-sky-500 font-medium">Admin / Admin123..</span>
              &nbsp;|&nbsp;
              User: <span className="text-sky-500 font-medium">User / User123....</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
