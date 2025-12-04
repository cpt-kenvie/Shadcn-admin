/**
 * 模块功能：Express 服务器入口文件
 * 最后修改：2025-11-29
 * 依赖项：express, cors, cookie-parser, ./config/env, ./middleware/errorHandler, ./routes/auth
 */

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config, validateEnv } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { disconnectDatabase } from './config/database.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import roleRoutes from './routes/roles.js'
import permissionRoutes from './routes/permissions.js'
import routeRoutes from './routes/routes.js'
import menuRoutes from './routes/menus.js'
import systemConfigRoutes from './routes/systemConfig.js'
import userPreferenceRoutes from './routes/userPreference.js'

// 验证环境变量
try {
  validateEnv()
} catch (error) {
  console.error('环境变量验证失败:', error)
  process.exit(1)
}

// 创建 Express 应用
const app = express()

// 中间件配置
app.use(cors(config.cors))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/permissions', permissionRoutes)
app.use('/api/routes', routeRoutes)
app.use('/api/menus', menuRoutes)
app.use('/api/system-config', systemConfigRoutes)
app.use('/api/user-preference', userPreferenceRoutes)

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `路由 ${req.method} ${req.path} 不存在`,
    code: 1004,
    timestamp: new Date().toISOString(),
  })
})

// 全局错误处理
app.use(errorHandler)

// 启动服务器
const server = app.listen(config.port, () => {
  console.log(`\n🚀 服务器已启动`)
  console.log(`   环境: ${config.env}`)
  console.log(`   端口: ${config.port}`)
  console.log(`   地址: http://localhost:${config.port}`)
  console.log(`\n📝 API 文档:`)
  console.log(`   认证: http://localhost:${config.port}/api/auth`)
  console.log(`\n按 Ctrl+C 停止服务器\n`)
})

// 优雅关闭
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

async function gracefulShutdown() {
  console.log('\n正在关闭服务器...')

  server.close(async () => {
    console.log('服务器已关闭')

    try {
      await disconnectDatabase()
      console.log('数据库连接已关闭')
      process.exit(0)
    } catch (error) {
      console.error('关闭数据库连接失败:', error)
      process.exit(1)
    }
  })

  // 超时强制关闭
  setTimeout(() => {
    console.error('强制关闭服务器')
    process.exit(1)
  }, 10000)
}

export default app
