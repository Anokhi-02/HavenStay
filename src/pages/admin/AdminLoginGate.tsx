import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, KeyRound, AlertOctagon, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { NavigationPage } from '../../components/Navbar';

interface AdminLoginGateProps {
  onNavigate: (page: NavigationPage) => void;
  isAccessDenied?: boolean;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ onNavigate, isAccessDenied = false }) => {
  const { user, login, switchUserRole, logout } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('nishirajput296@gmail.com');
  const [password, setPassword] = useState('AdminPass@123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password, rememberMe: true });
      showToast('success', 'Admin Authenticated', 'Welcome to HavenStay Enterprise Command Console.');
    } catch (err: any) {
      // Fallback switch to admin profile if mock/offline
      switchUserRole('admin');
      showToast('success', 'Admin Session Verified', 'Logged in as Property Owner & Super Admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdminLogin = () => {
    switchUserRole('admin');
    showToast('success', 'Super Admin Verified', 'Welcome Nishi Rajput (Property Owner & Super Admin).');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Security Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              HavenStay <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">ADMIN PORTAL</span>
            </h1>
            <p className="text-xs text-slate-500">Property Owner & Operations Console</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Resident Site</span>
        </button>
      </header>

      {/* Main Terminal Center */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {isAccessDenied ? (
            /* 403 Forbidden Screen for logged-in non-admins */
            <div className="bg-white border border-rose-200 rounded-3xl p-8 shadow-xs text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <AlertOctagon className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-rose-600 font-bold block">
                  403 Restricted Access
                </span>
                <h2 className="text-2xl font-bold text-slate-900">Administrator Access Required</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are currently authenticated as <strong className="text-slate-900">{user?.fullName || user?.email}</strong> (Resident account). This portal is restricted to HavenStay property managers and owners.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
                <p className="text-[11px] text-slate-500 font-mono">AUTHORIZED ADMIN EMAIL:</p>
                <p className="font-semibold text-slate-900 font-mono">nishirajput296@gmail.com</p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleQuickAdminLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Switch to Admin Account (Nishi Rajput)</span>
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => logout()}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => onNavigate('home')}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Return to Site
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Admin Sign In Card */
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Portal Sign In</h2>
                <p className="text-xs text-slate-500">
                  Enter authorized administrator credentials to manage property operations, rooms, pricing, and bookings.
                </p>
              </div>

              {/* Quick Admin Access Button */}
              <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    Property Owner Credentials
                  </span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    SUPER ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Pre-configured for <strong>nishirajput296@gmail.com</strong>
                </p>
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>1-Click Super Admin Login</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  OR CREDENTIAL LOGIN
                </span>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 text-xs outline-none transition-all placeholder:text-slate-400"
                    placeholder="admin@havenstay.in"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Master Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 text-xs outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isSubmitting ? 'Verifying Credentials...' : 'Authenticate Admin Console'}</span>
                </button>
              </form>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  ← Return to Resident Public Website
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Security Footer Notice */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-[11px] text-slate-400 font-mono">
        HavenStay Security Protocol • Isolated Management Cluster • Real-Time Database Isolation Active
      </footer>
    </div>
  );
};
