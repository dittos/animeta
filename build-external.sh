#!/bin/sh
git submodule update --remote frontend/external
cd frontend/external
npm install
npm run build
cd ../..
npm install frontend/external