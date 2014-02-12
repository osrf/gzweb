#!/bin/bash

gzwebDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $gzwebDir

gzcoarse=${gzwebDir}/build/tools/gzcoarse

if [ ! -f "$gzcoarse" ]; then
  echo "Error: gzcoarse executable not found, exiting."
  exit
fi

echo "gzcoarse found: $gzcoarse."

if [ -z "$1" ]; then
  echo "Error: Please specify the assets path as argument."
  exit
fi


if [ ! -d "$1" ] && [ ! -f "$1" ]; then
  echo "Error: $1 does not exist."
fi

assetDir="$1";
echo "Assets directory: $1"

echo "Removing old coarse dae files."

# Delete coarse meshes if exist
find $assetDir -type f -name "*_coarse.dae" -exec rm -f {} \;

# Run gzcoarse on all dae meshes
function coarseAllDae {
  echo -e "\e[32mEntered \e[39m$2\e[32m directory.\e[39m"

  # Coarsen all dae
  for file in `find $assetDir -type f -name "*.dae"`; do
    if [ -f "${file}" ]; then # if not a file, skip
      echo -e "\e[33mCoarsening \e[39m$file"
      $gzcoarse $file 20
    fi
  done
}

echo "Simplifying meshes"
coarseAllDae $1

echo "Done!"
