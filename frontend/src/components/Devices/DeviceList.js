import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDevices, deleteDevice } from '../../services/api';
import './Devices.css';

function DeviceList({ user }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });

  useEffect(() => {
    loadDevices();
  }, [filter]);

  const loadDevices = async () => {
    try {
      const response = await getDevices(filter);
      setDevices(response.data.data);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deleteDevice(id);
        loadDevices();
      } catch (error) {
        alert('Failed to delete device');
      }
    }
  };

  const canModify = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div>
      <div className="page-header">
        <h1>Devices</h1>
        {canModify && (
          <Link to="/devices/new" className="btn btn-primary">Add Device</Link>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search devices..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="search-input"
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="under_repair">Under Repair</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Serial Number</th>
                <th>Model</th>
                <th>Category</th>
                <th>Status</th>
                <th>Location</th>
                {canModify && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id}>
                  <td>{device.device_name}</td>
                  <td>{device.serial_number}</td>
                  <td>{device.model || '-'}</td>
                  <td>{device.category_name || '-'}</td>
                  <td>
                    <span className={`status-badge status-${device.status}`}>
                      {device.status}
                    </span>
                  </td>
                  <td>{device.location || '-'}</td>
                  {canModify && (
                    <td>
                      <Link to={`/devices/${device.id}/edit`} className="btn-link">Edit</Link>
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDelete(device.id)} className="btn-link danger">
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DeviceList;
