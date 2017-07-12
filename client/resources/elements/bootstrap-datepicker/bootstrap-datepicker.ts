import { inject, bindable, bindingMode, LogManager } from "aurelia-framework";
import * as moment from "moment";
import "bootstrap-datepicker";
import * as $ from 'jquery';

/*
 <bootstrap-datepicker id="someday" name="someday" dateobj.bind="someday"></bootstrap-datepicker>
 */

let logger = LogManager.getLogger('BootstrapDatepicker');

@inject(Element)
export class BootstrapDatepicker {

  inputEl: Element;

  @bindable({
    defaultBindingMode: bindingMode.twoWay,
    defaultValue: undefined
  }) dateobj;

  @bindable
  isValid;

  @bindable
  placeholder;

  @bindable({
    defaultBindingMode: bindingMode.twoWay,
    defaultValue: undefined
  }) myvalue;

  @bindable dpOptions = {
    todayBtn: "linked",
    clearBtn: false,
    autoclose: true,
    todayHighlight: true,
    language: "en",
    format: "dd.mm.yyyy",
    forceParse: false
  };

  isAttached;
  inputFormat = 'YYYY-MM-DDTHH:mm:ssZ';
  valueFormat = 'DD.MM.YYYY';

  constructor(element) {
    this.isValid = true;
    this.isAttached = false;
  }

  myvalueChanged(newValue, oldValue) {
    this.isValid = true;

    $(this.inputEl).datepicker('hide');
    // When input is deleted
    if (!newValue) {
      this.dateobj = null
    }
  }

  parseDate() {
    if (!this.myvalue) {
      this.isValid = true;
      return;
    }

    let date = moment(this.myvalue, this.valueFormat);

    if (date.isValid()) {
      $(this.inputEl).datepicker('update', date.toDate());
      this.dateobj = date.toDate();
    } else {
      this.isValid = false;
      this.dateobj = null;
    }
  }

  dateobjChanged(newValue, oldValue) {
    if (typeof newValue === 'string' && !oldValue) {
      let parsedDate = Date.parse(newValue);
      let date;
      if (isNaN(parsedDate)) {
        date = moment(newValue, this.inputFormat).toDate();
      } else {
        date = moment(parsedDate).toDate();
      }
      this.dateobj = date;
      this.setDatePickerDate(date);
    } else {
      this.setDatePickerDate(newValue);
    }
  }

  setDatePickerDate(date) {
    if (this.isAttached) {
      $(this.inputEl).datepicker('update', date);
    }
  }

  attached() {
    logger.debug("Attached");
    let self = this;

    $(self.inputEl).datepicker(self.dpOptions)
      .on('changeDate', e => {
        self.dateobj = moment(e.date).utc().toDate();
      });

    self.isAttached = true;

    if (self.dateobj) {
      self.setDatePickerDate(self.dateobj);
    }

  }

  detached() {
    $(this.inputEl).datepicker('destroy')
      .off('changeDate');
  }

}
