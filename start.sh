#!/bin/sh

exec anyproxy  --intercept --rule /vcr.js --port $PROXY_PORT