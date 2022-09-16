#!/bin/sh
set -e

rm -rf deploy/lambda/dist
mkdir -p deploy/lambda/dist/app

cp -r shared deploy/lambda/dist/app/shared
cp -r frontend-server/dist deploy/lambda/dist/app/frontend-server/dist
cp -r frontend/dist deploy/lambda/dist/app/frontend/dist

echo ANIMETA_FRONTEND_DIST_PATH=app/frontend/dist >> deploy/lambda/dist/.env

cd deploy/lambda/dist
zip --symlinks -r package.zip app .env
