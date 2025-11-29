# 完整权限系统设置指南

## 🎯 系统架构说明

现在系统已经实现了**完整的权限串联**：

```
用户 → 角色 → 权限 → 路由 → 侧边栏菜单
```

### 权限流程

1. **用户登录** → 获取用户信息
2. **加载角色** → 查询用户的所有角色
3. **获取权限** → 收集角色的所有权限
4. **过滤路由** → 根据权限过滤可访问的路由
5. **显示菜单** → 侧边栏只显示有权限的菜单

## 🚀 完整初始化步骤

### 步骤 1: 停止服务器

```bash
# 按 Ctrl+C 停止正在运行的服务器
```

### 步骤 2: 生成 Prisma Client 并同步数据库

```bash
# 生成包含 Route 模型的 Prisma Client
npx prisma generate

# 同步数据库（创建 routes 表）
npx prisma db push
```

### 步骤 3: 添加路由权限

```bash
# 运行权限修复脚本
node fix-permissions.js
```

### 步骤 4: 初始化路由数据

```bash
# 创建初始路由菜单
node seed-routes.js
```

### 步骤 5: 重启服务器

```bash
# 重启服务器
npm run dev
```

### 步骤 6: 重新登录

- 退出当前登录
- 使用 **admin_a** 账号登录（密码：admin123456）
- 现在侧边栏菜单会根据权限动态显示！

## 📋 一键执行所有步骤

```bash
# Windows (PowerShell)
npx prisma generate; npx prisma db push; node fix-permissions.js; node seed-routes.js
```

## ✨ 实现的功能

### 1. 服务端 API

#### 菜单 API (`/api/menus`)
- `GET /api/menus` - 获取当前用户的菜单（自动根据权限过滤）
- `GET /api/menus/check/:path` - 检查用户是否有权访问指定路由

#### 新增文件
- `server/services/menuService.ts` - 菜单服务
- `server/routes/menus.ts` - 菜单路由

### 2. 前端组件

#### 动态侧边栏
- `src/hooks/use-user-menus.ts` - 用户菜单 Hook
- `src/api/menus.ts` - 菜单 API 封装
- `src/components/layout/data/dynamic-sidebar-data.ts` - 动态菜单数据转换
- 更新 `src/components/layout/app-sidebar.tsx` - 使用动态菜单

### 3. 数据初始化

- `seed-routes.js` - 初始化路由数据脚本
- `fix-permissions.js` - 修复权限分配脚本

## 🎨 权限控制效果

### admin_a（管理员A）
拥有所有权限，可以看到所有菜单：
- ✅ 仪表盘
- ✅ 用户管理
  - ✅ 用户列表
  - ✅ 角色管理
  - ✅ 权限管理
- ✅ 路由管理

### admin_b（管理员B）
只有部分权限，菜单会被过滤：
- ✅ 仪表盘（无权限要求）
- ✅ 用户管理
  - ✅ 用户列表（有READ权限）
  - ✅ 角色管理（有READ权限）
  - ✅ 权限管理（有READ权限）
- ✅ 路由管理（有READ权限）

但在页面内部：
- ❌ 不能创建用户（没有CREATE权限）
- ✅ 可以导入用户（有IMPORT权限）
- ✅ 可以查看路由（有READ权限）
- ❌ 不能创建路由（没有CREATE权限）

## 🔧 自定义路由和权限

### 添加新路由

1. **在数据库中创建路由**

```javascript
// 可以在路由管理页面创建，或者使用脚本
const newRoute = await prisma.route.create({
  data: {
    path: '/settings',
    name: 'settings',
    title: '系统设置',
    icon: 'IconSettings',
    order: 30,
    hidden: false,
  },
})
```

2. **为路由分配权限**

```javascript
// 假设需要 settings:READ 权限才能访问
const permission = await prisma.permission.findUnique({
  where: {
    resource_action: {
      resource: 'settings',
      action: 'READ',
    },
  },
})

await prisma.routePermission.create({
  data: {
    routeId: newRoute.id,
    permissionId: permission.id,
  },
})
```

