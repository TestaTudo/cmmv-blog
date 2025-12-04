const path = require('path');

const NODE_PATH = '/root/.nvm/versions/node/v22.15.0';
const NODE_BIN = NODE_PATH + '/bin';

module.exports = {
    apps: [
        {
            name: "Blog",
            script: NODE_BIN + '/pnpm',
            args: 'start',
            interpreter: NODE_BIN + '/node',
            cwd: __dirname,
            env: {
                NODE_ENV: 'production',
                PATH: NODE_BIN + ':/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
                HOME: '/root'
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
