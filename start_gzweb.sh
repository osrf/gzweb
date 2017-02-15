#!/bin/bash

ulimit -c unlimited

PORT=${1:-8080}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

./stop_gzweb.sh

if [ ! -d http/client ]
then
  echo "gzweb not initialized, have you run ./deploy.sh yet?"
  exit
fi


./node_modules/.bin/http-server -p $PORT http/client &

cd gzbridge
./ws_server.js &
