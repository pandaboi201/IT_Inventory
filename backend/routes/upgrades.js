const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/upgrades
// @desc    Get all upgrade logs
// @access  Private
router.get('/', (req, res) => {
  const { device_id } = req.query;
  let query = `
    SELECT u.*, 
           d.device_name, d.serial_number, d.model,
           p.full_name as performed_by_name
    FROM upgrade_logs u
    JOIN devices d ON u.device_id = d.id
    JOIN users p ON u.performed_by = p.id
    WHERE 1=1
  `;
  const params = [];

  if (device_id) {
    query += ' AND u.device_id = ?';
    params.push(device_id);
  }

  query += ' ORDER BY u.upgrade_date DESC';

  db.all(query, params, (err, upgrades) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, count: upgrades.length, data: upgrades });
  });
});

// @route   POST /api/upgrades
// @desc    Create upgrade log
// @access  Private (admin, manager)
router.post('/', authorize('admin', 'manager'), (req, res) => {
  const { device_id, upgrade_type, description, upgrade_date, cost, notes } = req.body;

  if (!device_id || !upgrade_type || !description || !upgrade_date) {
    return res.status(400).json({ 
      error: 'Device ID, upgrade type, description, and date are required' 
    });
  }

  db.run(
    `INSERT INTO upgrade_logs (device_id, upgrade_type, description, upgrade_date, performed_by, cost, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,

    [device_id, upgrade_type, description, upgrade_date, req.user.id, cost, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating upgrade log' });
      }
      res.status(201).json({
        success: true,
        message: 'Upgrade log created successfully',
        data: { id: this.lastID }
      });
    }
  );
});

module.exports = router;
