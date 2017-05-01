import * as moment from "moment";

export class FormatDateValueConverter {
    toView(date) {
        return moment(date).format('yyyy-MM-dd HH:mm:ss')
    }
}