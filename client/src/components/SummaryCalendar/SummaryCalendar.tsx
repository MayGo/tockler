import { Box, Flex, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { useContext, useEffect } from 'react';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { SummaryContext } from '../../SummaryContext';
import { CALENDAR_MODE, DAY_MONTH_FORMAT } from '../../SummaryContext.util';
import { convertDate, TIME_FORMAT_SHORT } from '../../constants';
import { Logger } from '../../logger';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { formatDurationInternal } from '../../utils';
import { Calendar } from '../Datepicker/Calendar';
import { Loader } from '../Timeline/Loader';
import { ItemIcon } from './ItemIcon';

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

const DayContent = ({ listData }) => {
    const color = useColorModeValue('black', 'gray.300');
    return (
        <VStack align="stretch" p={3} pt={1} spacing={'1px'}>
            {listData.map((item) => (
                <Flex key={item.title} alignItems="center">
                    <Box pr={2}>{icons[item.type]}</Box>
                    <Text fontSize="sm" color={color}>
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
    const timerange = useStoreState((state) => state.timerange);
    const loadTimerange = useStoreActions((state) => state.loadTimerange);

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

    const navigate = useNavigate();

    const onDateClicked = (date: DateTime) => {
        if (!date) {
            Logger.error('No date');
            return;
        }

        loadTimerange([date.startOf('day'), date.endOf('day')]);
        navigate('/app/timeline');
    };

    useEffect(() => {
        setSelectedDate(timerange[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getListData = (day: string) => {
        const listData: Array<{ type: string; time: string; title: string }> = [];

        const times = onlineTimesSummary[day];
        if (times) {
            listData.push({
                type: 'wakeTime',
                time: convertDate(times.beginDate).toFormat(TIME_FORMAT_SHORT),
                title: `Wake time`,
            });
            listData.push({
                type: 'sleepTime',
                time: convertDate(times.endDate).toFormat(TIME_FORMAT_SHORT),
                title: `Sleep time`,
            });
        }

        const online = onlineSummary[day];
        if (online) {
            listData.push({ type: 'online', time: formatDurationInternal(online), title: `Online` });
        }

        const worked = logSummary[day];
        if (worked) {
            listData.push({ type: 'tasks', time: formatDurationInternal(worked), title: `Tasks` });
        }
        return listData || [];
    };

    const dateCellRender = (value: DateTime) => {
        if (selectedMode === CALENDAR_MODE.MONTH) {
            if (value.month === selectedDate.month) {
                const listData = getListData(value.toFormat(DAY_MONTH_FORMAT));
                return <DayContent listData={listData} />;
            }
            return null;
        } else if (selectedMode === CALENDAR_MODE.YEAR) {
            const listData = getListData(value.month.toString());
            return <DayContent listData={listData} />;
        } else {
            Logger.error('Unknown mode for calendar');
        }
    };

    return (
        <>
            {isLoading && <Loader />}

            <Calendar
                selectedDate={selectedDate}
                dateCellRender={dateCellRender}
                onDateClicked={onDateClicked}
                setSelectedDate={setSelectedDate}
                selectedMode={selectedMode}
                setSelectedMode={setSelectedMode}
                focusedDate={timerange[0].toJSDate()}
            />
        </>
    );
};
