import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SessionManager from './components/SessionManager';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import HackPage from './pages/HackPage';
import CodePage from './pages/CodePage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import { VerifyEmail } from './pages/VerifyEmail';
import AppointmentsPage from './pages/AppointmentsPage';
import SessionsPage from './pages/SessionsPage';
import AptitudeCorner from './components/aptitude/AptitudeCorner';
import Handouts from './components/aptitude/Handouts';
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
  path="sessions" 
  element={

      <SessionsPage />
 
  }
/>

            <Route
              path="/aptitude"
              element={
                <ProtectedRoute>
                  <AptitudeCorner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/handouts"
              element={
                <ProtectedRoute>
                  <Handouts />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/manage-sessions" element={<SessionManager />} />
          <Route path="/manage-mentors" element={<MentorManagementPage />} />
          <Route path="/mentorship" element={<MentorBookingPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
