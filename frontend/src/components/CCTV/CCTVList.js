import React, { useState, useEffect } from 'react';
import { getCCTVCameras } from '../../services/api';

function CCTVList() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const response = await getCCTVCameras();
      setCameras(response.data.data);
    } catch (error) {
      console.error('Failed to load CCTV cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading CCTV cameras...</div>;

  return (
    <div>
      <h1>CCTV Cameras</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Camera Name</th>
              <th>Location</th>
              <th>IP Address</th>
              <th>Model</th>
              <th>Status</th>
              <th>Recording</th>
              <th>Installation Date</th>
            </tr>
          </thead>
          <tbody>
            {cameras.map((camera) => (
              <tr key={camera.id}>
                <td>{camera.camera_name}</td>
                <td>{camera.location}</td>
                <td>{camera.ip_address || '-'}</td>
                <td>{camera.model || '-'}</td>
                <td>
                  <span className={`status-badge status-${camera.status}`}>
                    {camera.status}
                  </span>
                </td>
                <td>{camera.recording_enabled ? '🔴 Yes' : '⚪ No'}</td>
                <td>
                  {camera.installation_date 
                    ? new Date(camera.installation_date).toLocaleDateString()
                    : '-'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CCTVList;
