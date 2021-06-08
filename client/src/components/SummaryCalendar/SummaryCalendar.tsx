import moment from 'moment';
import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router';
import { SummaryContext } from '../../SummaryContext';
import { Item, TaskList } from './SummaryCalendar.styles';
import { Logger } from '../../logger';
import { convertDate, TIME_FORMAT_SHORT } from '../../constants';
import { formatDuration } from './SummaryCalendar.util';
import { DAY_MONTH_FORMAT } from '../../SummaryContext.util';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Spinner } from '@chakra-ui/spinner';
import { SpinnerContainer } from '../Timeline/Timeline.styles';
import { Box, Flex, VStack } from '@chakra-ui/layout';
import { AiOutlineCoffee, AiOutlineEye, AiOutlineLaptop, AiOutlineTool } from 'react-icons/ai';
import { Calendar } from '../Datepicker/Calendar';
import { OnDatesChangeProps } from '@datepicker-react/hooks';
import Moment from 'react-moment';

moment.locale('et');

const icons = {
    coffee: <AiOutlineCoffee />,
    'eye-invisible': <AiOutlineEye />,
    laptop: <AiOutlineLaptop />,
    tool: <AiOutlineTool />,
};

const CellContent = ({ listData }) => {
    return (
        <VStack align="stretch" p={3} spacing={1}>
            {listData.map(item => (
                <Flex key={item.content} alignItems="center">
                    <Box pr={2} pl={5}>
                        {icons[item.type]}
                    </Box>
                    {item.content}
                </Flex>
            ))}
        </VStack>
    );
};
export const SummaryCalendar = () => {
    const timerange = useStoreState(state => state.timerange);
    const loadTimerange = useStoreActions(state => state.loadTimerange);

    const {
        selectedDate,
        setSelectedDate,
        selectedMode,
        setSelectedMode,
        logSummary,
        onlineSummary,
        onlineTimesSummary,
        isLoading,
    } = useContext(SummaryContext);

    const history = useHistory();

    const onDateClicked = (date: any) => {
        if (!date) {
            Logger.error('No date');
            return;
        }

        const d = moment(date);
        loadTimerange([d.clone().startOf('day'), d.clone().endOf('day')]);
        history.push('/app/timeline');
    };

    const changeSelectedDate = (date?: any, mode?: 'month' | 'year') => {
        setSelectedDate(date);
        setSelectedMode(mode);
    };

    useEffect(() => {
        setSelectedDate(timerange[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getListData = day => {
        const listData: any[] = [];

        const times = onlineTimesSummary[day];
        if (times) {
            listData.push({
                type: 'coffee',
                content: `Wake time ${convertDate(times.beginDate).format(TIME_FORMAT_SHORT)}`,
            });
            listData.push({
                type: 'eye-invisible',
                content: `Sleep time ${convertDate(times.endDate).format(TIME_FORMAT_SHORT)}`,
            });
        }

        const online = onlineSummary[day];
        if (online) {
            listData.push({ type: 'laptop', content: `Worked  ${formatDuration(online)}` });
        }

        const worked = logSummary[day];
        if (worked) {
            listData.push({ type: 'tool', content: `Tasks  ${formatDuration(worked)}` });
        }
        return listData || [];
    };

    const dateCellRender = value => {
        if (value.month() === selectedDate.month()) {
            const listData = getListData(value.format(DAY_MONTH_FORMAT));
            return <CellContent listData={listData} />;
        }
        return null;
    };

    const monthCellRender = value => {
        const listData = getListData(value.month());
        return <CellContent listData={listData} />;
    };

    const onDatesChange = (data: Moment) => {
        setSelectedDate(data);
    };

    return (
        <Flex p={1}>
            {isLoading && (
                <SpinnerContainer>
                    <Spinner />
                </SpinnerContainer>
            )}

            <Calendar
                selectedDate={selectedDate}
                dateCellRender={dateCellRender}
                onDateClicked={onDateClicked}
                onDatesChange={onDatesChange}
            />
        </Flex>
    );
};
