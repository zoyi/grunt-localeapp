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

  var version;

  /**
   * Runs _localeapp -v_ cli command to check if the gem is installed.
   *
   *  This command return something like _localeapp version 0.8.0 _. Note that this returned string
   *  ends with a newline.
   *
   * @author Sylvain RAGOT {01/07/2014}
   */
  function _checkLocaleappGem() {
    grunt.verbose.writeln('Looking for localeapp gem');

    // localeapp version 0.8.0<br/>
    version = command('localeapp -v').stdout.slice(0, -1);

    if (version === undefined) {
      grunt.fail.fatal('No localeapp gem installed');
    } else {
      grunt.log.writeln(chalk.green('✔ ') + 'localeapp gem installed (' + chalk.gray('v' + version.split(' ')[2]) + ')');
    }

    grunt.verbose.writeln('----------------------------------');
  }

  /**
   * Add the project key to be able to interact with it.
   *
   *  A key identifies a user on localeapp service and a project. So, there is a key by project.
   *
   * @param {String} key
   * @author Sylvain RAGOT {01/07/2014}
   */
  function _setupProject(key) {
    grunt.verbose.writeln('Verifying api key');

    var log = command('localeapp install ' + key).stdout;
    grunt.verbose.writeln(chalk.gray(chalk.italic(log)));

    if (log.slice(0,5) === 'error') {
      grunt.fail.fatal('Your API key seems to be invalid');
    } else {
      grunt.log.writeln(chalk.green('✔ ') + 'Key ' + chalk.gray(key) + ' valid');
    }

    grunt.verbose.writeln('----------------------------------');
  }

  /**
   * Really fetch locales files
   *
   *  Runs _localeapp pull_ cli command which ask remote servers to download files into yml format.
   *  It also creates a log file with `polledAt` and `updatedAt` values.
   *
   * @author Sylvain RAGOT {01/07/2014}
   */
  function _getLocales() {
    grunt.verbose.writeln('Retreiving locale files');

    grunt.verbose.write(' | creating temp "config/locales" output folder ... ');
    fs.mkdir('config/locales');
    grunt.verbose.writeln(chalk.green('OK'));

    grunt.verbose.write(' | creating temp "log" folder ... ');
    fs.mkdir('log');
    grunt.verbose.writeln(chalk.green('OK'));

    grunt.verbose.write(' | creating temp "log/localeapp.yml" log file ... ');
    fs.openSync('log/localeapp.yml', 'w');
    grunt.verbose.writeln(chalk.green('OK'));

    // download files
    grunt.verbose.write(' | fetching locales from localeapp.com ... ');
    var log = command('localeapp pull').stdout;
    var files = fs.readdirSync('config/locales');
    grunt.verbose.writeln(chalk.green(files.length + ' file(s) pulled'));
    grunt.verbose.writeln(chalk.gray(chalk.italic(log)));

    grunt.log.writeln(chalk.green('✔ ') + files.length + ' locale(s) pulled from localeapp.com : (' + chalk.blue(files.join(', ')) + ')');

    grunt.verbose.writeln('----------------------------------');

    log = yaml.load('log/localeapp.yml');
    return {
      polledAt: log.polled_at,
      updatedAt: log.updated_at,
      files: files
    };
  }

  /**
   * Create a JSON object from YML downloaded locales.
   *
   *  In fact it's not really a JSON file, because it creates a javascript varaible (ex: var fr_FR = { ... })
   *  In addition, it adds some heading comments with gem version, dates, ...
   *
   * @param {Object}  files       Returned object from _getLocales() function
   * @param {Boolean} withLocale  Keep or remove the first yml key containaing the locale name (fr_FR: USER : ...)
   * @author Sylvain RAGOT {01/07/2014}
   */
  function _formatJSON(files, withLocale) {
    grunt.verbose.writeln('Formatting files to JSON');
    var withLocale = withLocale || false;
    var locales = files.files;

    for(var i in locales) {
      var locale = locales[i].split('.yml')[0];   // en_US.yml => en_US
      var file = 'config/locales/' + locale;
      var json = (withLocale === true)
        ? yaml.load(file + '.yml')
        : yaml.load(file + '.yml')[locale];

      fs.rename(file + '.yml', file + '.js', function(err) {
        if ( err ) console.log('ERROR: ' + err);
      });

      var fileContent = '// ' + version + '\n';
      fileContent += '// polled at : ' + new Date(files.polledAt * 1000) + '\n';
      fileContent += '// updated at : ' + new Date(files.updatedAt * 1000) + '\n';
      fileContent += 'var ' + locale + ' = ' + JSON.stringify(json, null, 4);
      grunt.file.write(file + '.js', fileContent);
    }
  }

  function _clean(folders) {
    for (var i in folders) {
      if (grunt.file.isDir(folders[i])) {
        grunt.file.delete(folders[i]);
      }
    }
  }


  grunt.registerMultiTask('localeapp', 'Grunt task for localeapp.com service.', function() {
    _clean(['config', 'log']);

    // check requested output format
    var availableFormats = ['yml', 'json'];
    if (availableFormats.indexOf(this.data.format) === -1) {
      grunt.fail.fatal('There is no support for ' + this.data.format + ' yet. Please use one of the following : ' + availableFormats.join(', ') + '.')
    }

    // retreive locales
    _checkLocaleappGem();
    _setupProject(this.data.key);
    var files = _getLocales();

    // format output
    switch (this.data.format) {
      case 'js':
      case 'json':
        _formatJSON(files);
        break;

      case 'yml':
      case 'yaml':
      default:
        break;
    }

    grunt.verbose.writeln('----------------------------------');

    // copy files to destination folder
    var locales = fs.readdirSync('config/locales');
    for (var i in locales) {
      grunt.file.copy(
        'config/locales/' + locales[i],
        this.data.dest + locales[i],
        { encoding: 'utf8' }
      );
    }
    var destFiles = fs.readdirSync(this.data.dest);
    grunt.log.writeln(chalk.green('✔ ') + destFiles.length + ' locale(s) copied into ' + chalk.blue(this.data.dest) + '  : (' + chalk.blue(destFiles.join(', ')) + ')');
    grunt.verbose.writeln('----------------------------------');

    // remove temporary files
    _clean(['config', 'log']);
  });
};
