import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { NavigationPage } from '../../components/Navbar';

interface LoginPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, googleLogin, switchUserRole } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Missing Information', 'Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password, rememberMe });
      showToast('success', 'Welcome back!', 'You have successfully signed in.');
      onNavigate('home');
    } catch (err: any) {
      showToast('error', 'Login Failed', err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const [authErrorNotice, setAuthErrorNotice] = useState<string | null>(null);

  const handleGoogle = async () => {
    setIsLoading(true);
    setAuthErrorNotice(null);
    try {
      await googleLogin();
      showToast('success', 'Google Sign-in Successful', 'Welcome to HavenStay!');
      onNavigate('home');
    } catch (err: any) {
      let msg = err.message || 'Google sign-in could not be completed.';
      try {
        if (msg.startsWith('{') && msg.includes('error')) {
          const parsed = JSON.parse(msg);
          msg = parsed.error || msg;
        }
      } catch {}
      if (msg.includes('Unauthorized Domain') || msg.includes('Sign-In is not enabled') || msg.includes('Popup blocked')) {
        setAuthErrorNotice(msg);
      }
      showToast('error', 'Sign-in Notice', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoTenant = () => {
    setEmail('rahul.sharma@example.com');
    setPassword('demo1234');
    switchUserRole('user');
    showToast('info', 'Demo Tenant Credentials Loaded', 'Click "Sign In to HavenStay" or proceed directly.');
  };

  const fillDemoAdmin = () => {
    setEmail('nishirajput296@gmail.com');
    setPassword('admin1234');
    switchUserRole('admin');
    showToast('info', 'Owner/Admin Credentials Loaded', 'Click "Sign In to HavenStay" or open the Admin Portal.');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-sm shadow-blue-500/25">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to manage your stays, favorites, and bookings.
          </p>
        </div>

        {/* Notice for Google Auth setup or domain authorization */}
        {authErrorNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
            <p className="font-bold mb-1 flex items-center gap-1.5 text-blue-800">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              Firebase Google Auth Setup
            </p>
            <p className="text-slate-600 mb-2">{authErrorNotice}</p>
            <p className="text-[11px] text-slate-500">
              You can also click <strong>Admin (Owner)</strong> below to access the full admin dashboard immediately.
            </p>
          </div>
        )}

        {/* Quick 1-Click Demo Fillers */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
            ⚡ Quick Test Sign-In
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoTenant}
              className="py-2 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              Resident User
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="py-2 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700 transition-colors shadow-2xs"
            >
              Admin (Owner)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 accent-blue-600"
              />
              <span className="text-xs text-slate-600">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to HavenStay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-3 bg-white text-xs text-slate-400 uppercase tracking-wider">
            Or Continue With
          </span>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-3 shadow-2xs hover:border-slate-300 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-bold text-blue-600 hover:underline"
          >
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
};
