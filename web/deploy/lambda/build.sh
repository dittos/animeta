#!/bin/sh
set -e

# docker build -t animeta-frontend-lambda .
docker pull gcr.io/ditto-1470749749381/animeta-frontend:latest

cd deploy
rm -rf lambda/dist
mkdir -p lambda/dist
docker run --rm -v $PWD/lambda/dist:/workspace --entrypoint /bin/bash gcr.io/ditto-1470749749381/animeta-frontend:latest -c "tar -cf /workspace/package.tar /app/* && chmod a+rw /workspace/package.tar"

cd lambda/dist
tar -xf package.tar --exclude=*.map
rm -rf package.tar

echo ANIMETA_FRONTEND_DIST_PATH=app/frontend/dist >> .env

zip --symlinks -r package.zip app .env
