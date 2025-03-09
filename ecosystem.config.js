// pm2.config.js
module.exports = {
  apps: [
    {
      name: 'yd-app',
      script: './app.ts',
      instances: 1,
      exec_mode: 'cluster',
      interpreter: './node_modules/.bin/ts-node', // 使用本地 ts-node
      autorestart: true,
      watch: true,
      env: {
        NODE_ENV: 'development',
        TS_NODE_PROJECT: './tsconfig.json',
      },
      env_production: {
        NODE_ENV: 'production',
        TS_NODE_PROJECT: './tsconfig.json',
      },
      error_file: './logs/yd-app-error.log',
      out_file: './logs/yd-app-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
