const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required' });
    }
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself' });
    }
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
    });
    await Notification.create({
      user: receiverId,
      title: 'New Message',
      message: `You have a new message from ${req.user.fullName}`,
      type: 'message',
    });
    const populated = await message.populate('sender', 'fullName profileImage');
    req.app.get('io')?.to(receiverId).emit('receiveMessage', populated.toObject());
    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    }).sort({ createdAt: -1 });

    const conversationMap = new Map();
    messages.forEach((msg) => {
      const otherUserId = msg.sender.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUserId.toString())) {
        conversationMap.set(otherUserId.toString(), {
          userId: otherUserId,
          lastMessage: msg,
          unreadCount: msg.receiver.toString() === req.user._id.toString() && !msg.read ? 1 : 0,
        });
      } else {
        const conv = conversationMap.get(otherUserId.toString());
        if (msg.receiver.toString() === req.user._id.toString() && !msg.read) {
          conv.unreadCount += 1;
        }
      }
    });

    const User = require('../models/User');
    const conversations = [];
    for (const [userId, data] of conversationMap) {
      const user = await User.findById(userId).select('fullName profileImage campus hostel');
      if (user) {
        conversations.push({ ...data, user });
      }
    }

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: userId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};
