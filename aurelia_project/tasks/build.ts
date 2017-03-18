import * as gulp from 'gulp';

import buildCompile from './build-compile';
import prepareOutput from './prepare-output';

export default gulp.series(
  prepareOutput,
  buildCompile
);
