const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, changePassword, getAllUsers, suspendUser, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/suspend', protect, authorize('admin'), suspendUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
