const pdfParse = require('pdf-parse');
const User = require('../models/user');

exports.handleFileUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有文件被上传' });
  }

  try {
    let fileContent = '';
    let prompt = '';
    
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      fileContent = pdfData.text;
      // 构建基于PDF内容的prompt
      prompt = `以下是一份PDF文档的内容，请帮我分析和回答相关问题：\n\n${fileContent}\n\n请问您有什么问题？`;
    } else if (req.file.mimetype === 'text/plain') {
      fileContent = req.file.buffer.toString('utf-8');
      prompt = `以下是一份文本文档的内容，请帮我分析和回答相关问题：\n\n${fileContent}\n\n请问您有什么问题？`;
    } else {
      return res.status(400).json({ error: '不支持的文件类型' });
    }

    // 创建新的聊天会话
    const sessionId = await req.user ? 
      await User.createChatSession(req.user.id, `文档分析: ${req.file.originalname}`) : 
      null;

    res.json({ 
      success: true,
      fileName: req.file.originalname,
      fileContent: fileContent,
      prompt: prompt,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Upload/Parse error:', error);
    res.status(500).json({ 
      error: '文件处理失败',
      details: error.message 
    });
  }
}; 