import moment from 'moment';
import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router';
import { SummaryContext } from '../../SummaryContext';
import { Logger } from '../../logger';
import { convertDate, TIME_FORMAT_SHORT } from '../../constants';
import { formatDuration } from './SummaryCalendar.util';
import { DAY_MONTH_FORMAT } from '../../SummaryContext.util';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Spinner } from '@chakra-ui/spinner';
import { SpinnerContainer } from '../Timeline/Timeline.styles';
import { Box, Flex, VStack } from '@chakra-ui/layout';
import { IoMdSunny, IoMdMoon } from 'react-icons/io';
import { Calendar } from '../Datepicker/Calendar';
import Moment from 'react-moment';
import { DatepickerProvider } from '../Datepicker/context/DatepickerContext';
import { weekdayLabelFormatLong } from '../Datepicker/utils/formatters';
import { Text } from '@chakra-ui/react';
import { CardBox } from '../CardBox';
import { Loader } from '../Timeline/Loader';

moment.locale('et');

const ItemIcon = props => (
    <Box
        display="inline-flex"
        w={'16px'}
        h={'16px'}
        rounded={3}
        {...props}
        justifyContent="center"
        placeItems="center"
    />
);

const icons = {
    wakeTime: (
        <ItemIcon bg="gray.300">
            <IoMdSunny color="black" fontSize="10px" />
        </ItemIcon>
    ),
    sleepTime: (
        <ItemIcon bg="gray.500">
            <IoMdMoon fontSize="10px" />
        </ItemIcon>
    ),
    online: <ItemIcon bg="green.400">&nbsp;</ItemIcon>,
    tasks: <ItemIcon bg="yellow.200">&nbsp;</ItemIcon>,
};

const CellContent = ({ listData }) => {
    return (
        <VStack align="stretch" p={3} pt={1} spacing={'1px'}>
            {listData.map(item => (
                <Flex key={item.content} alignItems="center">
                    <Box pr={2}>{icons[item.type]}</Box>
                    <Text fontSize="sm" color="gray.300">
                        {item.time}
                    </Text>
                    <Text pl={2} fontSize="sm">
                        {item.title}
                    </Text>
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
                type: 'wakeTime',
                time: convertDate(times.beginDate).format(TIME_FORMAT_SHORT),
                title: `Wake time`,
            });
            listData.push({
                type: 'sleepTime',
                time: convertDate(times.endDate).format(TIME_FORMAT_SHORT),
                title: `Sleep time`,
            });
        }

        const online = onlineSummary[day];
        if (online) {
            listData.push({ type: 'online', time: formatDuration(online), title: `Online` });
        }

        const worked = logSummary[day];
        if (worked) {
            listData.push({ type: 'tasks', time: formatDuration(worked), title: `Tasks` });
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
        <CardBox p={0} position="relative">
            {isLoading && <Loader />}

            <DatepickerProvider weekdayLabelFormat={weekdayLabelFormatLong}>
                <Calendar
                    selectedDate={selectedDate}
                    dateCellRender={dateCellRender}
                    onDateClicked={onDateClicked}
                    onDatesChange={onDatesChange}
                />
            </DatepickerProvider>
        </CardBox>
    );
};
