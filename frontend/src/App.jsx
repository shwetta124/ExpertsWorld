import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import SignupPage          from './pages/SignupPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import DashboardPage       from './pages/DashboardPage';
import ExpertDetailPage    from './pages/ExpertDetailPage';
import ExpertDashboardPage from './pages/ExpertDashboardPage';
import AdminPanelPage      from './pages/AdminPanelPage';
import BecomeExpertPage    from './pages/BecomeExpertPage';
import SessionHistoryPage  from './pages/SessionHistoryPage';
import ProfilePage         from './pages/ProfilePage';
import ChatPage            from './pages/ChatPage';
import BookingPage         from './pages/BookingPage';
import VideoCallPage       from './pages/VideoCallPage';
import useFirebaseNotifications from './hooks/useFirebaseNotifications';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--brand)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading...</div>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  useFirebaseNotifications();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--brand)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading...</div>
      </div>
    </div>
  );

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/"                element={<LandingPage />} />
      <Route path="/login"           element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup"          element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* User routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/expert/:id" element={
        <ProtectedRoute><ExpertDetailPage /></ProtectedRoute>
      } />
      <Route path="/expert/:id/book" element={
        <ProtectedRoute><BookingPage /></ProtectedRoute>
      } />
      <Route path="/chat/:sessionId" element={
        <ProtectedRoute><ChatPage /></ProtectedRoute>
      } />
      <Route path="/video/:sessionId/:channelName" element={
        <ProtectedRoute><VideoCallPage /></ProtectedRoute>
      } />
      <Route path="/become-expert" element={
        <ProtectedRoute><BecomeExpertPage /></ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute><SessionHistoryPage /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />

      {/* Expert routes */}
      <Route path="/expert-dashboard" element={
        <ProtectedRoute roles={['expert', 'admin']}><ExpertDashboardPage /></ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}><AdminPanelPage /></ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize:   '14px',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    color:      'var(--text)',
                    border:     '1px solid var(--border)',
                  },
                }}
              />
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}