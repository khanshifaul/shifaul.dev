module.exports = {
  apps: [
    {
      name: 'backend.shifaul.dev',
      script: 'bun',
      args: 'run start:prod',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
