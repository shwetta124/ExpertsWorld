const express  = require('express');
const router   = express.Router();
const {
  getExperts, getExpertById, applyAsExpert,
  addReview, setAvailability, getExpertDashboard,
  getPendingExperts, approveExpert, rejectExpert, getAdminStats,
} = require('../controllers/expertController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/',            getExperts);
router.get('/:id',         getExpertById);

// Protected — logged in users
router.post('/apply',              protect, applyAsExpert);
router.post('/:id/reviews',        protect, addReview);
router.put('/availability',        protect, authorize('expert', 'admin'), setAvailability);
router.get('/dashboard/me',        protect, authorize('expert', 'admin'), getExpertDashboard);

// Admin only
router.get('/admin/pending',       protect, authorize('admin'), getPendingExperts);
router.get('/admin/stats',         protect, authorize('admin'), getAdminStats);
router.patch('/admin/:id/approve', protect, authorize('admin'), approveExpert);
router.patch('/admin/:id/reject',  protect, authorize('admin'), rejectExpert);

module.exports = router;