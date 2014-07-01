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
    clean: {
      previous: ['config', 'log']
    },

    // Configuration to be run (and then tested).
    localeapp: {
      pull: {
        key: "your-localeapp.com-api-key-goes-here",
        dest: "locales",
        format: "json"
      },
//      default_options: {
//        options: {
//        },
//        files: {
//          'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123']
//        }
//      },
//      custom_options: {
//        options: {
//          separator: ': ',
//          punctuation: ' !!!'
//        },
//        files: {
//          'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123']
//        }
//      }
    },

    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-debug-task');

  grunt.registerTask('test', ['clean', 'localeapp', 'nodeunit']);
};
