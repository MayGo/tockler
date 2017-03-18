import { computedFrom, inject, NewInstance } from 'aurelia-framework';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { MaterializeFormValidationRenderer } from 'aurelia-materialize-bridge';
import { EventAggregator } from 'aurelia-event-aggregator';
import { I18N } from 'aurelia-i18n';
import { remote } from 'electron';

@inject(I18N, Element, EventAggregator, NewInstance.of(ValidationController))
export class Welcome {
  heading: string = 'Welcome to the Aurelia Navigation App';
  firstName: string = 'John';
  lastName: string = 'Doe';
  previousValue: string = this.fullName;

  status = {
    electronVersion: '',
    chromeVersion: '',
    nodeVersion: '',
    v8Version: ''
  };

  controller = null;

  constructor(private i18n: I18N, private element: Element, private ea: EventAggregator, controller: ValidationController) {
    this.controller = controller;
    this.controller.addRenderer(new MaterializeFormValidationRenderer());

    ea.subscribe('i18n:locale:changed', payload => {
      this.i18n.updateTranslations(this.element);
    });

    ValidationRules
    .ensure('firstName')
      .required()
    .ensure('lastName')
      .required()
      .minLength(3)
    .on(this);

    this.status.chromeVersion = process.versions.chrome;
    this.status.electronVersion = process.versions.electron;
    this.status.nodeVersion = process.versions.node;
    this.status.v8Version = process.versions.v8;
  }

  //Getters can't be directly observed, so they must be dirty checked.
  //However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
  //To optimize by declaring the properties that this getter is computed from, uncomment the line below
  //as well as the corresponding import above.
  @computedFrom('firstName', 'lastName')
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  greet() {
    this.previousValue = this.fullName;
    this.controller.validate();
  }

  sayHello() {
    remote.dialog.showMessageBox({ 
      title: 'Welcome!',
      message: 'Welcome, ' + this.fullName,
      buttons: ['OK']
    });
  }  

  canDeactivate(): boolean {
    if (this.fullName !== this.previousValue) {
      return confirm('Are you sure you want to leave?');
    }
  }

  async setLocale(locale: string) {
    await this.i18n.setLocale(locale);
  }

}

export class UpperValueConverter {
  toView(value: string): string {
    return value && value.toUpperCase();
  }
}
