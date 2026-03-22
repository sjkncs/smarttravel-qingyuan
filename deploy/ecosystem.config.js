// PM2 Process Manager Configuration
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "smarttravel-qingyuan",
      script: ".next/standalone/server.js",
      cwd: "/opt/smarttravel",
      instances: 2, // 2 CPU cores
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      // Auto-restart config
      max_memory_restart: "512M", // 2GB total, leave room for Nginx/PG/OS
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: "10s",
      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/var/log/smarttravel/error.log",
      out_file: "/var/log/smarttravel/out.log",
      merge_logs: true,
      log_type: "json",
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 8000,
    },
  ],
};
