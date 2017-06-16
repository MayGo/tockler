import { autoinject, containerless, bindable, LogManager } from "aurelia-framework";

let logger = LogManager.getLogger('AppNav');

@autoinject
@containerless
export class AppNav {
	@bindable
	router
}