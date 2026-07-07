const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/devices
// @desc    Get all devices
// @access  Private
router.get('/', (req, res) => {
  const { status, category_id, search } = req.query;
  let query = `
    SELECT d.*, dc.name as category_name
    FROM devices d
    LEFT JOIN device_categories dc ON d.category_id = dc.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND d.status = ?';
    params.push(status);
  }

  if (category_id) {
    query += ' AND d.category_id = ?';
    params.push(category_id);
  }

  if (search) {
    query += ' AND (d.device_name LIKE ? OR d.serial_number LIKE ? OR d.model LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  query += ' ORDER BY d.created_at DESC';

  db.all(query, params, (err, devices) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, count: devices.length, data: devices });
  });
});

// @route   GET /api/devices/:id
// @desc    Get single device with full details
// @access  Private
router.get('/:id', (req, res) => {
  db.get(
    `SELECT d.*, dc.name as category_name
     FROM devices d
     LEFT JOIN device_categories dc ON d.category_id = dc.id
     WHERE d.id = ?`,
    [req.params.id],
    (err, device) => {

      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
      res.json({ success: true, data: device });
    }
  );
});

// @route   POST /api/devices
// @desc    Create new device
// @access  Private (admin, manager)
router.post('/', authorize('admin', 'manager'), (req, res) => {
  const {
    device_name, category_id, serial_number, model, manufacturer,
    purchase_date, purchase_price, warranty_expiry, status, location,
    specifications, notes
  } = req.body;

  if (!device_name || !serial_number) {
    return res.status(400).json({ error: 'Device name and serial number are required' });
  }

  db.run(
    `INSERT INTO devices (
      device_name, category_id, serial_number, model, manufacturer,
      purchase_date, purchase_price, warranty_expiry, status, location,
      specifications, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [device_name, category_id, serial_number, model, manufacturer,
     purchase_date, purchase_price, warranty_expiry, status || 'available',
     location, specifications, notes],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Serial number already exists' });
        }
        return res.status(500).json({ error: 'Error creating device' });
      }
      res.status(201).json({
        success: true,
        message: 'Device created successfully',
        data: { id: this.lastID }
      });
    }
  );
});

// @route   PUT /api/devices/:id
// @desc    Update device
// @access  Private (admin, manager)
router.put('/:id', authorize('admin', 'manager'), (req, res) => {

  const {
    device_name, category_id, serial_number, model, manufacturer,
    purchase_date, purchase_price, warranty_expiry, status, location,
    specifications, notes
  } = req.body;

  let updates = [];
  let values = [];

  if (device_name) { updates.push('device_name = ?'); values.push(device_name); }
  if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
  if (serial_number) { updates.push('serial_number = ?'); values.push(serial_number); }
  if (model !== undefined) { updates.push('model = ?'); values.push(model); }
  if (manufacturer !== undefined) { updates.push('manufacturer = ?'); values.push(manufacturer); }
  if (purchase_date !== undefined) { updates.push('purchase_date = ?'); values.push(purchase_date); }
  if (purchase_price !== undefined) { updates.push('purchase_price = ?'); values.push(purchase_price); }
  if (warranty_expiry !== undefined) { updates.push('warranty_expiry = ?'); values.push(warranty_expiry); }
  if (status) { updates.push('status = ?'); values.push(status); }
  if (location !== undefined) { updates.push('location = ?'); values.push(location); }
  if (specifications !== undefined) { updates.push('specifications = ?'); values.push(specifications); }
  if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  db.run(
    `UPDATE devices SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating device' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Device not found' });
      }
      res.json({ success: true, message: 'Device updated successfully' });
    }
  );
});

// @route   DELETE /api/devices/:id
// @desc    Delete device
// @access  Private (admin only)
router.delete('/:id', authorize('admin'), (req, res) => {
  db.run('DELETE FROM devices WHERE id = ?', [req.params.id], function(err) {

    if (err) {
      return res.status(500).json({ error: 'Error deleting device' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ success: true, message: 'Device deleted successfully' });
  });
});

// @route   GET /api/devices/categories
// @desc    Get all device categories
// @access  Private
router.get('/categories/all', (req, res) => {
  db.all('SELECT * FROM device_categories ORDER BY name', [], (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, data: categories });
  });
});

module.exports = router;
