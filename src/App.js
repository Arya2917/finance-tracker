import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Dashboard } from "./components/Dashboard";
import { Auth } from "./components/Auth";
import { ProfileSettings } from "./components/ProfileSettings";
import { SummaryStats } from "./components/SummaryStats";
import { BudgetManager } from "./components/BudgetManager";
import "./App.css";

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

// NavLink component for active state
const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={isActive ? 'active' : ''}
    >
      {children}
    </Link>
  );
};

// Layout component with navigation
const Layout = ({ children }) => {
  const { logout } = useAuth();
  
  return (
    <div>
      <nav className="navbar">
        <div className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/budget">Budget Manager</NavLink>
          <NavLink to="/stats">Summary Stats</NavLink>
          <NavLink to="/profile">Profile Settings</NavLink>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/budget" element={
            <ProtectedRoute>
              <Layout>
                <BudgetManager />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/stats" element={
            <ProtectedRoute>
              <Layout>
                <SummaryStats />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <ProfileSettings />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;