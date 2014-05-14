#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

for dir in $DIR/../http/client/assets/*/
do
    dir=${dir%*/}
    echo "Creating thumbnail for ${dir##*/}"
    rm -rf $DIR/../http/client/assets/${dir##*/}/thumbnails
    if [[ -f $DIR/../http/client/assets/${dir##*/}/model.sdf ]]; then
	# generate thumbnails with green bg
        gzserver -s libModelPropShop.so $DIR/green.world --propshop-save "$DIR/../http/client/assets/${dir##*/}/thumbnails" --propshop-model "$DIR/../http/client/assets/${dir##*/}/model.sdf"
	# make green bg transparent
	convert $DIR/../http/client/assets/${dir##*/}/thumbnails/1.png -fuzz 30% -transparent '#00ff00' $DIR/../http/client/assets/${dir##*/}/thumbnails/0.png
	# crop transparent ends
	convert $DIR/../http/client/assets/${dir##*/}/thumbnails/0.png -trim $DIR/../http/client/assets/${dir##*/}/thumbnails/0.png
	# add shadow
	convert -background none -fill black \
              $DIR/../http/client/assets/${dir##*/}/thumbnails/0.png \
          \( +clone -background black  -shadow 100x10+0+0 \) +swap \
          -background none   -layers merge +repage  $DIR/../http/client/assets/${dir##*/}/thumbnails/0.png
    fi
done
