var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    shell = require('gulp-shell'),
    traceur = require('gulp-traceur'),
    browserSync = require('browser-sync').create(),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    gls = require('gulp-live-server'),
    server;


// run init tasks
gulp.task('default', ['dependencies', 'js', 'node', 'html', 'css']);

// run development task
gulp.task('dev', ['watch', 'serve']);

// serve the build dir
gulp.task('serve', ['express', 'bs']);

// start express server
gulp.task('express', function () {
  server = gls.new('build/server/app.js');
  server.start();
});

// init browsersync
gulp.task('bs', function () {
  browserSync.init({
    server: {
      baseDir: "./build/client",
    },
    ui: {
      port: 9001
    },
    port: 9000,
    notify: false
  });
});

// watch for changes and run the relevant task
gulp.task('watch', function () {
  gulp.watch('server/**/*.js', ['node', function() {
    server.start();
  }]);

  gulp.watch('client/**/*.js', ['js']);
  gulp.watch('client/**/*.html', ['html']);
  gulp.watch('client/**/*.css', ['css']);
});

// move dependencies into build dir
gulp.task('dependencies', function () {
  return gulp.src([
    'node_modules/gulp-traceur/node_modules/traceur/bin/traceur-runtime.js',
    'node_modules/systemjs/dist/system-csp-production.src.js',
    'node_modules/systemjs/dist/system.js',
    'node_modules/reflect-metadata/Reflect.js',
    'node_modules/angular2/bundles/angular2.js'
  ])
    .pipe(gulp.dest('build/client/lib'));
});

// transpile & move js
gulp.task('js', function () {
  return gulp.src('client/**/*.js')
    .pipe(rename({
      extname: ''
    }))
    .pipe(traceur({
      modules: 'instantiate',
      moduleName: true,
      annotations: true,
      types: true,
      memberVariables: true
    }))
    .pipe(rename({
      extname: '.js'
    }))
    .pipe(gulp.dest('build/client'))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('node', function() {
  return gulp.src('server/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(gulp.dest('build/server', browserSync.reload()))
});

// move html
gulp.task('html', function () {
  return gulp.src('client/**/*.html')
    .pipe(gulp.dest('build/client', browserSync.reload()))
});

// move css
gulp.task('css', function () {
  return gulp.src('client/**/*.css')
    .pipe(gulp.dest('build/client', browserSync.stream()))
});
