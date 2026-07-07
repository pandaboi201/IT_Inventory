import React, { useState, useEffect } from 'react';
import { getRepairs } from '../../services/api';

function RepairList() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepairs();
  }, []);

  const loadRepairs = async () => {
    try {
      const response = await getRepairs();
      setRepairs(response.data.data);
    } catch (error) {
      console.error('Failed to load repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading repairs...</div>;

  return (
    <div>
      <h1>Repair Logs</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Device</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Reported By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((repair) => (
              <tr key={repair.id}>
                <td>{repair.device_name}</td>
                <td>{repair.issue_description.substring(0, 50)}...</td>
                <td>{repair.priority}</td>
                <td>
                  <span className={`status-badge status-${repair.status}`}>
                    {repair.status}
                  </span>
                </td>
                <td>{repair.reported_by_name}</td>
                <td>{new Date(repair.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RepairList;
