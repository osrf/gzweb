'use strict'

const path = require('path')
const child_process = require('child_process')
const gazeboInfo = child_process.execSync('ls -l `which gazebo`').toString().trim()

let protoDir = null

// returns the location of a protobuf full path
// proto is the short file name of the message
function getProtoPath(proto) {

  if (!protoDir) {
    const toks = gazeboInfo.split(' ')
    // console.log('tokens',toks)
    const gazeboDir = path.dirname(toks[8])
    // console.log(gazeboDir)
    const verToks = toks[10].split('-')
    // console.log('vertoks', verToks)
    const version = verToks[1]
    // console.log('version', version)
    const maj = version.split('.')[0]
    // console.log('maj', maj)
    protoDir = path.dirname(gazeboDir) + '/include/gazebo-' + maj +
     '/gazebo/msgs/proto'

  }
  return protoDir + '/' +  proto + '.proto'
}

exports.getProtoPath = getProtoPath;