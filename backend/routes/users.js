const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/users
// @desc    Get all users
// @access  Private (admin, manager)
router.get('/', authorize('admin', 'manager'), (req, res) => {
  db.all(
    'SELECT id, username, email, full_name, role, department, phone, is_active, created_at FROM users ORDER BY created_at DESC',
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, count: users.length, data: users });
    }
  );
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', (req, res) => {
  db.get(
    'SELECT id, username, email, full_name, role, department, phone, is_active, created_at FROM users WHERE id = ?',
    [req.params.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true, data: user });
    }
  );
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (admin or self)
router.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Check authorization
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Not authorized to update this user' });
  }

  const { email, full_name, department, phone, role, is_active } = req.body;

  let updates = [];
  let values = [];

  if (email) { updates.push('email = ?'); values.push(email); }
  if (full_name) { updates.push('full_name = ?'); values.push(full_name); }
  if (department) { updates.push('department = ?'); values.push(department); }
  if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
  
  // Only admins can change role and active status
  if (req.user.role === 'admin') {
    if (role) { updates.push('role = ?'); values.push(role); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(userId);

  db.run(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating user' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true, message: 'User updated successfully' });
    }
  );
});

// @route   PUT /api/users/:id/password
// @desc    Change user password
// @access  Private (self or admin)
router.put('/:id/password', async (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Check authorization
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Not authorized to change this password' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  // If not admin, verify current password
  if (req.user.role !== 'admin') {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required' });
    }

    db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err || !user) {
        return res.status(500).json({ error: 'Database error' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Update password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error updating password' });
          }
          res.json({ success: true, message: 'Password updated successfully' });
        }
      );
    });
  } else {
    // Admin can change password without current password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error updating password' });
        }
        res.json({ success: true, message: 'Password updated successfully' });
      }
    );
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (admin only)
router.delete('/:id', authorize('admin'), (req, res) => {
  db.run(
    'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting user' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted successfully' });
    }
  );
});

module.exports = router;
