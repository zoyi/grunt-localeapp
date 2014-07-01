/*
 * grunt-localeapp
 * https://github.com/PredicSis/grunt-localeapp
 *
 * Copyright (c) 2014 Sylvain RAGOT
 * Licensed under the MIT license.
 */

'use strict';

var command = require('execSync').exec;
var chalk = require('chalk');
var yaml = require('yamljs');
var fs = require('fs');

module.exports = function(grunt) {

  function _checkLocaleappGem() {
    // localeapp version 0.8.0<br/>
    var version = command('localeapp -v').stdout.slice(0, -1);

    if (version === undefined) {
      grunt.fail.fatal('No localeapp gem installed');
    } else {
      grunt.log.writeln(chalk.green('✔ ') + chalk.gray(version));
    }

    return version.split(' ')[2];
  }

  function _setupProject(key) {
    command('localeapp install ' + key).stdout;
    grunt.log.writeln(chalk.green('✔ ') + 'Key ' + chalk.gray(key) + ' successfully installed');
  }

  function _getLocales() {
    fs.mkdir('config/locales');
    fs.mkdir('log');
    fs.openSync('log/localeapp.yml', 'w');

    // download files
    command('localeapp pull');
    var log = yaml.load('log/localeapp.yml');
    var files = fs.readdirSync('config/locales');
    grunt.log.writeln(chalk.green('✔ ') + files.length + ' file(s) pulled from localeapp.com');
    fs.rmdir('log');

    return {
      polledAt: log.polled_at,
      updatedAt: log.updated_at,
      files: files
    };
  }


  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('localeapp', 'Grunt task for localeapp.com service.', function() {

    // clear previous pulled files
    fs.rmdir('config');

    // check requested output format
    var availableFormats = ['yml', 'json'];
    if (availableFormats.indexOf(this.data.format) === -1) {
      grunt.fail.fatal('There is no support for ' + this.data.format + ' yet. Please use one of the following : ' + availableFormats.join(', ') + '.')
    }

    // retreive locales
    var version = _checkLocaleappGem();
    _setupProject(this.data.key);
    var files = _getLocales();

  });
};
