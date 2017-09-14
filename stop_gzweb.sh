#!/bin/sh

kill `pgrep -f http/client`
kill `pgrep -f ws_server`

