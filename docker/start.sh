#!/bin/sh

# 启动 Node.js 后端 (使用 tsx 运行 TypeScript)
npx tsx /app/server/index.ts &

# 启动 Nginx
nginx -g "daemon off;"
