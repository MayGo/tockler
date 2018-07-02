import _ from 'lodash';

export const findFirst = (str, findRe) => {
    if (!findRe) {
        return;
    }

    let re = new RegExp(findRe, 'g');
    let result = re.exec(str);

    if (result != null) {
        let first = result[0];

        return first;
    }
    return;
};

export const testAnalyserItem = (appTrackItems, analyseSetting) => {
    if (!appTrackItems) {
        console.error('appTrackItems not loaded');
        return;
    }

    // console.info('Analysing items:', appTrackItems, analyseSetting);

    const testItems: any = [];
    appTrackItems.forEach(item => {
        const testItem = { ...item };
        let str = testItem.title;

        testItem.findRe = findFirst(str, analyseSetting.findRe);
        testItem.takeGroup = findFirst(str, analyseSetting.takeGroup) || testItem.findRe;
        testItem.takeTitle = findFirst(str, analyseSetting.takeTitle) || testItem.title;
        /// console.info('info', testItem);
        if (testItem.findRe) {
            testItems.push(testItem);
        }
    });

    const analyserTestItems = _.uniqBy(testItems, 'title');
    // console.info('Found analyserTestItems', analyserTestItems);
    return analyserTestItems;
};
