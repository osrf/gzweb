### Ubuntu

 1. Install Nodejs. version >= 0.8.0. http://nodejs.org/
 2. Install Grunt. http://gruntjs.com/
 2. Install Grunt's package manager, `npm`.
 3. Install the Grunt tasks specific to this project
   * `cd /path/to/gzweb/gz3d/utils/`
   * `npm install .`

### Build with Grunt

 1. `cd /path/to/gzweb/gz3d/utils/`
 2. `grunt build`

 `grunt build` will concatenate and minimize the files under src and replace gzweb.js and gzweb.min.js in the `gzweb/gz3d/build` directory.
