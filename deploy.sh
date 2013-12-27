#!/bin/bash



DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

hg pull
hg up

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

if [ "$1" == "-m" ]; then  # build a local model database

    # Temporal directory for the repository
    TMP_DIR=`mktemp -d`
    cd $TMP_DIR

    # If no arg given then downlaod from gazebo_models repo
    if [ "x$2" == "x" ]; then

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
    
    echo "gather all models on the local machine"

    ./get_local_models.py $DIR/http/client/assets
    ./webify_models.py $DIR/http/client/assets
    
    
else
  echo "Not cloning the model repo"
fi

echo "Done"



