import * as gulp from 'gulp';
import * as project from '../aurelia.json';
import * as path from 'path';
import * as del from 'del';

export default function prepareOutput() {

  return del([
    path.join(project.platform.output, '**/*.*')
  ]);

}
