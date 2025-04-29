import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Admin from './pages/Admin';
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import LiveScores from './pages/LiveScores';
import Standings from './pages/Standings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/live" element={<LiveScores />} />
              <Route path="/standings" element={<Standings />} />
              
              {/* Protected Routes */}
              <Route path="/tournaments" element={
                <ProtectedRoute>
                  <Tournaments />
                </ProtectedRoute>
              } />
              
              <Route path="/tournaments/:id" element={
                <ProtectedRoute>
                  <TournamentDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/players" element={
                <ProtectedRoute>
                  <Players />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;