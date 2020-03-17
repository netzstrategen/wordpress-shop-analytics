const eol = require('gulp-eol');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const uglify = require('gulp-uglify');

// Source and dist folders.
const srcScripts = 'assets/scripts/**/*.js';
const distScripts = './dist/scripts';

/**
 * Lints JavaScript files.
 */
gulp.task('eslint', function() {
  const task = gulp.src([
    srcScripts,
    '!node_modules/**',
    '!gulpfile.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format());
  return task;
});

/**
 * Parse, minify and beautify JavaScript files.
 */
gulp.task('scripts', function() {
  const task = gulp.src(srcScripts)
    .pipe(uglify({
      output: { beautify: false }
    }))
    .on('error', function(e){
      console.log(e);
    })
    .pipe(eol('\n'))
    .pipe(gulp.dest(distScripts));
  return task;
});

/**
 * Defines the build Gulp task.
 */
gulp.task('build', gulp.series(
  'eslint',
  'scripts',
), function(cb) {
  cb;
});

/**
 * Watches files and run related tasks if there are changes.
 */
gulp.task('watch', function () {
  const task = gulp.watch(srcScripts, gulp.series(
    'eslint', 'scripts'
  ));
  return task;
});

/**
 * Defines the default Gulp task.
 */
gulp.task('default', gulp.series(
  'build'
), function(cb) {
  cb;
});
