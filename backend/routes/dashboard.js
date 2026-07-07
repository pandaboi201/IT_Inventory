const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', (req, res) => {
  const stats = {};

  // Get device statistics
  db.get(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
      SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
      SUM(CASE WHEN status = 'under_repair' THEN 1 ELSE 0 END) as under_repair,
      SUM(CASE WHEN status = 'retired' THEN 1 ELSE 0 END) as retired
     FROM devices`,
    [],
    (err, deviceStats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      stats.devices = deviceStats;

      // Get repair statistics
      db.get(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
         FROM repair_logs`,
        [],
        (err, repairStats) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          stats.repairs = repairStats;

          // Get parts statistics
          db.get(
            `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN quantity <= min_quantity THEN 1 ELSE 0 END) as low_stock
             FROM parts`,
            [],
            (err, partStats) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }
              stats.parts = partStats;

              // Get assignment statistics
              db.get(
                `SELECT 
                  COUNT(*) as total,
                  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
                 FROM device_assignments`,
                [],

                (err, assignmentStats) => {
                  if (err) {
                    return res.status(500).json({ error: 'Database error' });
                  }
                  stats.assignments = assignmentStats;

                  // Get CCTV statistics
                  db.get(
                    `SELECT 
                      COUNT(*) as total,
                      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                      SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
                     FROM cctv_cameras`,
                    [],
                    (err, cctvStats) => {
                      if (err) {
                        return res.status(500).json({ error: 'Database error' });
                      }
                      stats.cctv = cctvStats;

                      res.json({ success: true, data: stats });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent activity across all modules
// @access  Private
router.get('/recent-activity', (req, res) => {
  const limit = req.query.limit || 10;
  const activities = [];

  // Get recent device additions
  db.all(
    `SELECT 'device_added' as type, id, device_name as title, created_at as timestamp
     FROM devices ORDER BY created_at DESC LIMIT ?`,
    [limit],
    (err, deviceActivities) => {
      if (!err && deviceActivities) {
        activities.push(...deviceActivities);
      }

      // Get recent assignments
      db.all(
        `SELECT 'device_assigned' as type, da.id, d.device_name as title, da.assignment_date as timestamp
         FROM device_assignments da
         JOIN devices d ON da.device_id = d.id
         ORDER BY da.assignment_date DESC LIMIT ?`,
        [limit],
        (err, assignmentActivities) => {
          if (!err && assignmentActivities) {
            activities.push(...assignmentActivities);
          }

          // Sort all activities by timestamp

          activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          res.json({
            success: true,
            count: Math.min(activities.length, limit),
            data: activities.slice(0, limit)
          });
        }
      );
    }
  );
});

module.exports = router;
