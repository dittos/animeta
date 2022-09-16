#!/bin/bash
set -e

rm -rf deploy/lambda/dist
mkdir -p deploy/lambda/dist/app/{frontend-server,frontend}

cp -r frontend-server/dist deploy/lambda/dist/app/frontend-server/
cp -r frontend/dist deploy/lambda/dist/app/frontend/

echo ANIMETA_FRONTEND_DIST_PATH=app/frontend/dist >> deploy/lambda/dist/.env

cd deploy/lambda/dist
zip --symlinks -r package.zip app .env
