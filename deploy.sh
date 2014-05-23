#!/bin/bash

usage()
{
cat << EOF
OPTIONS:
   -h      Show this message
   -m      Build a local model database. 
           Option "local" to use only local models.
   -c      Create coarse versions of all models in the local database 
EOF
exit
}


MODELS=
LOCAL=
COARSE=
GetOpts() 
{
  branch=""
  argv=()
  while [ $# -gt 0 ]
  do
    opt=$1
    shift
    case ${opt} in
        -m)
          MODELS=true
          echo "Build a local model database."
          if [ $# -eq 0 -o "${1:0:1}" = "-" ]
          then
            echo "Downlaod from gazebo_models repository."
          fi
          if [[ "$1" == "local" ]]
          then
            LOCAL=true
            echo "Only local models."
            shift
          fi
          ;;
        -c)
          COARSE=true
          echo "Simplify models on local database."
          ;;
        *)
          usage
          argv+=(${opt})
          ;;
    esac
  done 
}

GetOpts $*

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# Install node modules
npm install

#
# build the c++ server component
#
rm -rf build
mkdir build
cd build

cmake ..
make -j 8

cd ../gzbridge
$DIR/node_modules/.bin/node-gyp configure
$DIR/node_modules/.bin/node-gyp build -d

cd $DIR

# build a local model database
if [[ $MODELS ]]
then
  # Temporal directory for the repository
    TMP_DIR=`mktemp -d`
    cd $TMP_DIR
  
  # If no arg given then downlaod from gazebo_models repo
  if [[ -z $LOCAL ]]
  then
    echo -n "Downloading gazebo_models..."
    hg clone https://bitbucket.org/osrf/gazebo_models

    echo "Download complete"
    cd gazebo_models
    mkdir build
    cd build
    echo -n "Installing gazebo_models..."
    cmake .. -DCMAKE_INSTALL_PREFIX=$DIR/http/client
    make install > /dev/null 2>&1
    echo "Install complete"

    # Remove temp dir
    rm -rf $TMP_DIR
    rm -rf $DIR/http/client/assets
    mv $DIR/http/client/models $DIR/http/client/assets
  fi

  cd $DIR

  echo "Gather all models on the local machine"

  ./get_local_models.py $DIR/http/client/assets
  ./webify_models.py $DIR/http/client/assets

else
  echo "Not cloning the model repo"
fi

# build a local model database
if [[ $COARSE ]]
then
  ./coarse_meshes.sh 50 http/client/assets/
fi

echo "Done"

