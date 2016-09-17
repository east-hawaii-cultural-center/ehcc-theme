var gulp = require('gulp');
var gutil = require('gulp-util');
var ftp = require('vinyl-ftp');
var creds = require('./creds');

var compass = require('gulp-compass');
 
gulp.task('compass', function() {
  gulp.src('./sass/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: 'css',
      sass: 'sass'
    }))
    .pipe(gulp.dest('app/assets/temp'));
});

gulp.task('deploy', function () {
	console.log(creds);

    var conn = ftp.create( {
        host: creds.host,
        user: creds.user,
        password: creds.password,
        port: creds.port,
        parallel: 10,
        log: gutil.log
    });

    var globs = [
        'images/**',
        'css/**',
        'js/**',
        'fonts/**',
        'templates/**',
        'favicon.ico',
        '*.php',
        '*.info',
    ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src(globs, {base: '.', buffer: false})
        .pipe(conn.newer(creds.remote)) // only upload newer files
        .pipe(conn.dest(creds.remote));//'/public_html'
});

// gulp.task('default', function () {
// 	console.log('Hello Gulp!');
// });

// gulp.task('ftp-deploy-watch', function() {

//     var conn = getFtpConnection();

//     gulp.watch(localFilesGlob)
//     .on('change', function(event) {
//       console.log('Changes detected! Uploading file "' + event.path + '", ' + event.type);

//       return gulp.src( [event.path], { base: '.', buffer: false } )
//         .pipe( conn.newer( remoteFolder ) ) // only upload newer files 
//         .pipe( conn.dest( remoteFolder ) )
//       ;
//     });
// });