/* =========================================================
  Import
========================================================= */
/* ---------------------------------------------------------
  common
--------------------------------------------------------- */
const gulp = require('gulp');
const browserSync = require('browser-sync');
const ssi = require('connect-ssi');
const del = require('del');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const cache = require('gulp-cached');
const progeny = require('gulp-progeny');
const diff = require('gulp-diff-build');

/* ---------------------------------------------------------
  pug
--------------------------------------------------------- */
const pug = require('gulp-pug');
const fs = require('fs');
const data = require('gulp-data');

/* ---------------------------------------------------------
  sass
--------------------------------------------------------- */
const sass = require('gulp-sass');
const nodesass = require('node-sass');
sass.compiler = nodesass;
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const gcmq = require('gulp-group-css-media-queries');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const uncss = require('postcss-uncss');
const cssImport = require('postcss-import');

/* ---------------------------------------------------------
  javascript
--------------------------------------------------------- */
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const webpackDevConfig = require('./webpack.dev');
const webpackProdConfig = require('./webpack.prod');

/* ---------------------------------------------------------
  image
--------------------------------------------------------- */
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const changed = require('gulp-changed');

/* =========================================================
  settings
========================================================= */
const paths = {
  sass: [
    './_src/assets/sass/*.scss',
    './_src/assets/sass/**/*.scss',
    './_src/assets/sass/**/**/*.scss',
  ],
  sassDist: './_dist/assets/css/',
  css: ['./_dist/assets/css/*.css'],
  pug: [
    './_src/*.pug',
    './_src/**/*.pug',
    './_src/**/**/*.pug',
    '!./_src/_*.pug',
    '!./_src/**/_*.pug',
    '!./_src/**/**/_*.pug',
  ],
  pugComponents: ['./_src/_*.pug', './_src/**/_*.pug', './_src/**/**/_*.pug'],
  pugDist: './_dist/',
  html: ['./_src/*.html', './_src/**/*.html'],
  htmlDist: ['./_dist/*.html', './_dist/**/*.html'],
  php: ['./_src/*.php', './_src/**/*.php'],
  phpDist: './_dist/',
  js: ['./_src/assets/js/*.js', './_src/assets/js/**/*.js'],
  jsDist: './_dist/assets/js/',
  image: ['./_src/assets/images/**/*'],
  imageDist: './_dist/assets/images/',
  dist: './_dist/',
  meta: './_src/_data/meta.json',
};

/* =========================================================
  Task
========================================================= */
/* ---------------------------------------------------------
  pug
--------------------------------------------------------- */
function pugFunc(done) {
  const option = {
    pretty: true,
  };
  return gulp
    .src(paths.pug)
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>'),
      }),
    )
    .pipe(
      data(function() {
        return JSON.parse(fs.readFileSync(paths.meta));
      }),
    )
    .pipe(pug(option))
    .pipe(gulp.dest(paths.pugDist))
    .pipe(browserSync.reload({ stream: true }));
}

/* ---------------------------------------------------------
  sass
--------------------------------------------------------- */
function sassFunc() {
  const plugins = [
    cssImport({
      path: ['node_modules'],
    }),
  ];
  return gulp
    .src(paths.sass)
    .pipe(
      plumber({
        errorHandler: notify.onError('<%= error.message %>'),
      }),
    )
    .pipe(sassGlob())
    .pipe(
      sass({
        outputStyle: 'expanded',
      }),
    )
    .pipe(postcss(plugins))
    .pipe(
      autoprefixer({
        cascade: false,
      }),
    )
    .pipe(
      gulp.dest(paths.sassDist, {
        sourcemaps: './sourcemaps',
      }),
    )
    .pipe(
      browserSync.reload({
        stream: true,
      }),
    );
}

function sassDistFunc() {
  const plugins = [
    cssImport({
      path: ['node_modules'],
    }),
  ];
  return gulp
    .src(paths.sass, {
      sourcemaps: false,
    })
    .pipe(
      plumber({
        errorHandler: notify.onError('<%= error.message %>'),
      }),
    )
    .pipe(sassGlob())
    .pipe(
      sass({
        outputStyle: 'expanded',
      }),
    )
    .pipe(postcss(plugins))
    .pipe(cleanCSS())
    .pipe(
      autoprefixer({
        cascade: false,
      }),
    )
    .pipe(gulp.dest(paths.sassDist));
}

