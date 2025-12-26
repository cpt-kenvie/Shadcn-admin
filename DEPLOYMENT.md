# Shadcn Admin 宝塔 + Nginx 部署文档

## 项目架构说明

本项目采用前后端分离架构：
- **前端**：React + Vite + TanStack Router
- **后端**：Node.js + Express + Prisma
- **数据库**：PostgreSQL

## 一、服务器环境准备

### 1.1 系统要求
- 操作系统：Linux (推荐 Ubuntu 20.04+ / CentOS 7+)
- 宝塔面板：7.x 或更高版本
- Node.js：18.x 或更高版本
- PostgreSQL：14.x 或更高版本
- Nginx：1.20+ (宝塔自带)

### 1.2 安装宝塔面板

```bash
# Ubuntu/Debian
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh

# CentOS
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh
```

### 1.3 安装必要软件

登录宝塔面板后，在"软件商店"中安装：
1. **Nginx** (1.20+)
2. **PostgreSQL** (14.x)
3. **PM2管理器** (用于管理 Node.js 进程)

## 二、数据库配置

### 2.1 创建数据库

1. 进入宝塔面板 → 数据库 → PostgreSQL
2. 点击"添加数据库"
3. 填写信息：
   - 数据库名：`shadcn_admin`
   - 用户名：`shadcn_user`
   - 密码：设置强密码（记录下来）
   - 访问权限：本地服务器

### 2.2 记录数据库连接信息

```
数据库地址：localhost
数据库端口：5432
数据库名称：shadcn_admin
用户名：shadcn_user
密码：[你设置的密码]
```

## 三、后端部署

### 3.1 上传代码

1. 在宝塔面板创建网站目录：
   ```bash
   mkdir -p /www/wwwroot/shadcn-admin
   ```

2. 将项目代码上传到服务器（使用 FTP 或 Git）：
   ```bash
   cd /www/wwwroot/shadcn-admin
   git clone [你的仓库地址] .
   # 或使用宝塔面板的文件管理上传
   ```

### 3.2 安装 Node.js 依赖

```bash
cd /www/wwwroot/shadcn-admin
npm install --production
```

### 3.3 配置环境变量

创建生产环境配置文件：

```bash
nano /www/wwwroot/shadcn-admin/.env
```

填入以下内容（根据实际情况修改）：

```env
# 环境
NODE_ENV=production

# 服务器端口
PORT=3001

# 数据库连接（PostgreSQL）
DATABASE_URL="postgresql://shadcn_user:你的数据库密码@localhost:5432/shadcn_admin?schema=public"

# JWT 密钥（必须修改为随机字符串）
JWT_SECRET="your-super-secret-jwt-key-change-this-to-random-string-123456789"
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS 配置（前端域名）
CORS_ORIGIN=https://你的域名.com
```

**生成安全的 JWT_SECRET：**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.4 初始化数据库

```bash
cd /www/wwwroot/shadcn-admin

# 生成 Prisma Client
npx prisma generate

# 推送数据库结构
npx prisma db push

# 初始化种子数据（创建默认管理员账号）
npm run db:seed
```

**默认管理员账号：**
- 用户名：`admin`
- 密码：`admin123`
- 邮箱：`admin@example.com`

⚠️ **重要：首次登录后立即修改密码！**

### 3.5 使用 PM2 启动后端服务

1. 在宝塔面板 → 软件商店 → PM2管理器 → 设置
2. 点击"添加项目"
3. 填写信息：
   - 项目名称：`shadcn-admin-api`
   - 项目路径：`/www/wwwroot/shadcn-admin`
   - 启动文件：`server/index.ts`
   - 运行模式：`tsx`（或使用 `node` 如果已编译）

或使用命令行：

```bash
cd /www/wwwroot/shadcn-admin

# 使用 tsx 直接运行 TypeScript
pm2 start server/index.ts --name shadcn-admin-api --interpreter tsx

# 或者先编译再运行（推荐生产环境）
npm run build:server  # 如果有编译脚本
pm2 start dist/server/index.js --name shadcn-admin-api

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

### 3.6 验证后端服务

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs shadcn-admin-api

# 测试 API
curl http://localhost:3001/health
```

应该返回：
```json
{"status":"ok","timestamp":"2024-12-04T..."}
```

## 四、前端部署

### 4.1 构建前端项目

在本地或服务器上构建前端：

```bash
cd /www/wwwroot/shadcn-admin

# 配置生产环境 API 地址
nano .env.production
```

填入：
```env
VITE_API_BASE_URL=https://你的域名.com/api
```

构建前端：
```bash
npm run build
```

构建完成后，会生成 `dist` 目录。

### 4.2 配置 Nginx

1. 在宝塔面板 → 网站 → 添加站点
2. 填写信息：
   - 域名：`你的域名.com`
   - 根目录：`/www/wwwroot/shadcn-admin/dist`
   - PHP版本：纯静态

