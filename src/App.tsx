import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Layout from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { VerifyEmail } from './pages/VerifyEmail';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import AppointmentsPage from './pages/AppointmentsPage';
import SessionsPage from './pages/SessionsPage';
import AptitudeCorner from './components/aptitude/AptitudeCorner';
import Handouts from './components/aptitude/Handouts';
import HackPage from './pages/HackPage';
import CodePage from './pages/CodePage';
import SessionManager from './components/SessionManager';
import MentorManagementPage from './pages/MentorManagementPage';
import MentorBookingPage from './pages/MentorBookingPage';


function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="hack" element={<HackPage />} />
            <Route path="code" element={<CodePage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />

            {/* Protected User Routes */}
            <Route
              path="booking"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="appointments"
              element={
                <ProtectedRoute>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="aptitude"
              element={
                <ProtectedRoute>
                  <AptitudeCorner />
                </ProtectedRoute>
              }
            />
            <Route
              path="handouts"
              element={
                <ProtectedRoute>
                  <Handouts />
                </ProtectedRoute>
              }
            />

            {/* Public Route */}
            <Route path="sessions" element={<SessionsPage />} />
          </Route>

          {/* Admin-only protected routes */}
          <Route
            path="/manage-sessions"
            element={
              <ProtectedRoute requireAdmin>
                <SessionManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-mentors"
            element={
              <ProtectedRoute requireAdmin>
                <MentorManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Public route */}
          <Route path="/mentorship" element={<MentorBookingPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
