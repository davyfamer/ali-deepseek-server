const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// 获取所有聊天会话
router.get('/sessions', chatController.getChatSessions);

// 获取单个会话详情
router.get('/sessions/:sessionId', chatController.getSessionDetails);

// 获取特定会话的聊天记录
router.get('/history/:sessionId', chatController.getChatHistory);

// 发送消息
router.post('/', chatController.sendMessage);

module.exports = router; 