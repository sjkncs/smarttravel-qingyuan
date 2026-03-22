#!/bin/bash
# ═══════════════════════════════════════════════════════════
# SmartTravel Qingyuan — Server Setup & Security Hardening
# Target: Ubuntu/Debian on 124.156.142.149 (2核 2GB)
# Run as root: bash setup-server.sh
# ═══════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── Check root ──────────────────────────────────────────
[[ $EUID -ne 0 ]] && err "请使用 root 用户运行: sudo bash setup-server.sh"

echo "═══════════════════════════════════════════════"
echo "  SmartTravel Qingyuan — 服务器部署 & 安全加固"
echo "═══════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════════
# 1. SYSTEM UPDATE & BASIC PACKAGES
# ═══════════════════════════════════════════════════════════
log "更新系统包..."
apt-get update -qq && apt-get upgrade -y -qq

log "安装基础工具..."
apt-get install -y -qq \
  curl wget git unzip htop \
  ufw fail2ban \
  build-essential

# ═══════════════════════════════════════════════════════════
# 2. NODE.JS 20 LTS (via NodeSource)
# ═══════════════════════════════════════════════════════════
if ! command -v node &>/dev/null; then
  log "安装 Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
else
  log "Node.js 已安装: $(node -v)"
fi

# ═══════════════════════════════════════════════════════════
# 3. PM2 PROCESS MANAGER
# ═══════════════════════════════════════════════════════════
if ! command -v pm2 &>/dev/null; then
  log "安装 PM2..."
  npm install -g pm2
  pm2 startup systemd -u root --hp /root
else
  log "PM2 已安装: $(pm2 -v)"
fi

# ═══════════════════════════════════════════════════════════
# 4. NGINX
# ═══════════════════════════════════════════════════════════
if ! command -v nginx &>/dev/null; then
  log "安装 Nginx..."
  apt-get install -y -qq nginx
else
  log "Nginx 已安装: $(nginx -v 2>&1)"
fi

# ═══════════════════════════════════════════════════════════
# 5. POSTGRESQL 16
# ═══════════════════════════════════════════════════════════
if ! command -v psql &>/dev/null; then
  log "安装 PostgreSQL 16..."
  apt-get install -y -qq postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
else
  log "PostgreSQL 已安装: $(psql --version)"
fi

# ═══════════════════════════════════════════════════════════
# 6. CREATE APP DIRECTORY
# ═══════════════════════════════════════════════════════════
log "创建应用目录..."
mkdir -p /opt/smarttravel
mkdir -p /var/log/smarttravel
chmod 755 /opt/smarttravel

# ═══════════════════════════════════════════════════════════
# 7. POSTGRESQL DATABASE SETUP
# ═══════════════════════════════════════════════════════════
log "配置 PostgreSQL 数据库..."
DB_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='smarttravel'" | grep -q 1 || {
  sudo -u postgres psql -c "CREATE USER smarttravel WITH PASSWORD '${DB_PASS}';"
  log "数据库用户 smarttravel 已创建"
}

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='smarttravel_db'" | grep -q 1 || {
  sudo -u postgres psql -c "CREATE DATABASE smarttravel_db OWNER smarttravel;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE smarttravel_db TO smarttravel;"
  log "数据库 smarttravel_db 已创建"
}

# Save password to env file
ENV_FILE="/opt/smarttravel/.env"
if [ ! -f "$ENV_FILE" ]; then
  JWT_SECRET=$(openssl rand -base64 48)
  cat > "$ENV_FILE" << ENVEOF
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DATABASE_URL="postgresql://smarttravel:${DB_PASS}@127.0.0.1:5432/smarttravel_db"
JWT_SECRET="${JWT_SECRET}"
ENVEOF
  chmod 600 "$ENV_FILE"
  log ".env 文件已生成 (密码已自动填入)"
  warn "数据库密码: ${DB_PASS} (请备份!)"
else
  warn ".env 文件已存在，跳过生成"
fi

# ═══════════════════════════════════════════════════════════
# 8. SECURITY HARDENING — UFW FIREWALL
# ═══════════════════════════════════════════════════════════
log "配置 UFW 防火墙..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# SSH (限制连接频率)
ufw limit 22/tcp comment 'SSH with rate-limit'
# HTTP
ufw allow 80/tcp comment 'HTTP'
# HTTPS (future)
ufw allow 443/tcp comment 'HTTPS'

# Enable firewall
ufw --force enable
log "UFW 防火墙已启用 (开放: 22/80/443)"

