import { useMemo } from 'react';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrackItemType } from '../../enum/TrackItemType';
import { useStoreState } from '../../store/easyPeasy';
import { matchesTitleKeyword, normalizeKeyword } from './titleSearch.utils';

const EMPTY_ARRAY: ITrackItem[] = [];

/** Normalized keyword plus the app and task items whose title contains it. */
export const useTitleSearchMatches = () => {
    const titleSearch = useStoreState((state) => state.titleSearch);
    const timeItems = useStoreState((state) => state.timeItems);

    const keyword = normalizeKeyword(titleSearch);
    const appItems = timeItems[TrackItemType.AppTrackItem] || EMPTY_ARRAY;
    const logItems = timeItems[TrackItemType.LogTrackItem] || EMPTY_ARRAY;

    const matchedItems = useMemo(
        () => (keyword ? [...appItems, ...logItems].filter((item) => matchesTitleKeyword(item, keyword)) : EMPTY_ARRAY),
        [keyword, appItems, logItems],
    );

    return { keyword, matchedItems };
};
