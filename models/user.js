const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(username, password, email) {
    console.log('Creating new user:', { username, email });
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await db.execute(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [username, hashedPassword, email]
      );
      console.log('User created with ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('Error in User.create:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    console.log('Finding user by username:', username);
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      console.log('User found:', rows[0] ? 'Yes' : 'No');
      return rows[0];
    } catch (error) {
      console.error('Error in User.findByUsername:', error);
      throw error;
    }
  }

  static async validatePassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  static async createChatSession(userId, firstMessage) {
    try {
      // 开始事务
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // 使用第一条消息的前20个字作为标题
        const title = firstMessage.length > 20 ? 
          firstMessage.substring(0, 20) + '...' : 
          firstMessage;

        // 创建会话
        const [sessionResult] = await connection.execute(
          'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)',
          [userId, title]
        );
        
        const sessionId = sessionResult.insertId;

        await connection.commit();
        connection.release();
        
        return sessionId;
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error in createChatSession:', error);
      throw error;
    }
  }

  static async saveChatMessage(sessionId, userId, message, role) {
    try {
      const [result] = await db.execute(
        'INSERT INTO chat_history (session_id, user_id, message, role) VALUES (?, ?, ?, ?)',
        [sessionId, userId, message, role]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in saveChatMessage:', error);
      throw error;
    }
  }

  static async getChatSessions(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          cs.*, 
          COUNT(ch.id) as message_count,
          MAX(ch.created_at) as last_message_time
         FROM chat_sessions cs
         LEFT JOIN chat_history ch ON cs.id = ch.session_id
         WHERE cs.user_id = ?
         GROUP BY cs.id
         ORDER BY last_message_time DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error in getChatSessions:', error);
      throw error;
    }
  }

  static async getChatHistory(sessionId, userId) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM chat_history 
         WHERE session_id = ? AND user_id = ? 
         ORDER BY created_at ASC`,
        [sessionId, userId]
      );
      return rows;
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      throw error;
    }
  }

  static async getLatestSession(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM chat_sessions 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error in getLatestSession:', error);
      throw error;
    }
  }

  /**
   * 获取会话详情
   * @param {string} sessionId - 会话ID
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} - 会话详情，包含消息历史
   */
  static async getSessionDetails(sessionId, userId) {
    const connection = await db.getConnection();
    try {
      // 首先获取会话基本信息
      const [sessionRows] = await connection.execute(`
        SELECT s.id, s.title, s.created_at
        FROM chat_sessions s
        WHERE s.id = ? AND s.user_id = ?
      `, [sessionId, userId]);
      
      if (sessionRows.length === 0) {
        return null;
      }

      // 获取会话的消息历史
      const [messageRows] = await connection.execute(`
        SELECT 
          role,
          message as content,
          created_at as timestamp
        FROM chat_history
        WHERE session_id = ?
        ORDER BY created_at ASC
      `, [sessionId]);

      // 组合会话信息和消息历史
      return {
        ...sessionRows[0],
        messages: messageRows
      };

    } catch (error) {
      console.error('Database error in getSessionDetails:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = User; 