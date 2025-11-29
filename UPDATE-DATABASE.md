# 数据库更新指南 - 添加路由管理功能

## 问题说明

如果您在使用系统时遇到以下错误：
```json
{
  "success": false,
  "message": "您没有权限READ route",
  "code": 2100
}
```

或者在角色管理的权限配置中看不到"路由管理"相关的权限，这是因为：
1. 数据库中还没有创建路由表和相关权限，**或者**
2. 您当前登录用户的角色没有被分配route权限

## ⚡ 快速修复（推荐）

如果您只是缺少权限分配（不需要创建表），使用这个最快的方法：

```bash
node fix-permissions.js
```

这个脚本会：
- ✅ 确保route权限存在
- ✅ 为admin_a角色分配所有route权限
- ✅ 为admin_b角色分配READ权限
- ✅ 显示权限分配结果

**执行后记得重新登录系统！**

## 解决方案

### 方法一：使用自动化脚本（推荐）

在项目根目录执行：

```powershell
cd prisma
.\update-database.ps1
```

这个脚本会自动完成：
1. 生成 Prisma 客户端
2. 创建数据库迁移（添加路由表）
3. 更新种子数据（添加路由权限）

### 方法二：手动执行命令

如果自动化脚本失败，可以手动执行以下命令：

```bash
# 1. 生成 Prisma 客户端
npx prisma generate

# 2. 创建并应用数据库迁移
npx prisma migrate dev --name add_routes_table

# 3. 运行种子数据
npx prisma db seed
```

### 方法三：直接执行 SQL（快速）

如果您熟悉 SQL，可以直接执行 `prisma/add-routes-table.sql` 文件：

```bash
# 使用 psql 命令行工具
psql -h localhost -p 5432 -d shadcn -U shadcn -f prisma/add-routes-table.sql
```

或者使用 pgAdmin、DBeaver 等数据库工具直接运行该 SQL 文件。

## 更新内容

### 1. 数据库表

**新增表：**
- `routes` - 路由配置表
- `route_permissions` - 路由权限关联表

### 2. 权限记录

**新增权限（resource = 'route'）：**
- `route:CREATE` - 创建路由
- `route:READ` - 查看路由
- `route:UPDATE` - 更新路由
- `route:DELETE` - 删除路由
- `route:MANAGE` - 管理路由
- `route:IMPORT` - 导入路由
- `route:EXPORT` - 导出路由

### 3. 角色权限分配

- **admin_a（管理员A）**：自动获得所有路由权限
- **admin_b（管理员B）**：自动获得路由的 READ 权限

## 验证更新

更新完成后，您可以通过以下方式验证：

### 1. 检查数据库表

```sql
-- 查看路由表是否创建成功
SELECT * FROM routes;

-- 查看路由权限是否创建成功
SELECT * FROM permissions WHERE resource = 'route';
```

### 2. 检查角色权限

```sql
-- 查看管理员A的路由权限
SELECT p.*
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
WHERE r.name = 'admin_a' AND p.resource = 'route';
```

### 3. 测试前端功能

1. 重启服务端：`npm run dev`
2. 使用 `admin_a` 账号登录（密码：`admin123456`）
3. 访问角色管理页面，创建或编辑角色
4. 在权限配置中应该能看到"路由管理"相关的权限选项
5. 访问路由管理页面（/routes）应该能正常显示

## 常见问题

### Q1: 执行迁移时提示"relation already exists"

**原因：** 表已经存在

**解决：** 这通常不是问题，说明表已经创建过了。可以跳过迁移，直接运行种子数据。

### Q2: 登录后仍然提示没有权限

**原因：** 当前登录用户的角色没有被分配路由权限

**解决：**
1. 使用 `admin_a` 账号登录（该账号有所有权限）
2. 或者在数据库中手动为您的角色分配路由权限

### Q3: 权限配置中看不到路由权限

**原因：** 权限记录没有创建成功

**解决：** 重新运行种子数据或直接执行 SQL 文件

## 技术细节

### Schema 变更

在 `prisma/schema.prisma` 中新增了：
- `Route` 模型
- `RoutePermission` 模型
- 更新了 `Permission` 模型的关联

### 种子数据变更

在 `prisma/seed.ts` 中：
- 将 `'route'` 添加到资源列表中
- 系统会自动为 route 资源创建所有操作的权限

## 后续步骤

数据库更新完成后，您就可以使用完整的路由管理功能了：

1. **路由管理页面** (`/routes`)
   - 创建、编辑、删除路由
   - 配置路由层级关系
   - 分配访问权限

2. **角色管理页面** (`/roles`)
   - 为角色分配路由权限
   - 控制不同角色对路由的访问

3. **权限管理页面** (`/permissions`)
   - 查看所有路由权限

## 需要帮助？

如果您在更新过程中遇到任何问题，请检查：
1. 数据库连接配置（`.env` 文件）
2. 数据库服务是否正常运行
3. Prisma CLI 是否正确安装（`npx prisma --version`）
