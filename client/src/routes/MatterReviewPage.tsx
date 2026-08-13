import { Box, Flex, Text } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IMatter } from '../@types/IMatter';
import { IMatterReviewItem } from '../@types/IMatterReviewItem';
import { CardBox } from '../components/CardBox';
import { DayGroupCard } from '../components/MatterReview/DayGroupCard';
import { groupReviewItems } from '../components/MatterReview/matterReview.util';
import { SearchOptions } from '../components/SearchResults/SearchOptions';
import { Loader } from '../components/Timeline/Loader';
import { findAllMatters, findMatterReviewItems, reassignMatterTag } from '../services/matter.api';

export function MatterReviewPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [matters, setMatters] = useState<IMatter[]>([]);
    const [reviewItems, setReviewItems] = useState<IMatterReviewItem[]>([]);
    const [timerange, setTimerange] = useState([
        DateTime.now().startOf('day').minus({ days: 7 }),
        DateTime.now().endOf('day'),
    ]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const [from, to] = timerange;
        const [mattersResult, reviewResult] = await Promise.all([findAllMatters(), findMatterReviewItems(from, to)]);
        setMatters(mattersResult);
        setReviewItems(reviewResult);
        setIsLoading(false);
    }, [timerange]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const dayGroups = useMemo(() => groupReviewItems(reviewItems), [reviewItems]);

    const onReassign = async (trackItemIds: number[], matterId: number | null) => {
        await Promise.all(trackItemIds.map((trackItemId) => reassignMatterTag(trackItemId, matterId)));
        await loadData();
    };

    return (
        <Flex p={4} flexDirection="column" gap={4}>
            <CardBox position="relative" p={4}>
                {isLoading && <Loader />}
                <SearchOptions setTimerange={setTimerange} timerange={timerange} />
            </CardBox>

            {!isLoading && dayGroups.length === 0 && (
                <CardBox>
                    <Text color="gray.500">
                        No app or task activity found in this range. If you&apos;ve just added matters, use
                        &quot;Re-run matching&quot; on the Settings page to tag existing activity.
                    </Text>
                </CardBox>
            )}

            {dayGroups.map((dayGroup) => (
                <DayGroupCard key={dayGroup.dayKey} dayGroup={dayGroup} matters={matters} onReassign={onReassign} />
            ))}

            <Box h={4} />
        </Flex>
    );
}
