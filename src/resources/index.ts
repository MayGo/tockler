import { PLATFORM, FrameworkConfiguration } from 'aurelia-framework';
export function configure(config: FrameworkConfiguration) {
  config.globalResources(PLATFORM.moduleName('./nvd3/nvd3-custom-element'));
  config.globalResources(PLATFORM.moduleName('./converters/diff-to-ms-value-converter'));
  config.globalResources(PLATFORM.moduleName('./converters/format-date-value-converter'));
  config.globalResources(PLATFORM.moduleName('./converters/ms-to-duration-value-converter'));
  config.globalResources(PLATFORM.moduleName('./converters/to-date-value-converter'));
  config.globalResources(PLATFORM.moduleName('./converters/format-date-value-converter'));
  config.globalResources(PLATFORM.moduleName('./converters/flatten-array-value-converter'));

}
