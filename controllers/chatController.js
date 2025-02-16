const User = require('../models/user');
const client = require('../config/openai');

exports.getChatSessions = async (req, res) => {
  try {
    const sessions = await User.getChatSessions(req.user.id);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat sessions' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const history = await User.getChatHistory(req.params.sessionId, req.user.id);

    console.log('history', history);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
};

exports.sendMessage = async (req, res) => {
  const { messages, sessionId, documentContext } = req.body;
  const userId = req.user.id;
  
  try {
    let currentSessionId = sessionId;
    const userMessage = messages[messages.length - 1];

    try {
      if (!currentSessionId) {
        currentSessionId = await User.createChatSession(userId, userMessage.content);
        console.log('Created new session:', currentSessionId);
      }

      // 如果有sessionId，获取历史记录
      let allMessages = [];
      if (currentSessionId) {
        const historyMessages = await User.getChatHistory(currentSessionId, userId);
        
        // 转换历史记录格式
        const formattedHistory = historyMessages.map(msg => ({
          role: msg.role,
          content: msg.message
        }));

        // 合并历史记录和当前消息，并去重
        const messageSet = new Set();
        allMessages = [...formattedHistory, ...messages].filter(msg => {
          const key = `${msg.role}:${msg.content}`;
          if (messageSet.has(key)) {
            return false;
          }
          messageSet.add(key);
          return true;
        });
      } else {
        allMessages = messages;
      }

      // 如果存在文档上下文，将其添加到消息历史中
      let contextualizedMessages = allMessages;
      if (documentContext) {
        contextualizedMessages = [
          {
            role: 'system',
            content: '你是一个专业的文档分析助手，请基于提供的文档内容来回答用户的问题。'
          },
          {
            role: 'user',
            content: documentContext
          },
          ...allMessages
        ];
      }

      await User.saveChatMessage(currentSessionId, userId, userMessage.content, 'user');

      // 打印发送到远程API的消息
      console.log('Sending to API:', JSON.stringify({
        model: process.env.MODEL_NAME || "deepseek-v3",
        messages: contextualizedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }, null, 2));

      const stream = await client.chat.completions.create({
        model: process.env.MODEL_NAME || "deepseek-v3",
        messages: contextualizedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: true
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let assistantResponse = '';

      for await (const chunk of stream) {
        const answerChunk = chunk.choices[0]?.delta?.content || "";
        if (answerChunk) {
          assistantResponse += answerChunk;
          res.write(`data: ${JSON.stringify({ 
            content: answerChunk,
            sessionId: currentSessionId 
          })}\n\n`);
        }
      }

      await User.saveChatMessage(currentSessionId, userId, assistantResponse, 'assistant');
      console.log('Saved assistant message to session:', currentSessionId);
      
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      throw new Error('Failed to save chat message');
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSessionDetails = async (req, res) => {
  try {
    const session = await User.getSessionDetails(req.params.sessionId, req.user.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ error: 'Error fetching session details' });
  }
}; 