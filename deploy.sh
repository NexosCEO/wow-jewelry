#!/bin/bash
# Deploy to Lightsail
set -e

SERVER="ubuntu@34.202.32.194"
KEY="/tmp/lightsail-key.pem"
APP_DIR="/home/ubuntu/wow-jewelry"

echo "=== Deploying WOW Jewelry ==="

ssh -i $KEY $SERVER "cd $APP_DIR && git pull origin main && npm ci && npm run build && sudo systemctl restart wow-jewelry"

echo "=== Deploy complete ==="
echo "Site: https://wowbydany.com"
