@echo off
REM 设置数据库权限的批处理脚本

set PGPASSWORD=S7865324.

echo 正在设置数据库权限...

"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d shadcn -c "ALTER SCHEMA public OWNER TO shadcn;"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d shadcn -c "GRANT ALL PRIVILEGES ON SCHEMA public TO shadcn;"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d shadcn -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO shadcn;"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d shadcn -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO shadcn;"

echo 权限设置完成！
pause
