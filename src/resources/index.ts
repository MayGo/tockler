import { FrameworkConfiguration } from 'aurelia-framework';

export function configure(config: FrameworkConfiguration) {
  config.globalResources('./nvd3/nvd3-custom-element');
  config.globalResources('./converters/diff-to-ms-value-converter');
  config.globalResources('./converters/format-date-value-converter');
  config.globalResources('./converters/ms-to-duration-value-converter');
  config.globalResources('./converters/to-date-value-converter');
  config.globalResources('./converters/format-date-value-converter');
  config.globalResources('./converters/flatten-array-value-converter');

}
