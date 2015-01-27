#!/bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

cd $DIR/gz3d/utils
grunt build
echo -e "\e[34mgz3d.js and gz3d.min.js created\e[39m"
cd ../../build
cmake ..
echo -e "\e[34mFiles copied to http directory\e[39m"
if [ "$1" == "-d" ]; then
  cd ../gz3d/utils
  grunt jsdoc
  echo -e "\e[34mDocumentation updated\e[39m"
fi
