#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

for dir in $DIR/../http/client/assets/*/
do
    dir=${dir%*/}
    echo "Creating thumbnail for ${dir##*/}"
    rm -rf $DIR/../http/client/assets/${dir##*/}/thumbnails
    gzserver -s libModelPropShop.so worlds/blank.world --propshop-save "$DIR/../http/client/assets/${dir##*/}/thumbnails" --propshop-model "$DIR/../http/client/assets/${dir##*/}/model.sdf"
    #read -n 1 -s
done
