import * as gulp from 'gulp';
import * as project from '../aurelia.json';
import build from './build';
import buildCompile from './build-compile';
import {CLIOptions} from 'aurelia-cli';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

import * as childProcess from 'child_process';
import * as electron from 'electron';

let reloadFile = path.join(__dirname, '..', '..', 'tools', 'reload.electron');

function onChange(path) {
  console.log(`File Changed: ${path}`);
}

function reloadElectron(done) {
  fs.appendFile(reloadFile, (new Date()).toString() + os.EOL, 'utf-8', done);
}

let serveElectron = gulp.series(
  build,
  done => {
    childProcess
      .spawn(electron, ["."], {
        stdio: 'inherit'
      })
      .on("close", () => {
        // User closed the app. Kill the host process.
        process.exit();
      })

    done();
  }
);

let refreshElectron = gulp.series(
  buildCompile,
  reloadElectron
);

let watchElectron = function() {
  gulp.watch(project.transpiler.source, refreshElectron).on('change', onChange);
  gulp.watch(project.markupProcessor.source, refreshElectron).on('change', onChange);
  gulp.watch(project.cssProcessor.source, refreshElectron).on('change', onChange);
}

let run;

if (CLIOptions.hasFlag('watch')) {
  run = gulp.series(
    serveElectron,
    watchElectron
  );
} else {
  run = serveElectron;
}

export default run;
