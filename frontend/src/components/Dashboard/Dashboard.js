import React, { useState, useEffect } from 'react';
import { getDashboardStats, getRecentActivity } from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Failed to load dashboard</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Devices</h3>
          <div className="stat-number">{stats.devices?.total || 0}</div>
          <div className="stat-details">
            <span className="stat-label">Available: {stats.devices?.available || 0}</span>
            <span className="stat-label">Assigned: {stats.devices?.assigned || 0}</span>
            <span className="stat-label">Under Repair: {stats.devices?.under_repair || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Repairs</h3>
          <div className="stat-number">{stats.repairs?.total || 0}</div>
          <div className="stat-details">
            <span className="stat-label">Pending: {stats.repairs?.pending || 0}</span>
            <span className="stat-label">In Progress: {stats.repairs?.in_progress || 0}</span>
            <span className="stat-label">Completed: {stats.repairs?.completed || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Parts</h3>
          <div className="stat-number">{stats.parts?.total || 0}</div>
          <div className="stat-details">
            <span className="stat-label stat-warning">Low Stock: {stats.parts?.low_stock || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Assignments</h3>
          <div className="stat-number">{stats.assignments?.total || 0}</div>
          <div className="stat-details">
            <span className="stat-label">Active: {stats.assignments?.active || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>CCTV Cameras</h3>
          <div className="stat-number">{stats.cctv?.total || 0}</div>
          <div className="stat-details">
            <span className="stat-label">Active: {stats.cctv?.active || 0}</span>
            <span className="stat-label">Inactive: {stats.cctv?.inactive || 0}</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <a href="/devices/new" className="btn btn-primary">Add Device</a>
          <a href="/repairs" className="btn btn-secondary">View Repairs</a>
          <a href="/parts?low_stock=true" className="btn btn-secondary">Low Stock Parts</a>
          <a href="/assignments" className="btn btn-secondary">Manage Assignments</a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
