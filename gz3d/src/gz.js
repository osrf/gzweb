var GZ3D = GZ3D || {
  REVISION : '1'
};

// https://bitbucket.org/osrf/gzweb/issues/136
var guiEvents = new EventEmitter2({ verbose: true });

// Assuming all mobile devices are touch devices.
var isTouchDevice = /Mobi/.test(navigator.userAgent);
