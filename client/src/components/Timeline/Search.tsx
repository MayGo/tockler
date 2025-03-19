import { Box, Button, Tooltip, useToast } from '@chakra-ui/react';
import { OnDatesChangeProps } from '@datepicker-react/hooks';
import { DateTime } from 'luxon';
import { memo, useEffect } from 'react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { FaPlay, FaStop } from 'react-icons/fa';
import { Logger } from '../../logger';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { TIMERANGE_MODE_TODAY } from '../../store/mainStore';
import { DateRangeInput } from '../Datepicker';
import { getTodayTimerange } from './timeline.utils';

const getDayBefore = (d: DateTime) => d.minus({ days: 1 });
const getDayAfter = (d: DateTime) => d.plus({ days: 1 });

export const Search = memo(() => {
    const timerange = useStoreState((state) => state.timerange);
    const toast = useToast();

    const timerangeMode = useStoreState((state) => state.timerangeMode);
    const liveView = useStoreState((state) => state.liveView);
    const setLiveView = useStoreActions((actions) => actions.setLiveView);
    const loadTimerange = useStoreActions((actions) => actions.loadTimerange);

    // Show a toast notification for live view status changes
    const showLiveViewToast = (isEnabled: boolean) => {
        toast({
            title: `Live view ${isEnabled ? 'enabled' : 'disabled'}`,
            status: isEnabled ? 'success' : 'info',
            duration: 2000,
            isClosable: true,
            position: 'top',
        });
    };

    // Monitor liveView state changes and show toast
    useEffect(() => {
        if (timerangeMode === TIMERANGE_MODE_TODAY) {
            showLiveViewToast(liveView);
        }
    }, [liveView, showLiveViewToast]);

    const showLiveViewButton = timerangeMode === TIMERANGE_MODE_TODAY;

    const toggleLiveView = () => {
        const newLiveView = !liveView;
        setLiveView(newLiveView);

        // Log the user action
        Logger.debug(`User toggled live view to: ${newLiveView ? 'enabled' : 'disabled'}`);
    };

    const handleOnDatesChange = (data: OnDatesChangeProps) => {
        Logger.debug('TIMERANGE:', data);

        const { startDate, endDate } = data;

        if (!startDate || !endDate) {
            console.error('NO startDate or endDate');
            return;
        }
        const newTimerange = [DateTime.fromJSDate(startDate).startOf('day'), DateTime.fromJSDate(endDate).endOf('day')];
        loadTimerange(newTimerange);
    };

    const selectToday = () => {
        loadTimerange(getTodayTimerange());
        setLiveView(true);
    };

    const selectYesterday = () => {
        const beginDate = getDayBefore(DateTime.now().startOf('day'));
        const endDate = getDayBefore(DateTime.now().endOf('day'));
        loadTimerange([beginDate, endDate]);
    };

    const goBackOneDay = () => {
        const beginDate = getDayBefore(timerange[0]);
        const endDate = getDayBefore(timerange[1]);
        loadTimerange([beginDate, endDate]);
    };

    const goForwardOneDay = () => {
        const beginDate = getDayAfter(timerange[0]);
        const endDate = getDayAfter(timerange[1]);
        loadTimerange([beginDate, endDate]);
    };

    const isYesterday = DateTime.now().minus({ days: 1 }).hasSame(timerange[1], 'day');

    return (
        <>
            <Box p={1}>
                <Button onClick={selectYesterday} variant={isYesterday ? 'solid' : 'outline'}>
                    Yesterday
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={goBackOneDay} variant="outline">
                    <AiOutlineLeft />
                </Button>
            </Box>
            <Box p={1}>
                <DateRangeInput
                    startDate={timerange[0].toJSDate()}
                    endDate={timerange[1].toJSDate()}
                    onDatesChange={handleOnDatesChange}
                />
            </Box>
            <Box p={1}>
                <Button onClick={goForwardOneDay} variant="outline">
                    <AiOutlineRight />
                </Button>
            </Box>
            <Box p={1}>
                <Tooltip placement="bottom" label="Also activates Live view">
                    <Button onClick={selectToday} variant={showLiveViewButton ? 'solid' : 'outline'}>
                        Today
                    </Button>
                </Tooltip>
            </Box>
            {showLiveViewButton && (
                <Box p={1}>
                    <Tooltip placement="bottom" label={liveView ? 'Pause live view' : 'Start live view'}>
                        <Button onClick={toggleLiveView} colorScheme={liveView ? 'green' : 'red'}>
                            {liveView ? <FaStop /> : <FaPlay />}
                        </Button>
                    </Tooltip>
                </Box>
            )}
        </>
    );
});
