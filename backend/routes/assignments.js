const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Private
router.get('/', (req, res) => {
  const { status, user_id, device_id } = req.query;
  let query = `
    SELECT da.*, 
           d.device_name, d.serial_number, d.model,
           u.full_name as user_name, u.department,
           ab.full_name as assigned_by_name
    FROM device_assignments da
    JOIN devices d ON da.device_id = d.id
    JOIN users u ON da.user_id = u.id
    JOIN users ab ON da.assigned_by = ab.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND da.status = ?';
    params.push(status);
  }

  if (user_id) {
    query += ' AND da.user_id = ?';
    params.push(user_id);
  }

  if (device_id) {
    query += ' AND da.device_id = ?';
    params.push(device_id);
  }

  query += ' ORDER BY da.assignment_date DESC';

  db.all(query, params, (err, assignments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, count: assignments.length, data: assignments });
  });
});

// @route   POST /api/assignments
// @desc    Create new assignment
// @access  Private (admin, manager)
router.post('/', authorize('admin', 'manager'), (req, res) => {
  const { device_id, user_id, expected_return_date, notes } = req.body;

  if (!device_id || !user_id) {

    return res.status(400).json({ error: 'Device ID and User ID are required' });
  }

  // Check if device is available
  db.get('SELECT status FROM devices WHERE id = ?', [device_id], (err, device) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    if (device.status !== 'available') {
      return res.status(400).json({ error: 'Device is not available for assignment' });
    }

    // Create assignment
    db.run(
      `INSERT INTO device_assignments (device_id, user_id, assigned_by, expected_return_date, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [device_id, user_id, req.user.id, expected_return_date, notes],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating assignment' });
        }

        // Update device status
        db.run('UPDATE devices SET status = ? WHERE id = ?', ['assigned', device_id], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error updating device status' });
          }

          res.status(201).json({
            success: true,
            message: 'Device assigned successfully',
            data: { id: this.lastID }
          });
        });
      }
    );
  });
});

// @route   PUT /api/assignments/:id/return
// @desc    Return a device
// @access  Private (admin, manager)
router.put('/:id/return', authorize('admin', 'manager'), (req, res) => {
  const { notes } = req.body;

  db.get('SELECT * FROM device_assignments WHERE id = ? AND status = ?',
    [req.params.id, 'active'],
    (err, assignment) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!assignment) {

        return res.status(404).json({ error: 'Active assignment not found' });
      }

      const updateNotes = notes ? `${assignment.notes || ''}\n[Return] ${notes}` : assignment.notes;

      db.run(
        `UPDATE device_assignments 
         SET status = 'returned', return_date = CURRENT_TIMESTAMP, notes = ?
         WHERE id = ?`,
        [updateNotes, req.params.id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error returning device' });
          }

          // Update device status to available
          db.run('UPDATE devices SET status = ? WHERE id = ?', 
            ['available', assignment.device_id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Error updating device status' });
              }
              res.json({ success: true, message: 'Device returned successfully' });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
