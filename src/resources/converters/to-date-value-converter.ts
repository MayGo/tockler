import * as moment from "moment";

export class ToDateValueConverter {
    toView(dateStr) {

        return new Date(dateStr)
    }
}