-- 以 postgres 超级用户身份执行此脚本
-- psql -U postgres -d shadcn -f prisma/grant-permissions.sql

-- 授予 shadcn 用户对 public schema 的完全权限
GRANT ALL PRIVILEGES ON SCHEMA public TO shadcn;

-- 授予对所有现有表的权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO shadcn;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO shadcn;

-- 授予对未来创建的表的权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO shadcn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO shadcn;

-- 让 shadcn 成为 public schema 的所有者
ALTER SCHEMA public OWNER TO shadcn;
