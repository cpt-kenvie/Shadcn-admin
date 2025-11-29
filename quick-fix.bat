@echo off
REM 快速修复 - 为角色分配路由权限

echo =========================================
echo   快速修复：添加路由权限
echo =========================================
echo.

REM 数据库连接信息（请根据实际情况修改）
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=shadcn
set PGUSER=shadcn
set PGPASSWORD=shadcn123

echo 正在为现有角色分配路由权限...
echo.

psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -f prisma\fix-route-permissions.sql

echo.
echo =========================================
echo   完成！请执行以下步骤：
echo   1. 重新登录系统
echo   2. 使用 admin_a 账号测试
echo =========================================
echo.
pause
