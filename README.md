# ali-deepseek
调用ali通义千问的deepseek-r1满血版KPI,解决deepseek经常不能用的问题

# 使用说明
## 第一步：申请阿里通义千问的api-key
进入：https://www.aliyun.com/product/tongyi
参考 https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key?spm=5176.21213303.J_v8LsmxMG6alneH-O7TCPa.1.56072f3d5fS2p2&scm=20140722.S_help@@%E6%96%87%E6%A1%A3@@2712195._.ID_help@@%E6%96%87%E6%A1%A3@@2712195-RL_%E5%A6%82%E4%BD%95%E7%94%B3%E8%AF%B7%E9%80%9A%E4%B9%89%E5%8D%83%E9%97%AE%E5%A4%A7%E6%A8%A1%E5%9E%8B%E7%9A%84apikey-LOC_2024SPAllResult-OR_ser-PAR1_213e35f917396988668076738e1e5f-V_4-RE_new3-P0_0-P1_0 完成通义大模api-key的申请

## 第二步：添加数据库
用 db/init.sql建表，建库

## 第三步：添加环境变量
在根目录添加.env文件，添加阿里通义千问的api-key

/*
.env文件内容如下：

###Server port
PORT=3008

###Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=12345678.aBc
DB_NAME=alibabaAI

###JWT Secret
JWT_SECRET=####### 



#model Name
#MODEL_NAME=deepseek-r1 
###所有model的列表： https://help.aliyun.com/zh/model-studio/getting-started/models?spm=a2c4g.11186623.help-menu-2400256.d_0_2.21ea7980T6Tc5N
MODEL_NAME=deepseek-v3
DASHSCOPE_API_KEY= #######通义千问的api-key
*/

## 第四步：安装依赖
```bash
npm install
```

## 第五步：启动服务
```bash
npm run start
```

