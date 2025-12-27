# 阶段1: 构建 website (官网)
FROM node:20-alpine AS website-builder
WORKDIR /app/website
COPY website/package*.json ./
RUN npm ci
COPY website/ ./
ENV VITE_API_BASE_URL=
RUN npm run build

# 阶段2: 构建 admin 前端
FROM node:20-alpine AS admin-builder
WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm ci
COPY admin/ ./
ENV VITE_API_BASE_URL=/api
RUN npm run build -- --base=/admin/

# 阶段3: 生产镜像
FROM node:20-alpine AS production
RUN apk add --no-cache nginx

WORKDIR /app

# 复制后端代码和依赖
COPY admin/package*.json ./
RUN npm ci
COPY admin/server ./server
COPY admin/prisma ./prisma

# 生成 Prisma Client
RUN npx prisma generate

# 复制前端构建产物
COPY --from=website-builder /app/website/dist /usr/share/nginx/html/website
COPY --from=admin-builder /app/admin/dist /usr/share/nginx/html/admin

# 复制 nginx 配置
COPY admin/docker/nginx.conf /etc/nginx/nginx.conf

# 复制启动脚本并转换换行符
COPY admin/docker/start.sh /start.sh
RUN sed -i 's/\r$//' /start.sh && chmod +x /start.sh

# 创建上传目录
RUN mkdir -p /app/uploads

EXPOSE 80

CMD ["/start.sh"]