3. **刷新页面** - 侧边栏会自动更新

### 为用户分配权限

1. 访问**角色管理**页面
2. 编辑用户的角色
3. 勾选需要的权限
4. 保存
5. 用户重新登录后生效

## 🎯 权限检查逻辑

### 服务端权限检查

```typescript
// middleware/permission.ts
export function requirePermission(action: string, resource: string) {
  return async (req, res, next) => {
    const userId = req.user.id
    const hasPermission = await checkUserPermission(userId, resource, action)
    if (!hasPermission) {
      throw createForbiddenError(`您没有权限${action} ${resource}`)
    }
    next()
  }
}
```

### 前端权限守卫

```tsx
// 组件级权限控制
<PermissionGuard action='CREATE' resource='user'>
  <Button>创建用户</Button>
</PermissionGuard>

// 路由级权限控制 - 自动通过菜单API过滤
```

## 📊 数据库关系图

```
User (用户)
  ↓ UserRole (多对多)
Role (角色)
  ↓ RolePermission (多对多)
Permission (权限)
  ↓ RoutePermission (多对多)
Route (路由)
```

## 🐛 常见问题

### Q1: 侧边栏没有显示菜单

**检查：**
1. 是否执行了 `node seed-routes.js`？
2. 数据库中 routes 表是否有数据？
3. 浏览器控制台是否有错误？

**解决：**
```bash
# 重新初始化路由数据
node seed-routes.js
```

### Q2: 提示"您没有权限"

**检查：**
1. 当前用户的角色是什么？
2. 该角色是否有对应的权限？

**解决：**
```bash
# 使用 admin_a 账号登录（拥有所有权限）
用户名: admin_a
密码: admin123456

# 或者为当前角色添加权限
在角色管理页面 → 编辑角色 → 勾选需要的权限
```

### Q3: 菜单显示"加载菜单中..."卡住

**检查：**
1. 服务端是否正常运行？
2. `/api/menus` 接口是否返回正常？

**解决：**
```bash
# 在浏览器开发者工具查看网络请求
# 或在服务端日志查看错误信息
```

## 🎉 验证系统运行

### 测试步骤

1. **登录 admin_a**
   - 应该看到所有菜单
   - 可以执行所有操作

2. **登录 admin_b**
   - 应该看到部分菜单
   - 部分按钮被隐藏（通过 PermissionGuard）

3. **创建新角色**
   - 分配特定权限
   - 创建新用户并分配该角色
   - 登录新用户验证权限

## 📚 技术细节

### 权限匹配逻辑

- **OR 逻辑**：路由只要匹配任意一个权限即可访问
- **AND 逻辑**：如果需要同时满足多个权限，需要在代码中单独实现

### 菜单缓存

- 前端使用 React Query 缓存 5 分钟
- 权限变更后需要重新登录才能刷新

### 图标映射

前端使用图标名称字符串，在 `dynamic-sidebar-data.ts` 中映射到实际组件。

添加新图标：
```typescript
// src/components/layout/data/dynamic-sidebar-data.ts
const ICON_MAP: Record<string, React.ElementType> = {
  'IconYourNewIcon': IconYourNewIcon,
  // ...
}
```

## 🔐 安全建议

1. ✅ 永远不要在前端跳过权限检查
2. ✅ 所有敏感操作必须有服务端权限验证
3. ✅ 定期审查角色权限分配
4. ✅ 使用最小权限原则
5. ✅ 记录权限变更日志

## 🎊 现在您的系统已完全串联！

权限系统现已完整实现：
- ✅ 用户登录后自动加载权限
- ✅ 侧边栏菜单根据权限动态显示
- ✅ 页面内按钮根据权限显示/隐藏
- ✅ 服务端 API 强制权限验证
- ✅ 路由管理页面可视化配置菜单和权限

开始使用吧！🚀
