#!/bin/sh
cd frontend/external
npm install
npm run build
cd ../..
npm install frontend/external
