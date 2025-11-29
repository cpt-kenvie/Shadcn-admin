-- 为 shadcn 用户授予必要的权限
-- 请使用 postgres 超级用户执行此脚本

-- 授予数据库所有权限
GRANT ALL PRIVILEGES ON DATABASE shadcn TO shadcn;

-- 连接到 shadcn 数据库后执行
\c shadcn

-- 授予 public schema 的所有权限
GRANT ALL ON SCHEMA public TO shadcn;

-- 授予创建权限
ALTER USER shadcn CREATEDB;

-- 授予 public schema 的所有表权限（包括未来创建的表）
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO shadcn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO shadcn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO shadcn;
