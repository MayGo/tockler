import {autoinject, useView, LogManager} from "aurelia-framework";
import {DialogController} from "aurelia-dialog";
import { PLATFORM } from "aurelia-pal";
import { TrackItemService } from "services/track-item-service";
import { AppSettingsService } from "services/app-settings-service";

let logger = LogManager.getLogger('ChangeColorConfirmModal');


@autoinject
export class ChangeColorConfirmModal {

  public selectedTrackItem: any;

  public dialogController: DialogController;

  constructor(
        private trackItemService: TrackItemService,
        private appSettingsService: AppSettingsService,
        dialogController: DialogController) {
    this.dialogController = dialogController;
  }

  activate(selectedTrackItem: any) {
    this.selectedTrackItem = selectedTrackItem;
    
  }

  changeColorAnswer(answer) {
        let trackItem = this.selectedTrackItem;
        if (answer === 'ALL_ITEMS') {
            //this.loading = true;
            this.appSettingsService.changeColorForApp(trackItem.app, trackItem.color);
            this.trackItemService.updateColorForApp(trackItem.app, trackItem.color).then(() => {
                logger.debug("Updated all item with color");
                this.dialogController.ok(); 
            })
        } else if (answer === 'NEW_ITEMS') {
            this.appSettingsService.changeColorForApp(trackItem.app, trackItem.color);
            this.dialogController.ok(trackItem); 
        } else {
          this.dialogController.ok(trackItem); 
        }
    }
}
