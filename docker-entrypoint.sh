#!/bin/bash
set -e

cp -r /app/animeta/static/* /app/static/

exec "$@"
