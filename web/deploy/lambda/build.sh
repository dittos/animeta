#!/bin/sh
set -e

# docker build -t animeta-frontend-lambda .
docker pull gcr.io/ditto-1470749749381/animeta-frontend:latest

cd deploy
rm -rf lambda/dist
mkdir -p lambda/dist
docker run --rm -v $PWD/lambda/dist:/workspace --entrypoint /bin/bash gcr.io/ditto-1470749749381/animeta-frontend:latest -c "tar -cf /workspace/package.tar /app/* && chmod a+rw /workspace/package.tar"
cp ../frontend/config.lambda.json lambda/dist/config.json

cd lambda/dist
tar -xf package.tar --exclude=*.map
rm -rf package.tar

echo ANIMETA_FRONTEND_DIST_PATH=app/frontend/dist >> .env
echo ANIMETA_CONFIG_PATH=config.json >> .env

zip --symlinks -r package.zip app config.json .env
