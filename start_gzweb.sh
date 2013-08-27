#!/bin/bash

ulimit -c unlimited

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

./stop_gzweb.sh

http-server http/client &

cd gzbridge
./ws_server.js &
