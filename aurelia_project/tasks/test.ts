import * as gulp from 'gulp';
import {Server as Karma} from 'karma';
import {CLIOptions} from 'aurelia-cli';

export function unit(done) {
  new Karma({
    configFile: __dirname + '/../../karma.conf.js',
    singleRun: !CLIOptions.hasFlag('watch')
  }, done).start();
}

export default unit;
