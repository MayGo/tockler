import * as moment from "moment";

export class MsToDurationValueConverter {
    toView(input) {


        var duration = moment.duration(input)
        var formattedDuration = moment.utc(duration.asMilliseconds()).format("HH[h] mm[m] ss[s]");
        // strip leading zeroes
        formattedDuration = formattedDuration.replace('00h 00m', '');
        formattedDuration = formattedDuration.replace('00h ', '');
        if (input < 0) {
            formattedDuration = ' - ' + formattedDuration
        }
        return formattedDuration;
    }
}