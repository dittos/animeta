#!/bin/sh
git submodule update --remote frontend/external
./build-external.sh
