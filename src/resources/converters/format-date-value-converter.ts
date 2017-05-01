import * as moment from "moment";

export class FormatDateValueConverter {
    toView(date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
    }
}