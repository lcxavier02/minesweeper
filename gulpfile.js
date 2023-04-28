const { watch, series, parallel, src, dest } = require('gulp');
const { server, reload } = require('gulp-connect');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');
const autoprefixer = require('gulp-autoprefixer');
const useref = require('gulp-useref');
const tsify = require('tsify');

watchSrc = () => {
  watch("src/**/*.ts", series(browserifySrc));
  watch("src/*.html", series(html));
  watch("src/**/*.css", series(css));
};

html = () =>
  src("src/*.html")
    .pipe(useref())
    .pipe(dest("dist"))
    .pipe(reload());

css = () =>
  src("src/**/*.css")
    .pipe(minifyCSS())
    .pipe(autoprefixer("last 2 version", "safari 5", "ie 8", "ie 9"))
    .pipe(concat("style.min.css"))
    .pipe(dest("dist/assets/"))
    .pipe(reload());

images = () => src("src/assets/**/*.{jpg,png}").pipe(dest("dist/assets"));
fonts = () => src("src/assets/**/*.{ttf,otf}").pipe(dest("dist/assets"));

browserifySrc = () => {
  return browserify({ basedir: ".", debug: true, entries: ["./src/app.ts"] })
  .plugin(tsify)
  .bundle()
  .pipe(source("bundle.js"))
  .pipe(dest("dist"))
  .pipe(reload());
};

serve = () =>
  server({ name: "Buscaminas", root: "./dist", port: 4000, livereload: true });

exports.default = series(
  browserifySrc,
  html,
  css,
  images,
  fonts,
  parallel(serve, watchSrc)
);

exports.build = series(
  browserifySrc,
  html,
  css,
  images,
  fonts,
);