# HTEC Docker 部署指南

## 目录结构

```
admin/docker/
├── Dockerfile          # 多阶段构建镜像
├── nginx.conf          # Nginx 反向代理配置
├── docker-compose.yml  # 本地开发编排
├── start.sh            # 容器启动脚本
├── build.bat           # Windows 构建脚本
├── build.sh            # Linux 构建脚本
└── build.md            # 本文档
```

## 访问地址

- `/` - 官网 (website)
- `/admin/` - 后台管理系统
- `/api/*` - API 接口

---

## 本地开发

### 1. 构建镜像

```bash
cd D:\Project\HTEC\admin\docker
build.bat
```

或手动执行：

```bash
cd D:\Project\HTEC
docker build -f admin/docker/Dockerfile -t htec:latest .
```

### 2. 启动容器

```bash
cd D:\Project\HTEC\admin\docker
docker-compose up -d
```

### 3. 查看日志

```bash
docker logs -f docker-htec-1
```

### 4. 停止容器

```bash
docker-compose down
```

### 5. 重新构建并启动

```bash
docker-compose down
build.bat
docker-compose up -d
```

---

## 服务器部署

### 方式一：导出镜像部署（推荐）

#### 1. 本地导出镜像

```bash
docker save -o htec.tar htec:latest
```

#### 2. 上传到服务器

```bash
scp htec.tar user@your-server:/home/user/
```

#### 3. 服务器加载镜像

```bash
docker load -i htec.tar
```

#### 4. 服务器运行容器

```bash
docker run -d \
  --name htec \
  -p 80:80 \
  -e DATABASE_URL="postgres://user:pass@host:5432/dbname" \
  -e JWT_SECRET="your-secret" \
  -e JWT_EXPIRES_IN="7d" \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -v htec_uploads:/app/uploads \
  --restart unless-stopped \
  htec:latest
```

### 方式二：使用 env 文件

#### 1. 上传 .env 文件到服务器

```bash
scp admin/.env user@your-server:/home/user/htec.env
```

#### 2. 使用 env 文件启动

```bash
docker run -d \
  --name htec \
  -p 8888:80 \
  --env-file /www/wwwroot/htecus.com/htec.env \
  -v htec_uploads:/app/uploads \
  --restart unless-stopped \
  htec:latest
```

---

## 升级流程

### 1. 本地重新构建

```bash
cd D:\Project\HTEC\admin\docker
build.bat
```

### 2. 导出新镜像

```bash
docker save -o htec.tar htec:latest
```

### 3. 上传到服务器

```bash
scp htec.tar user@your-server:/home/user/
```

### 4. 服务器执行升级

```bash
# 加载新镜像
docker load -i htec.tar

# 停止旧容器
docker stop htec

# 删除旧容器
docker rm htec

# 启动新容器
docker run -d \
  --name htec \
  -p 80:80 \
  --env-file /home/user/htec.env \
  -v htec_uploads:/app/uploads \
  --restart unless-stopped \
  htec:latest

# 清理旧镜像（可选）
docker image prune -f
```

---

## 常用命令

### 容器管理

```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 查看容器日志
docker logs -f htec

# 进入容器
docker exec -it htec sh

# 重启容器
docker restart htec
```

### 镜像管理

```bash
# 查看本地镜像
docker images

# 删除镜像
docker rmi htec:latest

# 清理无用镜像
docker image prune -f
```

### 数据卷管理

```bash
# 查看数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect htec_uploads

# 备份上传文件
docker cp htec:/app/uploads ./uploads_backup
```

---

## 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| DATABASE_URL | PostgreSQL 连接串 | postgres://user:pass@host:5432/db |
| JWT_SECRET | JWT 签名密钥 | your-secret-key |
| JWT_EXPIRES_IN | Token 过期时间 | 7d |
| NODE_ENV | 运行环境 | production |
| PORT | 后端端口 | 3001 |

---

## 故障排查

### 查看 Nginx 日志

```bash
docker exec htec cat /var/log/nginx/error.log
```

### 测试 Nginx 配置

```bash
docker exec htec nginx -t
```

### 热更新 Nginx 配置

```bash
docker cp nginx.conf htec:/etc/nginx/nginx.conf
docker exec htec nginx -s reload
```

### 检查后端服务

```bash
docker exec htec wget -qO- http://127.0.0.1:3001/health
```
