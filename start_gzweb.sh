#!/bin/bash

ulimit -c unlimited

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

./stop_gzweb.sh

if [ ! -d http/client ]
then
  echo "gzweb not initialized, have you run ./deploy.sh yet?"
  exit
fi


./node_modules/.bin/http-server http/client &

cd gzbridge
./gzbridge/gzbridge.js &
