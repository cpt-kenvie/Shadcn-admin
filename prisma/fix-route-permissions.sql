/**
 * 模块功能：快速修复 - 为现有角色分配路由权限
 * 最后修改：2025-11-29
 * 说明：如果您已经创建了route权限但无法访问，执行此脚本即可
 */

-- 步骤1: 确保route权限存在
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

-- 步骤2: 查看当前有哪些角色
SELECT id, name, display_name FROM roles;

-- 步骤3: 为 admin_a 角色分配所有route权限
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

-- 步骤4: 为 admin_b 角色分配route的READ权限
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

-- 步骤5: 如果您使用的是其他角色名称，请取消以下注释并修改角色名称
-- 例如：为名为 'your_role_name' 的角色分配所有route权限
/*
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "created_at")
SELECT
    gen_random_uuid()::TEXT,
    r.id,
    p.id,
    CURRENT_TIMESTAMP
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.name = 'your_role_name'  -- 修改为您的角色名称
  AND p.resource = 'route'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
*/

-- 步骤6: 验证权限分配
SELECT
    r.name as role_name,
    r.display_name,
    p.resource,
    p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.resource = 'route'
ORDER BY r.name, p.action;

-- 完成
SELECT '✓ 路由权限分配完成！请重新登录以刷新权限。' as message;
