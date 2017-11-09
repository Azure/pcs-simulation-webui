#!/usr/bin/env bash
# Copyright (c) Microsoft. All rights reserved.
set -ex

# serve the app via nginx
mkdir -p /app/logs
nginx -g 'daemon off;' -c /app/nginx.conf
