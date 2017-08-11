
import { customAttribute, autoinject, bindable, LogManager } from 'aurelia-framework';
import * as $ from "jquery";
import { I18N } from 'aurelia-i18n';

let logger = LogManager.getLogger('TooltipCustomAttribute');

@customAttribute('tooltip')
@autoinject
export class TooltipCustomAttribute {
  $element: any;
  
  @bindable({ primaryProperty: true }) title;

  constructor(private element: Element, private i18n: I18N) {
    this.$element = $(element);
  }

  bind(bindingContext, overrideContext) {
    logger.debug("Tooltip created:", this.title);
    this.$element.tooltip({ title: this.i18n.tr(this.title) })
  }
  unbind() {
    logger.debug("Tooltip disposed");
    this.$element.tooltip('dispose');
  }


}
