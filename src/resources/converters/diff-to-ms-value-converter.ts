import * as moment from "moment";

export class DiffToMsValueConverter {
    toView(endDate, beginDate) {

        return moment(endDate).diff(beginDate)
    }
}