'use strict';
// use gulp to compile less, sass to css coffee script to js and so on

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();
var mainBowerFiles = require('main-bower-files');

// less and sass

gulp.task('scss', function () {
    return  gulp.src('app/public/styles/**/*.{scss,sass}')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            // fixed some kind of mystery
            "sourcemap=none": true
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('app/.tmp/styles'))
        .pipe($.size());
});

gulp.task('less', function () {
    return gulp.src(["app/public/styles/**/*.less", "!app/public/styles/**/_*.less"])
        .pipe($.less({
            paths: [ 'app/public/bower_components' ]
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest("app/.tmp/styles"))
        .pipe($.size());
});

gulp.task('styles', ['scss', 'less']);

gulp.task('js', function () {
    return gulp.src('app/public/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe(gulp.dest('app/.tmp/scripts'))
        .pipe($.size());
});

gulp.task('coffee', function() {
    return gulp.src("app/public/scripts/**/*.coffee")
        .pipe($.coffee({bare: true}))
        .pipe(gulp.dest('app/.tmp/scripts'))
        .pipe($.size());
});

gulp.task('scripts', ['js', 'coffee']);


gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    var assets = $.useref.assets({searchPath: '{app/.tmp,app/public}'});
    return gulp.src('app/views/*.hbs')
        .pipe(assets)
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if('*.js', gulp.dest('dist/public')))
        .pipe($.if('*.css', gulp.dest('dist/public')))
        .pipe($.if('*.hbs', gulp.dest('dist/views')))
        .pipe($.size());
});



gulp.task('images', function () {
    return gulp.src('app/public/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/public/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    gulp.src(mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/public/fonts'))
        .pipe($.size());

    return gulp.src(['app/public/fonts/**/*.{eot,svg,ttf,woff}'], { dot: true })
        .pipe(gulp.dest('dist/public/fonts'));
});

gulp.task('extras', function () {

    gulp.src(['package.json'], { dot: true })
        .pipe(gulp.dest('dist'));

     gulp.src(['app/*.*', 'app/*', '!app/public'], { dot: true })
        .pipe(gulp.dest('dist'));

    return gulp.src(['app/public/*.*'], { dot: true })
        .pipe(gulp.dest('dist/public'));
});

gulp.task('clean', function () {
    return gulp.src(['app/.tmp', 'dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts', 'extras']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});


gulp.task('express', function() {
    var debug = require('debug')('leeln-node');
    var app = require('./app/app');

    app.set('port', process.env.PORT || 3000);

    var browserSync = require('browser-sync');

    var server = app.listen(app.get('port'), function() {
        debug('Express server listening on port ' + server.address().port);
        listening();
    });

    function listening () {
        browserSync({
            open: false,
            proxy: 'localhost:' + server.address().port,
            files: ['app/public/**/*.{js,css,font}', 'app/views/**/*.hbs', 'app/.tmp/**/*.{js,css,font}']
        });
    }
});


gulp.task('serve', ['styles', 'scripts', 'express'], function () {
    require('opn')('http://localhost:3001');
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/public/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/public/bower_components'
        }))
        .pipe(gulp.dest('app/public/styles'));

    gulp.src('app/public/styles/*.less')
        .pipe(wiredep({
            directory: 'app/public/bower_components'
        }))
        .pipe(gulp.dest('app/public/styles'));

    gulp.src('app/views/**/*.hbs')
        .pipe(wiredep({
            directory: 'app/public/bower_components',
            ignorePath: '../public'
        }))
        .pipe(gulp.dest('app/views'));
});

gulp.task('watch', ['express', 'serve'], function () {

    gulp.watch('app/public/styles/**/*.{scss,sass}', ['styles']);
    gulp.watch('app/public/scripts/**/*.{js,coffee}', ['scripts']);
    gulp.watch('app/public/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});



