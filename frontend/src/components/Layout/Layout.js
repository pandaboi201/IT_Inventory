import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children, user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>IT Inventory</h2>
          <div className="user-info">
            <p>{user?.full_name}</p>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        <ul className="nav-menu">
          <li><Link to="/" className={isActive('/')}>📊 Dashboard</Link></li>
          <li><Link to="/devices" className={isActive('/devices')}>💻 Devices</Link></li>
          <li><Link to="/assignments" className={isActive('/assignments')}>📋 Assignments</Link></li>
          <li><Link to="/repairs" className={isActive('/repairs')}>🔧 Repairs</Link></li>
          <li><Link to="/parts" className={isActive('/parts')}>📦 Parts</Link></li>
          <li><Link to="/cctv" className={isActive('/cctv')}>📹 CCTV</Link></li>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <li><Link to="/users" className={isActive('/users')}>👥 Users</Link></li>
          )}
        </ul>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
