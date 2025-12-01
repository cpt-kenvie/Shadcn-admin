@echo off
REM 模块功能：运行路由表迁移脚本
REM 最后修改：2025-11-29

echo 正在执行数据库迁移...
echo.

REM 请根据实际情况修改数据库连接信息
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=shadcn
set PGUSER=shadcn
set PGPASSWORD=shadcn123

REM 执行SQL文件
psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -f add-routes-table.sql

echo.
echo 迁移完成！
pause
