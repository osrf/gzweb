#!/bin/sh

kill -9 `pgrep -f http/client`
kill -9 `pgrep -f ws_server`

