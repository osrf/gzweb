#!/usr/bin/python

import os
import subprocess
import sys

path = sys.argv[1]

files = os.listdir(path)

find_cmd = ['find', path, '-name','*']
files = subprocess.check_output(find_cmd).split()

for file in files:
  try:
    path, filename = os.path.split(file)
    name, format = filename.split(".")[-2:]
    if format.lower() in ['tif', 'tga', 'tiff', 'jpeg', 'jpg', 'gif']:
      dest_path = path.replace('materials/textures', 'meshes')
      cmd = ["convert", file, "%s/%s.png" % (dest_path, name)]
      print cmd
      subprocess.check_call(cmd)
    if format.lower() in ['dae']:
      sed_cmd = ["sed", "-i", "-e", 's/\.tga/\.png/g', "-e",
          's/\.tiff/\.png/g', "-e", 's/\.tif/\.png/g',
          "-e", 's/\.jpg/\.png/g', "-e", 's/\.jpeg/\.png/g',
          "-e", 's/\.gif/\.png/g', file]
      print sed_cmd
      subprocess.check_call(sed_cmd)
  except Exception, e:
      print "error %s" % e
      raise
