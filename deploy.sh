#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

hg pull -u

#
# build the c++ server component
#
rm -rf build
mkdir build
cd build
cmake ..
make -j 8

cd ../gzbridge
node-gyp configure
node-gyp build -d

cd $DIR
