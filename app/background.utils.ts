
import {logManager} from "./log-manager";
import * as moment from "moment";

var logger = logManager.getLogger('BackgroundUtils');

export default class BackgroundUtils {

    static isSameItems(item1, item2) {
        if (item1 && item2 && item1.app === item2.app && item1.title === item2.title) {
            return true
        }

        return false
    }

    static shouldSplitInTwoOnMidnight(beginDate, endDate) {
        return beginDate.getDate() < endDate.getDate();
    }

    static dateToAfterMidnight(d) {
        return moment(d).startOf('day').add(1, 'days').toDate();
    }

}


