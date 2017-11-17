module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      build: {
        src  : ['gz3d/src/*.js', 'gz3d/src/**/*.js'],
        dest : 'gz3d/build/gz3d.js'
      },
      build_sdfviewer: {
        src: [
        'gz3d/client/js/include/three.js', 'gz3d/client/js/include/three.compat.js',
        'gz3d/client/js/include/OrbitControls.js', 'gz3d/client/js/include/Detector.js',
        'gz3d/client/js/include/eventemitter2.js', 'gz3d/client/js/include/ColladaLoader.js',
        'gz3d/client/js/include/OBJLoader.js', 'gz3d/client/js/include/MTLLoader.js',
        'gz3d/client/js/include/xml2json.js', 'gz3d/src/gz*.js', '!gz3d/src/gziface.js',
        '!gz3d/src/gzgui.js'
        ],
        dest: 'gz3d/build/SDFViewer.lib.js'
      },
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: [
        'Gruntfile.js',
        'gz3d/build/gz3d.js'
      ]
    },
    uglify: {
      options: {
        report: 'min'
      },
      build: {
        src: 'gz3d/build/gz3d.js',
        dest: 'gz3d/build/gz3d.min.js'
      }
    },
    watch: {
      dev: {
        options: {
          interrupt: true
        },
        files: [
          'gz3d/src/*.js',
          'gz3d/src/**/*.js'
        ],
        tasks: ['concat']
      },
      build_and_watch: {
        options: {
          interrupt: true
        },
        files: [
          'Gruntfile.js',
          '.jshintrc',
          'gz3d/src/*.js',
          'gz3d/src/**/*.js'
        ],
        tasks: ['build']
      }
    },
    clean: {
      options: {
        force: true
      },
      doc: ['doc']
    },
    jsdoc: {
      jsdoc: './node_modules/.bin/jsdoc',
      doc: {
        src: [
          'gz3d/src/*.js',
          'gz3d/src/**/*.js'
        ],
        options: {
          destination: 'doc'
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('dev', ['concat', 'watch']);
  grunt.registerTask('build', ['concat', 'jshint', 'uglify']);
  grunt.registerTask('build_and_watch', ['watch']);
  grunt.registerTask('doc', ['clean', 'jsdoc']);
};