3. 点击网站设置 → 配置文件，替换为以下配置：

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name 你的域名.com;

    # SSL 证书配置（如果使用 HTTPS）
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;

    # 前端静态文件目录
    root /www/wwwroot/shadcn-admin/dist;
    index index.html;

    # 访问日志
    access_log /www/wwwlogs/shadcn-admin.log;
    error_log /www/wwwlogs/shadcn-admin.error.log;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # 前端路由配置（SPA 应用）
    location / {
        try_files $uri $uri/ /index.html;

        # 缓存策略
        add_header Cache-Control "no-cache";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 反向代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;

        # 请求头配置
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲配置
        proxy_buffering off;
        proxy_buffer_size 4k;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        access_log off;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

4. 保存配置并重启 Nginx：
```bash
nginx -t  # 测试配置
nginx -s reload  # 重载配置
```

或在宝塔面板中点击"重载配置"。

### 4.3 配置 SSL 证书（推荐）

1. 在宝塔面板 → 网站 → 你的站点 → SSL
2. 选择"Let's Encrypt"免费证书或上传自己的证书
3. 点击"申请"或"部署"
4. 开启"强制 HTTPS"

## 五、部署验证

### 5.1 检查后端服务

```bash
# 检查 PM2 状态
pm2 status

# 查看后端日志
pm2 logs shadcn-admin-api --lines 50

# 测试 API 健康检查
curl http://localhost:3001/health
```

### 5.2 检查前端访问

1. 浏览器访问：`https://你的域名.com`
2. 检查是否正常加载页面
3. 打开浏览器开发者工具 → Network，检查 API 请求是否正常

### 5.3 测试登录功能

使用默认管理员账号登录：
- 用户名：`admin`
- 密码：`admin123`

## 六、常见问题排查

### 6.1 后端无法启动

```bash
# 查看详细错误日志
pm2 logs shadcn-admin-api --err

# 常见问题：
# 1. 数据库连接失败 → 检查 DATABASE_URL 配置
# 2. 端口被占用 → 修改 PORT 或停止占用进程
# 3. 缺少环境变量 → 检查 .env 文件
```

### 6.2 前端 API 请求失败

1. 检查 `.env.production` 中的 `VITE_API_BASE_URL` 是否正确
2. 检查 Nginx 反向代理配置
3. 检查后端 CORS 配置中的 `CORS_ORIGIN`
4. 查看浏览器控制台和 Network 面板

### 6.3 数据库连接问题

```bash
# 测试数据库连接
psql -U shadcn_user -d shadcn_admin -h localhost

# 检查 PostgreSQL 服务状态
systemctl status postgresql

# 查看 PostgreSQL 日志
tail -f /var/log/postgresql/postgresql-*.log
```

### 6.4 Nginx 502 错误

1. 检查后端服务是否运行：`pm2 status`
2. 检查端口是否正确：后端监听 3001，Nginx 代理到 3001
3. 检查防火墙规则
4. 查看 Nginx 错误日志：`tail -f /www/wwwlogs/shadcn-admin.error.log`

## 七、日常维护

### 7.1 更新代码

```bash
cd /www/wwwroot/shadcn-admin

# 拉取最新代码
git pull

# 安装新依赖
npm install --production

# 更新数据库结构
npx prisma db push

# 重新构建前端
npm run build

# 重启后端服务
pm2 restart shadcn-admin-api
```

### 7.2 备份数据库

```bash
# 手动备份
pg_dump -U shadcn_user -d shadcn_admin > backup_$(date +%Y%m%d).sql

# 或使用宝塔面板的定时备份功能
```

### 7.3 查看日志

```bash
# 后端日志
pm2 logs shadcn-admin-api

# Nginx 访问日志
tail -f /www/wwwlogs/shadcn-admin.log

# Nginx 错误日志
tail -f /www/wwwlogs/shadcn-admin.error.log
```

### 7.4 性能监控

```bash
# 查看 PM2 监控
pm2 monit

# 查看系统资源
htop
```

## 八、安全建议

### 8.1 必须修改的配置

1. ✅ 修改默认管理员密码
2. ✅ 使用强随机 JWT_SECRET
3. ✅ 配置 HTTPS（SSL 证书）
4. ✅ 修改数据库默认密码
5. ✅ 配置防火墙规则

### 8.2 防火墙配置

```bash
# 只开放必要端口
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 22/tcp    # SSH
ufw enable

# 后端端口 3001 不对外开放（仅本地访问）
```

### 8.3 定期更新

```bash
# 更新系统包
apt update && apt upgrade -y  # Ubuntu/Debian
yum update -y                  # CentOS

# 更新 Node.js 依赖
npm audit fix
```

## 九、性能优化建议

### 9.1 启用 HTTP/2

在 Nginx 配置中已启用：`listen 443 ssl http2;`

### 9.2 配置 CDN

将静态资源（JS、CSS、图片）托管到 CDN，提升加载速度。

### 9.3 数据库优化

```sql
-- 创建必要的索引（已在 Prisma Schema 中定义）
-- 定期清理日志表
-- 配置 PostgreSQL 连接池
```

### 9.4 启用 Redis 缓存（可选）

安装 Redis 并配置会话缓存，提升性能。

## 十、技术支持

如遇到问题，请检查：
1. 后端日志：`pm2 logs shadcn-admin-api`
2. Nginx 日志：`/www/wwwlogs/shadcn-admin.error.log`
3. 数据库日志：PostgreSQL 日志文件
4. 浏览器控制台：Network 和 Console 面板

---

**部署完成！** 🎉

访问 `https://你的域名.com` 开始使用系统。
