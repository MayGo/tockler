
import { logManager } from "../log-manager";
var logger = logManager.getLogger('LogTrackItemJob');

import * as moment from 'moment';
let shouldSplitLogItemFromDate = null;

export class LogTrackItemJob {

    run() {

    }
}

export const logTrackItemJob = new LogTrackItemJob();
