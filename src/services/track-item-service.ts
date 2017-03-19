export class TrackItemService {
    private service:any;

    constructor() {
        this.service = require('electron').remote.getGlobal('BackgroundService').getTrackItemService();
        console.log("..................sds")
    }

    findAllFromDay(from:Date, type:string) {
        return this.service.findAllFromDay(from, type)

    }

}
