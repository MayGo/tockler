import moment from 'moment';
import { memo } from 'react';
import { getTodayTimerange } from './timeline.utils';
import { Logger } from '../../logger';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { TIMERANGE_MODE_TODAY } from '../../store/mainStore';
import { Box } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { DateRangeInput } from '../Datepicker';
import { OnDatesChangeProps } from '@datepicker-react/hooks';
import { FaPlay, FaStop } from 'react-icons/fa';

const getDayBefore = (d) => moment(d).subtract(1, 'days');
const getDayAfter = (d) => moment(d).add(1, 'days');

export const Search = memo(() => {
    const timerange = useStoreState((state) => state.timerange);

    const timerangeMode = useStoreState((state) => state.timerangeMode);
    const liveView = useStoreState((state) => state.liveView);
    const loadTimerange = useStoreActions((actions) => actions.loadTimerange);
    const setLiveView = useStoreActions((actions) => actions.setLiveView);

    const showLiveViewButton = timerangeMode === TIMERANGE_MODE_TODAY;
    const toggleLiveView = () => {
        setLiveView(!liveView);
    };

    const handleOnDatesChange = (data: OnDatesChangeProps) => {
        Logger.debug('TIMERANGE:', data);

        const { startDate, endDate } = data;
        const newTimerange = [moment(startDate).startOf('day'), moment(endDate).endOf('day')];
        loadTimerange(newTimerange);
    };

    const selectToday = () => {
        loadTimerange(getTodayTimerange());
        setLiveView(true);
    };

    const selectYesterday = () => {
        const beginDate = getDayBefore(moment().startOf('day'));
        const endDate = getDayBefore(moment().endOf('day'));
        loadTimerange([beginDate, endDate]);
    };

    const goBackOneDay = () => {
        const beginDate = getDayBefore(moment(timerange[0]));
        const endDate = getDayBefore(moment(timerange[1]));
        loadTimerange([beginDate, endDate]);
    };

    const goForwardOneDay = () => {
        const beginDate = getDayAfter(moment(timerange[0]));
        const endDate = getDayAfter(moment(timerange[1]));
        loadTimerange([beginDate, endDate]);
    };

    Logger.debug('Have timerange in Search:', timerange);
    return (
        <>
            <Box p={1}>
                <Button variant="outline" onClick={selectYesterday}>
                    Yesterday
                </Button>
            </Box>
            <Box p={1}>
                <Button onClick={goBackOneDay}>
                    <AiOutlineLeft />
                </Button>
            </Box>
            <Box p={1}>
                <DateRangeInput
                    startDate={timerange[0].toDate()}
                    endDate={timerange[1].toDate()}
                    onDatesChange={handleOnDatesChange}
                />
            </Box>
            <Box p={1}>
                <Button onClick={goForwardOneDay}>
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
