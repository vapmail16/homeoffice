import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Performance from './components/Performance';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  if (location.pathname === '/login') return null;
  
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">
          Home Office
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="nav-links">
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'active' : ''}
            >
              Tasks
            </Link>
            <Link 
              to="/performance" 
              className={location.pathname === '/performance' ? 'active' : ''}
            >
              Performance
            </Link>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>{user.username}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <PrivateRoute>
                <Performance />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
