const path = require('path');

module.exports = {
    apps: [
        {
            name: "Blog",
            script: 'pnpm',
            args: 'start',
            interpreter: process.env.HOME + '/.nvm/versions/node/v22.15.0/bin/node',
            cwd: __dirname,
            env: {
                NODE_ENV: 'production',
                PATH: process.env.HOME + '/.nvm/versions/node/v22.15.0/bin:' + process.env.PATH
            },
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            max_memory_restart: '1K'
        }
    ]
};
