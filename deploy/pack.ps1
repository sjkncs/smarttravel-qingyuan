# ═══════════════════════════════════════════════════════════
# SmartTravel Qingyuan — Package for Server Deployment
# Run in PowerShell from project root:
#   powershell -ExecutionPolicy Bypass -File deploy/pack.ps1
# ═══════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

Write-Host "`n=== SmartTravel Qingyuan — 打包部署 ===" -ForegroundColor Cyan

# 1. Build
Write-Host "[1/4] 构建生产版本..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "构建失败!" -ForegroundColor Red; exit 1 }

# 2. Create staging directory
$StagingDir = "$ProjectRoot\deploy-package"
if (Test-Path $StagingDir) { Remove-Item -Recurse -Force $StagingDir }
New-Item -ItemType Directory -Path $StagingDir | Out-Null

Write-Host "[2/4] 复制文件到暂存目录..." -ForegroundColor Green

# Copy standalone build
Copy-Item -Recurse ".next\standalone" "$StagingDir\.next\standalone"
Copy-Item -Recurse ".next\static" "$StagingDir\.next\static"

# Copy public
Copy-Item -Recurse "public" "$StagingDir\public"

# Copy prisma
Copy-Item -Recurse "prisma" "$StagingDir\prisma"

# Copy deploy scripts
Copy-Item -Recurse "deploy" "$StagingDir\deploy"

# Copy package.json (needed for prisma install)
Copy-Item "package.json" "$StagingDir\package.json"
Copy-Item "package-lock.json" "$StagingDir\package-lock.json" -ErrorAction SilentlyContinue

# 3. Create tar.gz using tar (available on Windows 10+)
Write-Host "[3/4] 压缩打包..." -ForegroundColor Green
$OutputFile = "$ProjectRoot\smarttravel-deploy.tar.gz"
if (Test-Path $OutputFile) { Remove-Item $OutputFile }

Set-Location $StagingDir
tar -czf $OutputFile *
Set-Location $ProjectRoot

# 4. Cleanup staging
Remove-Item -Recurse -Force $StagingDir

$Size = [math]::Round((Get-Item $OutputFile).Length / 1MB, 2)
Write-Host "[4/4] 打包完成!" -ForegroundColor Green
Write-Host "`n=== 打包结果 ===" -ForegroundColor Cyan
Write-Host "  文件: $OutputFile"
Write-Host "  大小: ${Size} MB"
Write-Host ""
Write-Host "=== 上传到服务器 ===" -ForegroundColor Cyan
Write-Host "  scp smarttravel-deploy.tar.gz root@124.156.142.149:/opt/smarttravel/"
Write-Host ""
Write-Host "=== 服务器端部署 ===" -ForegroundColor Cyan
Write-Host "  ssh root@124.156.142.149"
Write-Host "  cd /opt/smarttravel && tar -xzf smarttravel-deploy.tar.gz"
Write-Host "  bash deploy/setup-server.sh   # 首次部署: 安装环境+安全加固"
Write-Host "  bash deploy/deploy.sh         # 启动应用"
Write-Host ""
