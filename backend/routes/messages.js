const express = require('express');
const router = express.Router();
const { sendMessage, getConversations, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);

module.exports = router;
