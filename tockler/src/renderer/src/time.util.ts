import humanizeDuration from 'humanize-duration';

function zeroPad(num = 0, places: number): string {
    const zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join('0') + num;
}

export const shortTime = humanizeDuration.humanizer({
    language: 'shortEn',
    spacer: '',
    delimiter: ' ',
    round: true,
    languages: {
        shortEn: {
            y: () => 'y',
            mo: () => 'mo',
            w: () => 'w',
            d: () => 'd',
            h: () => 'h',
            m: () => 'm',
            s: () => 's',
            ms: () => 'ms',
        },
    },
});

export const secondsToClock = (seconds: number, minPos = 0, maxPos = 0) => {
    let timeLeft: any = {};

    if (seconds > 0) {
        timeLeft = {
            days: Math.floor(seconds / (60 * 60 * 24)),
            hours: Math.floor((seconds / (60 * 60)) % 24),
            minutes: Math.floor((seconds / 60) % 60),
            seconds: Math.floor(seconds % 60),
        };
    }

    let timerParts: string[] = [];

    if (timeLeft.days > 0 || minPos >= 4) {
        timerParts.push(`${zeroPad(timeLeft.days, 1)}d`);
    }

    if (timeLeft.hours > 0 || timerParts.length > 0 || minPos >= 3) {
        timerParts.push(`${zeroPad(timeLeft.hours, 2)}h`);
    }

    if (timeLeft.minutes > 0 || timerParts.length > 0 || minPos >= 2) {
        timerParts.push(`${zeroPad(timeLeft.minutes, 2)}m`);
    }

    if (timeLeft.seconds > 0 || timerParts.length > 0 || minPos >= 1) {
        timerParts.push(`${zeroPad(timeLeft.seconds, 2)}s`);
    }

    if (maxPos && timerParts.length > maxPos) {
        return timerParts.slice(0, maxPos).join(' ');
    }

    return timerParts.join(' ');
};
