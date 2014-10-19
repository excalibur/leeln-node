'use strict';

var gulp = require('gulp');

var app_dir = "app";
var public_dir = app_dir + "/public";
var styles_dir = public_dir + "/styles";
var scripts_dir = public_dir + "/scripts";
var images_dir = public_dir + "/images";
var fonts_dir = public_dir + "/fonts";
var tmp_dir = ".tmp";
var dist_dir = "dist";

// load plugins
var $ = require('gulp-load-plugins')();
var gutil = require('gulp-util');
//==============styles===============

gulp.task('scss', function () {
    return gulp.src(styles_dir + '/**/*.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest(tmp_dir + "/public/styles"))
        .pipe($.size());
});

gulp.task('less', function () {
    return gulp.src([
    	styles_dir +'/**/*.less', 
    	"!" + styles_dir +"/**/_*.less",
    	"!" + styles_dir +"/vendors/**", 
    	"!" + styles_dir +"/base/**"
    	])
    .pipe($.less({
      paths: [ public_dir + '/bower_components' ]
    }))
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest(tmp_dir + "/public/styles"))
    .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src(images_dir +'/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(dist_dir + 'public/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return $.bowerFiles()
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest(dist_dir + 'public/fonts'))
        .pipe($.size());
});

gulp.task('styles', ['scss', 'less']);


//=============scripts===============

gulp.task('js', function () {
    return gulp.src(scripts_dir + '/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest(tmp_dir + '/public/scripts'))
        .pipe($.size());
});

gulp.task('coffee', function() {
    return gulp.src(scripts_dir + "/**/*.coffee")
    .pipe($.coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest(tmp_dir + '/public/scripts'))
    .pipe($.size());
});

gulp.task('scripts', ['js', 'coffee']);

//============================
gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

return gulp.src(app_dir + '/*.html')
        .pipe($.useref.assets({searchPath: "{" + tmp_dir +"," + app_dir + "}"}))
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest(dist_dir + "/*.html"))
        .pipe($.size());


});

gulp.task('extras', function () {
    return gulp.src(['app/*.*', '!app/*.html'], { dot: true })
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts', 'extras']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static(app_dir))
        .use(connect.static(tmp_dir))
        .use(connect.directory(app_dir));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});
var nodemon = require('gulp-nodemon'),
  livereload = require('gulp-livereload');
gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    ext: 'js ejs',
  }).on('restart', function () {
    setTimeout(function () {
      livereload.changed();
    }, 500);
  });
});
var browserSync = require("browser-sync");
gulp.task('browser-sync', function() {
	 var files = [
      '**/*.html'
   ];

    browserSync({
        server: {
            baseDir: "./"
        }
    });
});


gulp.task('bs-reload', function () {
    browserSync.reload();
});
gulp.task('a', ['browser-sync'], function () {
    gulp.watch("*.html", ['bs-reload']);
});

gulp.task('serve', ['connect', 'styles'], function () {
    require('opn')('http://localhost:9000');
});



// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src( styles_dir + '/**/*.scss')
        .pipe(wiredep({
            directory: public_dir + '/bower_components'
        }))
        .pipe(gulp.dest(styles_dir));

    gulp.src(app_dir + '/*.html')
        .pipe(wiredep({
            directory: public_dir + '/bower_components'
        }))
        .pipe(gulp.dest(app_dir));
});

gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    // watch for changes

   gulp.watch([
        app_dir + '/*.html',
        styles_dir + '/**/*.css',
        scripts_dir + '/**/*.js',
        images_dir + '/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch(styles_dir + '/**/*.scss', ['scss']);
    gulp.watch(styles_dir + '/**/*.less', ['less']);
    gulp.watch(scripts_dir + '/**/*.js', ['js']);
    gulp.watch(scripts_dir + '/**/*.coffee', ['coffee']);
    gulp.watch(images_dir + '/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});
