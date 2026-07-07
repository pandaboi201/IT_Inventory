const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/parts
// @desc    Get all parts
// @access  Private
router.get('/', (req, res) => {
  const { low_stock, category } = req.query;
  let query = 'SELECT * FROM parts WHERE 1=1';
  const params = [];

  if (low_stock === 'true') {
    query += ' AND quantity <= min_quantity';
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY part_name';

  db.all(query, params, (err, parts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, count: parts.length, data: parts });
  });
});

// @route   POST /api/parts
// @desc    Create new part
// @access  Private (admin, manager)
router.post('/', authorize('admin', 'manager'), (req, res) => {
  const {
    part_name, part_number, category, manufacturer, quantity,
    min_quantity, unit_price, location, description
  } = req.body;

  if (!part_name || !part_number) {
    return res.status(400).json({ error: 'Part name and part number are required' });
  }

  db.run(
    `INSERT INTO parts (part_name, part_number, category, manufacturer, quantity, min_quantity, unit_price, location, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    [part_name, part_number, category, manufacturer, quantity || 0, min_quantity || 10, unit_price, location, description],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Part number already exists' });
        }
        return res.status(500).json({ error: 'Error creating part' });
      }
      res.status(201).json({
        success: true,
        message: 'Part created successfully',
        data: { id: this.lastID }
      });
    }
  );
});

// @route   PUT /api/parts/:id
// @desc    Update part
// @access  Private (admin, manager)
router.put('/:id', authorize('admin', 'manager'), (req, res) => {
  const {
    part_name, category, manufacturer, quantity, min_quantity,
    unit_price, location, description
  } = req.body;

  let updates = [];
  let values = [];

  if (part_name) { updates.push('part_name = ?'); values.push(part_name); }
  if (category !== undefined) { updates.push('category = ?'); values.push(category); }
  if (manufacturer !== undefined) { updates.push('manufacturer = ?'); values.push(manufacturer); }
  if (quantity !== undefined) { updates.push('quantity = ?'); values.push(quantity); }
  if (min_quantity !== undefined) { updates.push('min_quantity = ?'); values.push(min_quantity); }
  if (unit_price !== undefined) { updates.push('unit_price = ?'); values.push(unit_price); }
  if (location !== undefined) { updates.push('location = ?'); values.push(location); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  db.run(`UPDATE parts SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating part' });
    }
    if (this.changes === 0) {

      return res.status(404).json({ error: 'Part not found' });
    }
    res.json({ success: true, message: 'Part updated successfully' });
  });
});

// @route   POST /api/parts/:id/use
// @desc    Record part usage
// @access  Private (admin, manager)
router.post('/:id/use', authorize('admin', 'manager'), (req, res) => {
  const { quantity_used, device_id, repair_id, purpose } = req.body;

  if (!quantity_used || quantity_used <= 0) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  // Check if part has enough quantity
  db.get('SELECT quantity FROM parts WHERE id = ?', [req.params.id], (err, part) => {
    if (err || !part) {
      return res.status(404).json({ error: 'Part not found' });
    }

    if (part.quantity < quantity_used) {
      return res.status(400).json({ error: 'Insufficient part quantity' });
    }

    // Record usage
    db.run(
      `INSERT INTO part_usage_logs (part_id, device_id, repair_id, quantity_used, used_by, purpose)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, device_id, repair_id, quantity_used, req.user.id, purpose],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error recording part usage' });
        }

        // Update part quantity
        db.run(
          'UPDATE parts SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [quantity_used, req.params.id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error updating part quantity' });
            }
            res.status(201).json({
              success: true,
              message: 'Part usage recorded successfully'
            });
          }
        );
      }
    );
  });
});

// @route   GET /api/parts/:id/usage
// @desc    Get part usage history
// @access  Private
router.get('/:id/usage', (req, res) => {

  db.all(
    `SELECT p.*, u.full_name as used_by_name, d.device_name, d.serial_number
     FROM part_usage_logs p
     JOIN users u ON p.used_by = u.id
     LEFT JOIN devices d ON p.device_id = d.id
     WHERE p.part_id = ?
     ORDER BY p.usage_date DESC`,
    [req.params.id],
    (err, usage) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, count: usage.length, data: usage });
    }
  );
});

module.exports = router;
