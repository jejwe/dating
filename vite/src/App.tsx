import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import DiscoveryScreen from './screens/DiscoveryScreen';
import ProfileViewScreen from './screens/ProfileViewScreen';
import MatchScreen from './screens/MatchScreen';
import MessagesScreen from './screens/MessagesScreen';
import ChatScreen from './screens/ChatScreen';
import MyProfileScreen from './screens/MyProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import MomentsScreen from './screens/MomentsScreen';
import CreateMomentScreen from './screens/CreateMomentScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import SubscriptionConfirmScreen from './screens/SubscriptionConfirmScreen';
import MyLikesScreen from './screens/MyLikesScreen';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 w-full">
          <Routes>
            {/* Public routes - accessible without authentication */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <WelcomeScreen />
                </PublicRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginScreen />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <SignupScreen />
                </PublicRoute>
              } 
            />
            <Route 
              path="/profile-setup" 
              element={
                <PublicRoute>
                  <ProfileSetupScreen />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes - require authentication */}
            <Route 
              path="/discover" 
              element={
                <ProtectedRoute>
                  <DiscoveryScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/discovery" 
              element={
                <ProtectedRoute>
                  <DiscoveryScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/:id" 
              element={
                <ProtectedRoute>
                  <ProfileViewScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/match" 
              element={
                <ProtectedRoute>
                  <MatchScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessagesScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:id" 
              element={
                <ProtectedRoute>
                  <ChatScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-profile" 
              element={
                <ProtectedRoute>
                  <MyProfileScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-likes" 
              element={
                <ProtectedRoute>
                  <MyLikesScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/moments" 
              element={
                <ProtectedRoute>
                  <MomentsScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-moment" 
              element={
                <ProtectedRoute>
                  <CreateMomentScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute>
                  <SubscriptionScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription/confirm" 
              element={
                <ProtectedRoute>
                  <SubscriptionConfirmScreen />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;