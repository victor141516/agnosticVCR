#!/bin/sh

exec anyproxy --silent --intercept --rule /vcr.js --port $PROXY_PORT
