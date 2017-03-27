import * as moment from "moment";

export class DiffToMsValueConverter {
    toView(endDate, beginDate) {

        moment(endDate).diff(beginDate)
    }
}