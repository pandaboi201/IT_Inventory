import React, { useState, useEffect } from 'react';
import { getAssignments } from '../../services/api';

function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await getAssignments({ status: 'active' });
      setAssignments(response.data.data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading assignments...</div>;

  return (
    <div>
      <h1>Device Assignments</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Device</th>
              <th>Serial Number</th>
              <th>Assigned To</th>
              <th>Department</th>
              <th>Assignment Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td>{assignment.device_name}</td>
                <td>{assignment.serial_number}</td>
                <td>{assignment.user_name}</td>
                <td>{assignment.department || '-'}</td>
                <td>{new Date(assignment.assignment_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${assignment.status}`}>
                    {assignment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignmentList;
