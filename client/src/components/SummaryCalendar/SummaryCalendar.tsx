import moment from 'moment';
import { useContext, useEffect } from 'react';
import { SummaryContext } from '../../SummaryContext';
import { Logger } from '../../logger';
import { convertDate, TIME_FORMAT_SHORT } from '../../constants';
import { CALENDAR_MODE, DAY_MONTH_FORMAT } from '../../SummaryContext.util';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Box, Flex, VStack } from '@chakra-ui/react';
import { IoMdSunny, IoMdMoon } from 'react-icons/io';
import { Calendar } from '../Datepicker/Calendar';
import { Text, useColorModeValue } from '@chakra-ui/react';
import { Loader } from '../Timeline/Loader';
import { ItemIcon } from './ItemIcon';
import { useNavigate } from 'react-router-dom';
import { formatDurationInternal } from '../../utils';

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

    const onDateClicked = (date: any) => {
        if (!date) {
            Logger.error('No date');
            return;
        }

        const d = moment(date);
        loadTimerange([d.clone().startOf('day'), d.clone().endOf('day')]);

        navigate('/timeline');
    };

    useEffect(() => {
        setSelectedDate(timerange[0].clone());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getListData = (day) => {
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
            listData.push({ type: 'online', time: formatDurationInternal(online), title: `Online` });
        }

        const worked = logSummary[day];
        if (worked) {
            listData.push({ type: 'tasks', time: formatDurationInternal(worked), title: `Tasks` });
        }
        return listData || [];
    };

    const dateCellRender = (value) => {
        if (selectedMode === CALENDAR_MODE.MONTH) {
            if (value.month() === selectedDate.month()) {
                const listData = getListData(value.format(DAY_MONTH_FORMAT));
                return <DayContent listData={listData} />;
            }
            return null;
        } else if (selectedMode === CALENDAR_MODE.YEAR) {
            const listData = getListData(value.month());
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
                focusedDate={timerange[0].toDate()}
            />
        </>
    );
};