# ═══════════════════════════════════════════════════════════
# 9. SECURITY HARDENING — FAIL2BAN (防暴力破解)
# ═══════════════════════════════════════════════════════════
log "配置 Fail2ban..."
cat > /etc/fail2ban/jail.local << 'F2BEOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
banaction = ufw

[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 7200

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/smarttravel_error.log
maxretry = 10
bantime = 3600

[nginx-botsearch]
enabled = true
port = http,https
filter = nginx-botsearch
logpath = /var/log/nginx/smarttravel_access.log
maxretry = 5
bantime = 86400
F2BEOF

systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2ban 已启用 (SSH暴力破解防护 + Nginx请求限制)"

# ═══════════════════════════════════════════════════════════
# 10. SECURITY HARDENING — SSH
# ═══════════════════════════════════════════════════════════
log "加固 SSH 配置..."
SSHD_CONFIG="/etc/ssh/sshd_config"

# Disable root password login (keep key-based)
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin prohibit-password/' "$SSHD_CONFIG"
# Disable empty passwords
sed -i 's/^#*PermitEmptyPasswords.*/PermitEmptyPasswords no/' "$SSHD_CONFIG"
# Max auth attempts
sed -i 's/^#*MaxAuthTries.*/MaxAuthTries 3/' "$SSHD_CONFIG"
# Disable X11 forwarding
sed -i 's/^#*X11Forwarding.*/X11Forwarding no/' "$SSHD_CONFIG"
# Timeout idle sessions
sed -i 's/^#*ClientAliveInterval.*/ClientAliveInterval 300/' "$SSHD_CONFIG"
sed -i 's/^#*ClientAliveCountMax.*/ClientAliveCountMax 2/' "$SSHD_CONFIG"

systemctl restart sshd
log "SSH 已加固 (禁止空密码/限制尝试次数/超时断开)"

# ═══════════════════════════════════════════════════════════
# 11. SECURITY HARDENING — KERNEL (sysctl)
# ═══════════════════════════════════════════════════════════
log "加固内核参数..."
cat > /etc/sysctl.d/99-smarttravel-security.conf << 'SYSEOF'
# Prevent SYN flood attacks
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2

# Prevent IP spoofing
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Disable ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0

# Disable source routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Log suspicious packets
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Protect against time-wait assassination
net.ipv4.tcp_rfc1337 = 1

# Increase file descriptor limit
fs.file-max = 65535
SYSEOF

sysctl -p /etc/sysctl.d/99-smarttravel-security.conf >/dev/null 2>&1
log "内核安全参数已应用 (SYN防洪/IP反欺骗/ICMP限制)"

# ═══════════════════════════════════════════════════════════
# 12. SETUP NGINX CONFIG
# ═══════════════════════════════════════════════════════════
log "配置 Nginx..."
NGINX_CONF="/opt/smarttravel/deploy/nginx.conf"
if [ -f "$NGINX_CONF" ]; then
  cp "$NGINX_CONF" /etc/nginx/sites-available/smarttravel
  ln -sf /etc/nginx/sites-available/smarttravel /etc/nginx/sites-enabled/smarttravel
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  log "Nginx 配置已生效"
else
  warn "Nginx 配置文件未找到，请手动配置"
fi

# ═══════════════════════════════════════════════════════════
# 13. SETUP LOGROTATE (日志轮转)
# ═══════════════════════════════════════════════════════════
log "配置日志轮转..."
cat > /etc/logrotate.d/smarttravel << 'LOGEOF'
/var/log/smarttravel/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 root root
}
LOGEOF
log "日志轮转已配置 (保留14天)"

# ═══════════════════════════════════════════════════════════
# DONE
# ═══════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════"
echo -e "${GREEN}  服务器环境配置完成！${NC}"
echo "═══════════════════════════════════════════════"
echo ""
echo "  安全措施已启用:"
echo "  ✓ UFW 防火墙 (仅开放 22/80/443)"
echo "  ✓ Fail2ban (SSH暴力破解防护)"
echo "  ✓ SSH 加固 (限制登录尝试)"
echo "  ✓ 内核安全参数 (SYN防洪/IP反欺骗)"
echo "  ✓ Nginx 安全头 + 请求限流 + 攻击路径拦截"
echo "  ✓ 日志轮转 (14天保留)"
echo ""
echo "  下一步:"
echo "  1. 上传项目文件到 /opt/smarttravel/"
echo "  2. cd /opt/smarttravel && bash deploy/deploy.sh"
echo ""
warn "重要: 请在云服务商防火墙面板中开放 80 和 443 端口!"
echo ""
