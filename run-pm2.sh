#/bin/env sh

pm2 start ts-node --name ETIT-Master --watch --time --restart-delay 5000 -- -P tsconfig.json index.ts
