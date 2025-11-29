#Requires -Version 7.0
<#
.SYNOPSIS
    数据库更新脚本 - 添加路由表和权限
.DESCRIPTION
    此脚本用于更新数据库Schema，添加路由管理功能所需的表和权限
.NOTES
    模块功能：数据库Schema更新
    最后修改：2025-11-29
    依赖项：Prisma CLI, PostgreSQL
#>

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    数据库更新 - 添加路由管理功能" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # 1. 生成Prisma客户端
    Write-Host "[1/3] 生成 Prisma 客户端..." -ForegroundColor Yellow
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma 客户端生成失败"
    }
    Write-Host "✓ Prisma 客户端生成成功" -ForegroundColor Green
    Write-Host ""

    # 2. 创建并应用迁移
    Write-Host "[2/3] 创建数据库迁移..." -ForegroundColor Yellow
    npx prisma migrate dev --name add_routes_table
    if ($LASTEXITCODE -ne 0) {
        throw "数据库迁移失败"
    }
    Write-Host "✓ 数据库迁移成功" -ForegroundColor Green
    Write-Host ""

    # 3. 运行种子数据
    Write-Host "[3/3] 更新种子数据（添加路由权限）..." -ForegroundColor Yellow
    npx prisma db seed
    if ($LASTEXITCODE -ne 0) {
        Write-Host "! 种子数据更新可能失败，但可以继续" -ForegroundColor Yellow
    } else {
        Write-Host "✓ 种子数据更新成功" -ForegroundColor Green
    }
    Write-Host ""

    Write-Host "========================================" -ForegroundColor Green
    Write-Host "    数据库更新完成！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "现在您可以：" -ForegroundColor Cyan
    Write-Host "  1. 重启服务端：npm run dev" -ForegroundColor White
    Write-Host "  2. 使用 admin_a 账号登录查看路由管理功能" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "    错误：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的解决方案：" -ForegroundColor Yellow
    Write-Host "  1. 确保数据库服务正在运行" -ForegroundColor White
    Write-Host "  2. 检查 .env 文件中的数据库连接配置" -ForegroundColor White
    Write-Host "  3. 手动执行迁移：npx prisma migrate dev" -ForegroundColor White
    Write-Host ""
    exit 1
}
