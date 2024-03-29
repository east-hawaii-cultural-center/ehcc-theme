var gulp = require('gulp');
var gutil = require('gulp-util');
var ftp = require('vinyl-ftp');
var creds = require('./creds');

//Local files globs:
var globs = [
  'images/**',
  'css/**',
  'sass/**',
  'js/**',
  'fonts/**',
  'templates/**',
  'favicon.ico',
  '*.php',
  '*.info',
];

// helper function to build an FTP connection based on our configuration
function getFtpConnection() {  
  return ftp.create( {
    host: creds.host,
    user: creds.user,
    password: creds.password,
    port: creds.port,
    parallel: 10,
    log: gutil.log
  });
}
gulp.task('compile', function() {
  var compass = require('gulp-compass');
  var postcss      = require('gulp-postcss');
  // var sourcemaps   = require('gulp-sourcemaps');
  var autoprefixer = require('autoprefixer');

  return gulp.src('./sass/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: 'css',
      sass: 'sass'
    }))
    // .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(postcss([ autoprefixer() ]))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('css'));
});

gulp.task('deploy', function () {
  var conn = getFtpConnection();

  // using base = '.' will transfer everything to /public_html correctly
  // turn off buffering in gulp.src for best performance

  return gulp.src(globs, { base: '.', buffer: false })
    //.pipe(conn.newer(creds.remote)) // only upload newer files
    .pipe(conn.dest(creds.remote));//'/public_html'
});

gulp.task('watch', gulp.series('compile'), function() {
  gulp.watch(['./sass/*.scss', './sass/**/*.scss'], gulp.series('compile'));

  // gulp.watch(globs, ['deploy']); //If we do this, it would upload every thing any time you save something...
  var conn = getFtpConnection();
  gulp.watch(globs)
  .on('change', function(event) {
    console.log('Changes detected! Uploading file "' + event.path + '", ' + event.type);

    //Only upload the changed files:
    return gulp.src( [ event.path ], { base: '.', buffer: false } )
      .pipe(conn.newer(creds.remote)) // only upload newer files 
      .pipe(conn.dest(creds.remote))
    ;
  });
});

// gulp.task('default', function () {
//   gulp.src('./sass/*.scss').pipe(pipeTest());
// });

