const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/cctv
// @desc    Get all CCTV cameras
// @access  Private
router.get('/', (req, res) => {
  const { status, location } = req.query;
  let query = 'SELECT * FROM cctv_cameras WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (location) {
    query += ' AND location LIKE ?';
    params.push(`%${location}%`);
  }

  query += ' ORDER BY location, camera_name';

  db.all(query, params, (err, cameras) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, count: cameras.length, data: cameras });
  });
});

// @route   POST /api/cctv
// @desc    Create new CCTV camera
// @access  Private (admin, manager)
router.post('/', authorize('admin', 'manager'), (req, res) => {
  const {
    camera_name, location, ip_address, model, manufacturer,
    installation_date, status, recording_enabled, storage_location, notes
  } = req.body;

  if (!camera_name || !location) {
    return res.status(400).json({ error: 'Camera name and location are required' });
  }

  db.run(
    `INSERT INTO cctv_cameras (camera_name, location, ip_address, model, manufacturer,
     installation_date, status, recording_enabled, storage_location, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [camera_name, location, ip_address, model, manufacturer, installation_date,
     status || 'active', recording_enabled !== undefined ? recording_enabled : 1,

     storage_location, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating CCTV camera' });
      }
      res.status(201).json({
        success: true,
        message: 'CCTV camera created successfully',
        data: { id: this.lastID }
      });
    }
  );
});

// @route   PUT /api/cctv/:id
// @desc    Update CCTV camera
// @access  Private (admin, manager)
router.put('/:id', authorize('admin', 'manager'), (req, res) => {
  const {
    camera_name, location, ip_address, model, manufacturer,
    installation_date, status, recording_enabled, storage_location, notes
  } = req.body;

  let updates = [];
  let values = [];

  if (camera_name) { updates.push('camera_name = ?'); values.push(camera_name); }
  if (location) { updates.push('location = ?'); values.push(location); }
  if (ip_address !== undefined) { updates.push('ip_address = ?'); values.push(ip_address); }
  if (model !== undefined) { updates.push('model = ?'); values.push(model); }
  if (manufacturer !== undefined) { updates.push('manufacturer = ?'); values.push(manufacturer); }
  if (installation_date !== undefined) { updates.push('installation_date = ?'); values.push(installation_date); }
  if (status) { updates.push('status = ?'); values.push(status); }
  if (recording_enabled !== undefined) { updates.push('recording_enabled = ?'); values.push(recording_enabled ? 1 : 0); }
  if (storage_location !== undefined) { updates.push('storage_location = ?'); values.push(storage_location); }
  if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  db.run(`UPDATE cctv_cameras SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating CCTV camera' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'CCTV camera not found' });
    }
    res.json({ success: true, message: 'CCTV camera updated successfully' });
  });
});

// @route   GET /api/cctv/:id/maintenance

// @desc    Get maintenance logs for a camera
// @access  Private
router.get('/:id/maintenance', (req, res) => {
  db.all(
    `SELECT m.*, u.full_name as performed_by_name, c.camera_name
     FROM cctv_maintenance m
     JOIN users u ON m.performed_by = u.id
     JOIN cctv_cameras c ON m.camera_id = c.id
     WHERE m.camera_id = ?
     ORDER BY m.maintenance_date DESC`,
    [req.params.id],
    (err, logs) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, count: logs.length, data: logs });
    }
  );
});

// @route   POST /api/cctv/:id/maintenance
// @desc    Create maintenance log
// @access  Private (admin, manager)
router.post('/:id/maintenance', authorize('admin', 'manager'), (req, res) => {
  const {
    maintenance_type, description, maintenance_date, cost,
    next_maintenance_date, status, notes
  } = req.body;

  if (!maintenance_type || !description || !maintenance_date) {
    return res.status(400).json({
      error: 'Maintenance type, description, and date are required'
    });
  }

  db.run(
    `INSERT INTO cctv_maintenance (camera_id, maintenance_type, description, maintenance_date,
     performed_by, cost, next_maintenance_date, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.params.id, maintenance_type, description, maintenance_date, req.user.id,
     cost, next_maintenance_date, status || 'completed', notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating maintenance log' });
      }
      res.status(201).json({
        success: true,
        message: 'Maintenance log created successfully',
        data: { id: this.lastID }
      });
    }
  );
});

module.exports = router;
