const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 增加到50MB
  },
  fileFilter: function (req, file, cb) {
    // 检查文件类型
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型。只支持 PDF 和 TXT 文件。'));
    }
  }
});

// 错误处理中间件
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: '文件太大',
        details: '文件大小不能超过50MB'
      });
    }
  }
  next(err);
};

// 文件上传接口
router.post('/', 
  auth, 
  upload.single('file'),
  handleUploadError,
  uploadController.handleFileUpload
);

module.exports = router; 