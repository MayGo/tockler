import { containerless, autoinject, bindable, LogManager } from "aurelia-framework";

let logger = LogManager.getLogger('AppHeader');

@autoinject
@containerless
export class AppHeader {
	@bindable
	router
}