import {autoinject} from "aurelia-framework";
import {SettingsService} from "../services/settings-service";

@autoinject
export class TimelineComponent {

    constructor(private settingsService:SettingsService) {
    }
    
}
