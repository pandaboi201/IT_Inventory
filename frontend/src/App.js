import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import DeviceList from './components/Devices/DeviceList';
import DeviceForm from './components/Devices/DeviceForm';
import AssignmentList from './components/Assignments/AssignmentList';
import RepairList from './components/Repairs/RepairList';
import PartsList from './components/Parts/PartsList';
import CCTVList from './components/CCTV/CCTVList';
import UserList from './components/Users/UserList';
import Layout from './components/Layout/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/*"

          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/devices" element={<DeviceList user={user} />} />
                  <Route path="/devices/new" element={<DeviceForm user={user} />} />
                  <Route path="/devices/:id/edit" element={<DeviceForm user={user} />} />
                  <Route path="/assignments" element={<AssignmentList user={user} />} />
                  <Route path="/repairs" element={<RepairList user={user} />} />
                  <Route path="/parts" element={<PartsList user={user} />} />
                  <Route path="/cctv" element={<CCTVList user={user} />} />
                  <Route path="/users" element={<UserList user={user} />} />
                </Routes>
              </Layout>
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
