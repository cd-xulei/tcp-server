#!/bin/bash -ilex

# npm install
node_modules/.bin/gulp

scp -r tcp-server root@47.106.193.158:/root/tcp-tmp
ssh root@47.106.193.158
cd /root
rm -rf tcp-server
mv ./tcp-tmp tcp-server
pm2 reload all
