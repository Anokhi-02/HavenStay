import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar, NavigationPage } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { SinglePGPage } from './pages/SinglePGPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminPage } from './pages/admin/AdminPage';
import { BookingModal } from './components/BookingModal';
import { PG } from './types';
import { api } from './services/api';

function MainApp() {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Global Quick Booking Modal State
  const [quickBookingPG, setQuickBookingPG] = useState<PG | null>(null);
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);

  // Sync unread notification count
  useEffect(() => {
    if (user?.id) {
      api.notifications.getAll(user.id).then((notifs) => {
        setUnreadNotificationsCount(notifs.filter((n) => !n.read).length);
      });
    } else {
      setUnreadNotificationsCount(0);
    }
  }, [user?.id, currentPage]);

  const handleNavigate = (page: NavigationPage) => {
    // Auth guards
    if (
      (page === 'user-dashboard' ||
        page === 'my-bookings' ||
        page === 'favorites' ||
        page === 'profile' ||
        page === 'notifications') &&
      !isAuthenticated
    ) {
      showToast('info', 'Please Sign In', 'Log in to view your Resident / User Dashboard.');
      setCurrentPage('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Direct explore or details back to main property landing
    if (page === 'explore' || page === 'pg-details') {
      setCurrentPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPG = (_pgId: string) => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookNow = async (pgId: string) => {
    const pg = await api.pgs.getById(pgId);
    if (pg) {
      setQuickBookingPG(pg);
      setIsQuickBookingOpen(true);
    }
  };

  // Dedicated Completely Separated Admin Portal Interface
  if (currentPage === 'admin') {
    return <AdminPage onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-rose-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <SinglePGPage
            onNavigate={handleNavigate}
            onBookNow={handleBookNow}
          />
        )}

        {/* Fallback for explore or details routes */}
        {(currentPage === 'explore' || currentPage === 'pg-details') && (
          <SinglePGPage
            onNavigate={handleNavigate}
            onBookNow={handleBookNow}
          />
        )}

        {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {currentPage === 'signup' && <SignupPage onNavigate={handleNavigate} />}
        {currentPage === 'forgot-password' && (
          <ForgotPasswordPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'reset-password' && (
          <ResetPasswordPage onNavigate={handleNavigate} />
        )}

        {/* User Dashboard / Resident Portal Pages */}
        {currentPage === 'user-dashboard' && (
          <UserDashboardPage
            initialTab="overview"
            onNavigate={handleNavigate}
            onSelectPG={handleSelectPG}
            onBookNow={handleBookNow}
          />
        )}

        {currentPage === 'profile' && (
          <UserDashboardPage
            initialTab="profile"
            onNavigate={handleNavigate}
            onSelectPG={handleSelectPG}
            onBookNow={handleBookNow}
          />
        )}

        {currentPage === 'my-bookings' && (
          <UserDashboardPage
            initialTab="my-bookings"
            onNavigate={handleNavigate}
            onSelectPG={handleSelectPG}
            onBookNow={handleBookNow}
          />
        )}

        {currentPage === 'favorites' && (
          <UserDashboardPage
            initialTab="favorites"
            onNavigate={handleNavigate}
            onSelectPG={handleSelectPG}
            onBookNow={handleBookNow}
          />
        )}

        {currentPage === 'notifications' && (
          <UserDashboardPage
            initialTab="notifications"
            onNavigate={handleNavigate}
            onSelectPG={handleSelectPG}
            onBookNow={handleBookNow}
          />
        )}
      </main>

      {/* Global Quick Booking Modal */}
      {quickBookingPG && (
        <BookingModal
          isOpen={isQuickBookingOpen}
          onClose={() => setIsQuickBookingOpen(false)}
          pg={quickBookingPG}
          onBookingSuccess={() => {
            handleNavigate('my-bookings');
          }}
        />
      )}

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
