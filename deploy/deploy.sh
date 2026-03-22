#!/bin/bash
# ═══════════════════════════════════════════════════════════
# SmartTravel Qingyuan — Application Deployment Script
# Run on server after uploading files to /opt/smarttravel/
# Usage: cd /opt/smarttravel && bash deploy/deploy.sh
# ═══════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/opt/smarttravel"
log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

cd "$APP_DIR" || err "目录不存在: $APP_DIR"

echo "═══════════════════════════════════════════════"
echo "  SmartTravel Qingyuan — 应用部署"
echo "═══════════════════════════════════════════════"

# ── 1. Check .env ─────────────────────────────────────
[ -f .env ] || err ".env 文件不存在！请先运行 setup-server.sh 或手动创建"
log ".env 文件已就位"

# ── 2. Install production dependencies (standalone needs node_modules for prisma) ──
if [ -f package.json ]; then
  log "安装生产依赖..."
  npm install --omit=dev --ignore-scripts 2>/dev/null || true
fi

# ── 3. Generate Prisma client ─────────────────────────
if [ -f prisma/schema.prisma ]; then
  log "生成 Prisma Client..."
  npx prisma generate
  log "推送数据库 Schema..."
  npx prisma db push --accept-data-loss 2>/dev/null || {
    warn "数据库推送失败，请检查 DATABASE_URL 是否正确"
  }
  # Seed if needed
  if [ -f prisma/seed.ts ]; then
    warn "如需初始化数据，请手动运行: npx prisma db seed"
  fi
fi

# ── 4. Verify standalone build ────────────────────────
[ -f .next/standalone/server.js ] || err "standalone 构建不存在! 请确保 .next/standalone/ 已上传"
log "standalone 构建已就位"

# ── 5. Verify static & public ─────────────────────────
[ -d .next/static ] || warn ".next/static/ 目录缺失，静态资源可能无法加载"
[ -d public ] || warn "public/ 目录缺失"

# Copy static + public into standalone (Next.js standalone requirement)
log "同步静态资源到 standalone..."
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
cp -r public .next/standalone/public 2>/dev/null || true

# Copy .env into standalone dir
cp .env .next/standalone/.env 2>/dev/null || true

# ── 6. Setup Nginx ────────────────────────────────────
if [ -f deploy/nginx.conf ]; then
  log "更新 Nginx 配置..."
  cp deploy/nginx.conf /etc/nginx/sites-available/smarttravel
  ln -sf /etc/nginx/sites-available/smarttravel /etc/nginx/sites-enabled/smarttravel
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  log "Nginx 配置已生效"
fi

# ── 7. Start/Restart with PM2 ─────────────────────────
log "启动/重启应用..."
if [ -f deploy/ecosystem.config.js ]; then
  pm2 delete smarttravel-qingyuan 2>/dev/null || true
  pm2 start deploy/ecosystem.config.js
  pm2 save
  log "PM2 已启动 (cluster mode × 2 instances)"
else
  pm2 delete smarttravel-qingyuan 2>/dev/null || true
  cd .next/standalone
  PORT=3000 HOSTNAME=0.0.0.0 pm2 start server.js --name smarttravel-qingyuan -i 2
  pm2 save
  cd "$APP_DIR"
  log "PM2 已启动 (fallback mode)"
fi

# ── 8. Health check ───────────────────────────────────
sleep 3
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200\|304"; then
  log "健康检查通过 ✓"
else
  warn "应用可能还在启动中，请稍后检查: curl http://127.0.0.1:3000"
fi

# ── Done ──────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════"
echo -e "${GREEN}  部署完成！${NC}"
echo "═══════════════════════════════════════════════"
echo ""
echo "  访问地址: http://124.156.142.149"
echo ""
echo "  管理命令:"
echo "  pm2 status              # 查看进程状态"
echo "  pm2 logs                # 查看实时日志"
echo "  pm2 restart all         # 重启应用"
echo "  pm2 monit               # 监控面板"
echo ""
echo "  数据库命令:"
echo "  npx prisma studio       # 可视化数据库管理"
echo "  npx prisma db seed      # 初始化种子数据"
echo ""
