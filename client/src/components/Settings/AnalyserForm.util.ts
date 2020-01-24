import _ from 'lodash';
import { Logger } from '../../logger';

export const findFirst = (str, findRe): any => {
    if (!findRe) {
        return;
    }

    const re = new RegExp(findRe, 'g');
    const result = re.exec(str);

    if (result != null) {
        const first = result[0];

        return first;
    }
    return;
};

export const testAnalyserItem = (appItems, analyseSetting) => {
    if (!appItems) {
        Logger.error('appItems not loaded');
        return [];
    }

    const testItems: any = [];

    appItems.forEach(item => {
        const testItem = { ...item };
        const str = testItem.title;

        testItem.findRe = findFirst(str, analyseSetting.findRe);
        testItem.takeGroup = findFirst(str, analyseSetting.takeGroup) || testItem.findRe;
        testItem.takeTitle = findFirst(str, analyseSetting.takeTitle) || testItem.title;

        if (testItem.findRe) {
            testItems.push(testItem);
        }
    });

    const analyserTestItems = _.uniqBy(testItems, 'title');

    return analyserTestItems;
};
