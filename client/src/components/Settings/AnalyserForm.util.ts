import { uniqBy } from 'lodash';
import { ITrackItem } from '../../@types/ITrackItem';
import { Logger } from '../../logger';

export const findFirst = (str: string, findRe: string): string | undefined => {
    if (!findRe) {
        return undefined;
    }
    try {
        const re: RegExp = new RegExp(findRe, 'g');
        const result: RegExpExecArray | null = re.exec(str);

        if (result != null) {
            const first: string = result[0];
            return first;
        }
    } catch (error) {
        Logger.error('Error in findFirst', error);
    }
    return undefined;
};

export const testAnalyserItem = (appItems: ITrackItem[], analyseSetting: AnalyserItem): Array<AnalyserTestItemI> => {
    if (!appItems) {
        Logger.error('appItems not loaded');
        return [];
    }

    const testItems: AnalyserTestItemI[] = [];

    appItems.forEach((item) => {
        const testItem: AnalyserTestItemI = { title: item.title || '' };
        const str: string = testItem.title;

        testItem.findRe = findFirst(str, analyseSetting.findRe);
        testItem.takeGroup = findFirst(str, analyseSetting.takeGroup) || testItem.findRe;
        testItem.takeTitle = findFirst(str, analyseSetting.takeTitle) || testItem.title;

        if (testItem.findRe) {
            testItems.push(testItem);
        }
    });

    const analyserTestItems = uniqBy(testItems, 'title');

    return analyserTestItems;
};

export interface AnalyserItem {
    findRe: string;
    takeTitle: string;
    takeGroup: string;
    enabled: boolean;
}
export interface AnalyserTestItemI {
    title: string;
    findRe?: string;
    takeTitle?: string;
    takeGroup?: string;
}
