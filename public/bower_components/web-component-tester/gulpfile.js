/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
var concat     = require('gulp-concat');
var gulp       = require('gulp');
var gulpIf     = require('gulp-if');
var jshint     = require('gulp-jshint');
var lazypipe   = require('lazypipe');
var notify     = require('gulp-notify');
var plumber    = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var watch      = require('gulp-watch');
var wrap       = require('gulp-wrap');

var CSS_TO_JS =
    "(function() {\n" +
    "var style = document.createElement('style');\n" +
    "style.textContent = '<%= contents.replace(/'/g, \"\\\\'\").replace(/\\n/g, '\\\\n') %>';\n" +
    "document.head.appendChild(style);\n" +
    "})();";

// Meta tasks

gulp.task('test',  ['test:style']);
gulp.task('build', ['build:browser', 'build:environment']);

gulp.task('watch', function() {
  watch('browser/**/*', function() {
    gulp.start('build:browser');
  });

  watch('environment/**/*', function() {
    gulp.start('build:environment');
  });

  var config = {
    emitOnGlob: false,
    gaze:       {debounceDelay: 10},
  };
  return watch('{runner,browser,environment}/**/*.js', config, function(files) {
    files
      .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
      .pipe(jshintFlow());
  });
});

// Specific tasks

gulp.task('build:browser', function() {
  return gulp.src([
      'vendor/mocha/mocha.js',
      'vendor/mocha/mocha.css',
      'vendor/stacky/lib/parsing.js',
      'vendor/stacky/lib/formatting.js',
      'vendor/stacky/lib/normalization.js',
      // Poor-man's dependency management, for now.
      'browser/index.js',
      'browser/util.js',
      'browser/**/*.{js,css}',
    ])
    .pipe(sourcemaps.init())
    .pipe(gulpIf(/\.css$/, wrap(CSS_TO_JS)))
    .pipe(concat('browser.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('build:environment', function() {
  return gulp.src([
      'vendor/async/lib/async.js',
      'vendor/chai/chai.js',
      'vendor/lodash/lodash.js',
      'vendor/sinon/sinon.js',
      'vendor/sinon-chai/lib/sinon-chai.js',
      'environment/**/*.{js,css}',
    ])
    .pipe(sourcemaps.init())
    .pipe(gulpIf(/\.css$/, wrap(CSS_TO_JS)))
    .pipe(concat('environment.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('test:style', function() {
  return gulp.src('{browser,runner,environment}/**/*.js').pipe(jshintFlow());
});

// Flows

var jshintFlow = lazypipe()
  .pipe(jshint)
  .pipe(jshint.reporter, 'jshint-stylish')
  .pipe(jshint.reporter, 'fail');
