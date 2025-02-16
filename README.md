# AI Chat Server

基于 Node.js 的 AI 聊天服务器，支持通义千问模型。

## 环境要求

- Node.js >= 14
- MySQL >= 5.7
- npm >= 6

##第一步：申请阿里通义千问的api-key
进入：https://www.aliyun.com/product/tongyi 参考 https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key?spm=5176.21213303.J_v8LsmxMG6alneH-O7TCPa.1.56072f3d5fS2p2&scm=20140722.S_help@@%E6%96%87%E6%A1%A3@@2712195._.ID_help@@%E6%96%87%E6%A1%A3@@2712195-RL_%E5%A6%82%E4%BD%95%E7%94%B3%E8%AF%B7%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE%E5%A4%A7%E6%A8%A1%E5%9E%8B%E7%9A%84apikey-LOC_2024SPAllResult-OR_ser-PAR1_213e35f917396988668076738e1e5f-V_4-RE_new3-P0_0-P1_0 完成通义大模api-key的申请

##第二步：添加数据库
用 db/init.sql建表，建库

##第三步：安装并启动server
## 安装步骤

1. 克隆项目并安装依赖
```bash
git clone <repository-url>
cd tongyi-chat-server
npm install
```

2. 配置环境变量
复制 `.env.example` 到 `.env` 并填写配置：
```bash
cp .env.example .env
```

必需的环境变量：
```env
PORT=3008
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=alibabaAI
JWT_SECRET=your_jwt_secret_key

# AI Model Config
MODEL_NAME=qwen2.5-coder-32b-instruct
DASHSCOPE_API_KEY=your_api_key
```

## 运行服务器

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm start
```

## 项目结构

```
├── config/             # 配置文件
│   ├── database.js    # 数据库配置
│   └── openai.js      # AI 客户端配置
├── controllers/        # 控制器
├── models/            # 数据模型
├── routes/            # 路由
├── db/                # 数据库脚本
│   └── init.sql       # 初始化SQL
└── .env               # 环境变量
```

## API 文档

详细的 API 文档请参考 `documents/sessions.md`。

## 开发命令

- `npm run dev`: 启动开发服务器（支持热重载）
- `npm start`: 启动生产服务器
- `npm test`: 运行测试（如果有）

## 注意事项

1. 确保 MySQL 服务已启动
2. 检查 .env 文件中的配置是否正确
3. 确保已设置正确的 DASHSCOPE_API_KEY
4. 数据库表结构变更需要手动执行相应的 SQL 脚本

## 常见问题

1. 数据库连接失败
   - 检查 MySQL 服务是否运行
   - 验证数据库用户名和密码
   - 确认数据库名称是否正确

2. API 调用失败
   - 检查 DASHSCOPE_API_KEY 是否有效
   - 确认模型名称是否正确
   - 查看服务器日志获取详细错误信息

## 调试

服务器日志会显示：
- 数据库操作
- API 请求详情
- 错误信息

可以通过以下命令查看日志：
```bash
# 如果使用 PM2
npm install -g pm2
pm2 start app.js
pm2 logs 

# 直接运行时的控制台输出
npm run dev
```


##第四步：安装并启动客户端
参考：https://github.com/alibaba/tongyi-chat-clients