#!/bin/bash

if [ "$(pidof node)" ] 
then
  kill -9 `pgrep -f gzbridge`
  kill -9 `pgrep -f http-server`
fi
