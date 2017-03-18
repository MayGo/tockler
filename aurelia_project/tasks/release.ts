import * as gulp from 'gulp';
import * as project from '../aurelia.json';
import * as path from 'path';
import * as del from 'del';

let dist = 'release';
let rootFiles = [
  'favicon.ico',
  'index.html',
  'index.js'
];

export default gulp.series(
  deleteFolder,
  gulp.parallel(
    copyRoot,
    copyScripts,
    copyStyles,
    copyFonts,
    copyLocales
  )
);

function deleteFolder() {
  return del([
    path.join(dist, '**/*'),
    '!' + dist
  ]);
}
function copyRoot() {
  return gulp.src(rootFiles).pipe(gulp.dest(dist));
}
function copyScripts() {
  return gulp.src('scripts/**/*.*')
    .pipe(gulp.dest(path.join(dist, 'scripts')));
}
function copyStyles() {
  return gulp.src('styles/**/*.*')
    .pipe(gulp.dest(path.join(dist, 'styles')));
}
function copyFonts() {
  return gulp.src('fonts/**/*.*')
    .pipe(gulp.dest(path.join(dist, 'fonts')));
}
function copyLocales() {
  return gulp.src('locales/**/*.*')
    .pipe(gulp.dest(path.join(dist, 'locales')));
}
