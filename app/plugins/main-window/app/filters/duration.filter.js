'use strict';

angular.module('filters', []).filter('msToDuration', function () {
    return function (input) {

        var duration = moment.duration(input)
        var formattedDuration = moment.utc(duration.asMilliseconds()).format("HH[h] mm[m] ss[s]");
        // strip leading zeroes
        formattedDuration = formattedDuration.replace('00h 00m', '');
        formattedDuration = formattedDuration.replace('00h ', '');
        if (input < 0) {
            formattedDuration = ' - ' + formattedDuration
        }
        return formattedDuration;
    };
}).filter('parseDate', function () {
    return function (input) {
        return new Date(input);
    };
}).filter('diffToMs', function () {
    return function (endDate, beginDate) {
        return moment(endDate).diff(beginDate)
    };
});
