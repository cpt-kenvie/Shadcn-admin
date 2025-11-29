/**
 * 模块功能：添加路由表和路由权限关联表
 * 最后修改：2025-11-29
 * 依赖项：PostgreSQL 数据库
 */

-- 创建路由表
CREATE TABLE IF NOT EXISTS "routes" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "path" VARCHAR(255) NOT NULL UNIQUE,
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "component" VARCHAR(255),
    "title" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),
    "parent_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "routes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "routes"("id") ON DELETE RESTRICT
);

-- 创建路由权限关联表
CREATE TABLE IF NOT EXISTS "route_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "route_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "route_permissions_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE,
    CONSTRAINT "route_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE,
    CONSTRAINT "route_permissions_route_id_permission_id_key" UNIQUE ("route_id", "permission_id")
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "routes_path_idx" ON "routes"("path");
CREATE INDEX IF NOT EXISTS "routes_name_idx" ON "routes"("name");
CREATE INDEX IF NOT EXISTS "routes_parent_id_idx" ON "routes"("parent_id");
CREATE INDEX IF NOT EXISTS "routes_order_idx" ON "routes"("order");
CREATE INDEX IF NOT EXISTS "route_permissions_route_id_idx" ON "route_permissions"("route_id");
CREATE INDEX IF NOT EXISTS "route_permissions_permission_id_idx" ON "route_permissions"("permission_id");

-- 插入路由权限（如果不存在）
INSERT INTO "permissions" ("id", "resource", "action", "description", "created_at", "updated_at")
VALUES
    (gen_random_uuid()::TEXT, 'route', 'CREATE', 'CREATE route', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::TEXT, 'route', 'READ', 'READ route', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::TEXT, 'route', 'UPDATE', 'UPDATE route', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::TEXT, 'route', 'DELETE', 'DELETE route', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::TEXT, 'route', 'MANAGE', 'MANAGE route', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::TEXT, 'route', 'IMPORT', 'IMPORT route', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::TEXT, 'route', 'EXPORT', 'EXPORT route', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("resource", "action") DO NOTHING;

-- 将路由权限分配给管理员 A 角色
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "created_at")
SELECT
    gen_random_uuid()::TEXT,
    r.id,
    p.id,
    CURRENT_TIMESTAMP
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.name = 'admin_a'
  AND p.resource = 'route'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- 将路由的 READ 权限分配给管理员 B 角色
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "created_at")
SELECT
    gen_random_uuid()::TEXT,
    r.id,
    p.id,
    CURRENT_TIMESTAMP
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.name = 'admin_b'
  AND p.resource = 'route'
  AND p.action = 'READ'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- 完成
SELECT 'Routes table and permissions created successfully!' as message;