/* ---------------------------------------------------------
  uncss
--------------------------------------------------------- */
function uncssFunc(done) {
  const plugins = [
    uncss({
      html: paths.htmlDist,
      ignore: [],
    }),
  ];
  gulp
    .src('_dist/assets/css/utility.css')
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>'),
      }),
    )
    .pipe(postcss(plugins))
    .pipe(gulp.dest('_dist/assets/css/'));
  done();
}

/* ---------------------------------------------------------
  image
--------------------------------------------------------- */
function imageFunc() {
  return gulp
    .src(paths.image)
    .pipe(changed(paths.imageDist))
    .pipe(
      imagemin(
        [
          mozjpeg({
            quality: 90,
          }),
          pngquant({
            quality: [0.9, 0.95],
          }),
        ],
        {
          verbose: true,
        },
      ),
    )
    .pipe(gulp.dest(paths.imageDist))
    .pipe(
      browserSync.reload({
        stream: true,
      }),
    );
}

/* ---------------------------------------------------------
  js
--------------------------------------------------------- */
function jsFunc() {
  return plumber({
    errorHandler: notify.onError('Error: <%= error.message %>'),
  })
    .pipe(webpackStream(webpackDevConfig, webpack))
    .pipe(babel())
    .pipe(gulp.dest(paths.jsDist))
    .pipe(
      browserSync.reload({
        stream: true,
      }),
    );
}

/* ---------------------------------------------------------
  js
--------------------------------------------------------- */
function jsDistFunc() {
  return plumber({
    errorHandler: notify.onError('Error: <%= error.message %>'),
  })
    .pipe(webpackStream(webpackProdConfig, webpack))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest(paths.jsDist))
    .pipe(
      browserSync.reload({
        stream: true,
      }),
    );
}

/* ---------------------------------------------------------
  php
--------------------------------------------------------- */
function phpFunc() {
  return gulp
    .src(paths.php)
    .pipe(gulp.dest(paths.phpDist))
    .pipe(
      browserSync.reload({
        stream: true,
      }),
    );
}

/* ---------------------------------------------------------
  server
--------------------------------------------------------- */
const browserSyncOptions = {
  port: 3000,
  reloadOnRestart: true,
  server: {
    baseDir: paths.dist,
    index: 'index.html',
    middleware: [
      ssi({
        baseDir: __dirname + '/_dist',
        ext: '.html',
      }),
    ],
  },
  ghostMode: {
    clicks: false,
    forms: false,
    scroll: false,
  },
};

function browserSyncFunc(done) {
  browserSync.init(browserSyncOptions);
  done();
}

/* ---------------------------------------------------------
  clean
--------------------------------------------------------- */

function cleanFunc(done) {
  del.sync(['./_dist']);
  done();
}

/* ---------------------------------------------------------
  watch
--------------------------------------------------------- */
function watchFunc(done) {
  const browserReload = function() {
    browserSync.reload({
      stream: true,
    });
    done();
  };
  gulp.watch(paths.pug).on('change', gulp.series(pugFunc, browserReload));
  gulp
    .watch(paths.pugComponents)
    .on('change', gulp.series(pugFunc, browserReload));
  gulp.watch(paths.sass).on('change', gulp.series(sassFunc, browserReload));
  gulp.watch(paths.js).on('change', gulp.series(jsFunc, browserReload));
  gulp.watch(paths.image).on('change', gulp.series(imageFunc, browserReload));
  gulp.watch(paths.php).on('change', gulp.series(phpFunc, browserReload));
  done();
}

/* =========================================================
  Task main
========================================================= */
/* ---------------------------------------------------------
  gulp
--------------------------------------------------------- */
gulp.task(
  'default',
  gulp.series(
    gulp.parallel(pugFunc, sassFunc, jsFunc, imageFunc, phpFunc),
    gulp.series(browserSyncFunc, watchFunc),
  ),
);

gulp.task(
  'build',
  gulp.series(
    gulp.series(cleanFunc),
    gulp.parallel(pugFunc, sassDistFunc, imageFunc, jsDistFunc, phpFunc),
  ),
);
