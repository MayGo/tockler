import {autoinject} from "aurelia-framework";
import {SettingsService} from "../services/settings-service";

@autoinject
export class Summary {

    constructor(private settingsService:SettingsService) {
    }

    async activate():Promise<void> {

    }
}
