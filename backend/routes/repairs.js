const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/repairs
// @desc    Get all repair logs
// @access  Private
router.get('/', (req, res) => {
  const { status, device_id, priority } = req.query;
  let query = `
    SELECT r.*, 
           d.device_name, d.serial_number, d.model,
           u.full_name as reported_by_name
    FROM repair_logs r
    JOIN devices d ON r.device_id = d.id
    JOIN users u ON r.reported_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  if (device_id) {
    query += ' AND r.device_id = ?';
    params.push(device_id);
  }

  if (priority) {
    query += ' AND r.priority = ?';
    params.push(priority);
  }

  query += ' ORDER BY r.created_at DESC';

  db.all(query, params, (err, repairs) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, count: repairs.length, data: repairs });
  });
});

// @route   POST /api/repairs
// @desc    Create repair log
// @access  Private
router.post('/', (req, res) => {
  const { device_id, issue_description, priority } = req.body;

  if (!device_id || !issue_description) {
    return res.status(400).json({ error: 'Device ID and issue description are required' });
  }

  db.run(

    `INSERT INTO repair_logs (device_id, reported_by, issue_description, priority)
     VALUES (?, ?, ?, ?)`,
    [device_id, req.user.id, issue_description, priority || 'medium'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating repair log' });
      }

      // Update device status to 'under_repair'
      db.run('UPDATE devices SET status = ? WHERE id = ?', ['under_repair', device_id]);

      res.status(201).json({
        success: true,
        message: 'Repair log created successfully',
        data: { id: this.lastID }
      });
    }
  );
});

// @route   PUT /api/repairs/:id
// @desc    Update repair log
// @access  Private (admin, manager)
router.put('/:id', authorize('admin', 'manager'), (req, res) => {
  const {
    repair_description, repair_cost, repair_date,
    technician_name, status, priority
  } = req.body;

  let updates = [];
  let values = [];

  if (repair_description !== undefined) { updates.push('repair_description = ?'); values.push(repair_description); }
  if (repair_cost !== undefined) { updates.push('repair_cost = ?'); values.push(repair_cost); }
  if (repair_date !== undefined) { updates.push('repair_date = ?'); values.push(repair_date); }
  if (technician_name !== undefined) { updates.push('technician_name = ?'); values.push(technician_name); }
  if (status) { updates.push('status = ?'); values.push(status); }
  if (priority) { updates.push('priority = ?'); values.push(priority); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  db.get('SELECT device_id FROM repair_logs WHERE id = ?', [req.params.id], (err, repair) => {
    if (err || !repair) {
      return res.status(404).json({ error: 'Repair log not found' });
    }

    db.run(`UPDATE repair_logs SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {

      if (err) {
        return res.status(500).json({ error: 'Error updating repair log' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Repair log not found' });
      }

      // If status is completed, update device status
      if (status === 'completed') {
        db.run('UPDATE devices SET status = ? WHERE id = ?', ['available', repair.device_id]);
      }

      res.json({ success: true, message: 'Repair log updated successfully' });
    });
  });
});

module.exports = router;
