/*
 * grunt-localeapp
 * https://github.com/PredicSis/grunt-localeapp
 *
 * Copyright (c) 2014 Sylvain RAGOT
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    clean: { previous: ['config', 'log'] },

    nodeunit: { tests: ['test/*_test.js'] },

    localeapp: {
      pull: {
        key: "your-localeapp.com-api-key-goes-here",
        dest: "locales",
        format: "json"
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-debug-task');

  grunt.registerTask('test', ['clean', 'localeapp', 'nodeunit']);
};
