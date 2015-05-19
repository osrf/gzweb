#!/bin/bash

if [ "$(pidof node)" ] 
then
  killall node
fi