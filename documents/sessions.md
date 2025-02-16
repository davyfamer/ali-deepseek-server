# 会话管理 API 文档

## 基础信息
- 基础路径: `/api`
- 所有请求需要在 header 中携带 `Authorization: Bearer <token>` 进行认证
- 使用模型: `qwen2.5-coder-32b-instruct`

## 接口列表

### 1. 获取会话列表
获取用户的所有聊天会话。

```http
GET /chat/sessions
```

**响应示例:**
```json
[
  {
    "id": "session_id",
    "title": "会话标题",
    "created_at": "2024-01-01T12:00:00Z",
    "last_message": "最后一条消息内容"
  }
]
```

### 2. 获取会话详情
获取指定会话的详细信息。

```http
GET /chat/sessions/:sessionId
```

**参数:**
- `sessionId`: 会话ID

**响应示例:**
```json
{
  "id": "session_id",
  "title": "会话标题",
  "created_at": "2024-01-01T12:00:00Z",
  "messages": [
    {
      "role": "user",
      "content": "用户消息",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    {
      "role": "assistant",
      "content": "助手回复",
      "timestamp": "2024-01-01T12:00:01Z"
    }
  ]
}
```

### 3. 获取会话历史记录
获取特定会话的聊天记录。

```http
GET /chat/history/:sessionId
```

**参数:**
- `sessionId`: 会话ID

**响应示例:**
```json
[
  {
    "role": "user",
    "content": "用户消息",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  {
    "role": "assistant",
    "content": "助手回复",
    "timestamp": "2024-01-01T12:00:01Z"
  }
]
```

### 4. 发送消息
向会话发送新消息并获取AI回复。

```http
POST /api/chat
```

**请求头：**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "用户的历史消息1"
    },
    {
      "role": "assistant",
      "content": "AI的历史回复1"
    },
    {
      "role": "user",
      "content": "当前用户的新消息"
    }
  ],
  "sessionId": "会话ID（可选）",
  "documentContext": "文档分析上下文（可选）"
}
```

**参数说明：**
- `messages`: 消息数组，包含历史消息和当前新消息
  - `role`: 消息角色，可以是 "user" 或 "assistant"
  - `content`: 消息内容
- `sessionId`: 
  - 如果提供，将在该会话中继续对话
  - 如果不提供，将创建新会话
- `documentContext`: 文档分析场景下的文档内容（可选）

**响应：**
Server-Sent Events (SSE) 格式的流式响应

```text
data: {"content": "AI回复的第一个片段", "sessionId": "123"}
data: {"content": "AI回复的第二个片段", "sessionId": "123"}
data: [DONE]
```

**特性说明：**
1. 会话管理：
   - 无 sessionId 时自动创建新会话
   - 有 sessionId 时自动加载历史记录
   - 自动去重历史消息

2. 文档分析：
   - 提供 documentContext 时，自动添加文档分析相关的系统提示
   - 文档内容会作为上下文保持在对话中

3. 模型特性：
   - 使用通义千问 2.5 Coder 32B 模型
   - 支持代码生成和分析
   - 支持中英双语对话

4. 流式响应：
   - 使用 SSE 实现流式响应
   - 每个数据块包含部分回复内容和会话ID
   - 以 [DONE] 标记结束

**错误响应：**
```json
{
  "error": "错误描述信息"
}
```

**常见状态码：**
- 200: 成功（流式响应）
- 400: 请求参数错误
- 401: 未认证
- 500: 服务器错误

**注意事项：**
1. 客户端需要支持 SSE (Server-Sent Events) 接收流式响应
2. 每条消息都会被保存到数据库
3. 历史记录会自动去重，避免重复消息
4. 建议在发送新消息时包含必要的历史消息以保持上下文
