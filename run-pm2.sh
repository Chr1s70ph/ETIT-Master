#/bin/env sh

pm2 start ts-node --name ETIT-Master --watch --time --restart-delay 5000 -- -P tsconfig.json index.ts

echo "Sleeping 5 seconds before saving pm2"
sleep 5
# required, for pm2 to work after a reboot
pm2 save
