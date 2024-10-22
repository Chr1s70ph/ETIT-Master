module.exports = {
  apps: [
    {
      name: 'ETIT-Master',
      script: 'ts-node',
      args: '-P tsconfig.json index.ts',
      watch: true,
      autorestart: true,
      restart_delay: 5000,
      time: true,
    }
  ]
};
