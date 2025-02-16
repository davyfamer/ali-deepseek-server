const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  }
});

// 文件上传接口，添加认证中间件
router.post('/', auth, upload.single('file'), uploadController.handleFileUpload);

module.exports = router; 