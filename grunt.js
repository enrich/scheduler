/*global module:false*/
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: '<json:package.json>',
    clean: {
      dist: ["dist"]
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
    },
    qunit: {
      files: ['test/**/*.html']
    },
    concat: {
      dist: {
        src: ['src/sched.js'],
        dest: 'dist/js/sched.js'
      }
    },
    copy: {
      dist: {
        files: {
          "dist/" : "html/*",
          "dist/css/" : "css/*"
        }
      }
    },
    min: {
      dist: {
        src: ['<config:concat.dist.dest>'],
        dest: 'dist/js/sched.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        devel: true,
        node: true,
        strict: false
      },
      globals: {}
    },
    uglify: {}
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min copy');

};
