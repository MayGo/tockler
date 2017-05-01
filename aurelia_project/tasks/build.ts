import * as gulp from 'gulp';

import buildCompile from './build-compile';
import prepareOutput from './prepare-output';
import prepareFontAwesome from './prepare-font-awesome';
import prepareMaterialIcons from './prepare-material-icons';

export default gulp.series(
  prepareOutput,
  buildCompile,
  prepareFontAwesome,
  prepareMaterialIcons
);
