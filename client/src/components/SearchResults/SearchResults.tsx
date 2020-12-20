import { Table, Tooltip } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import useReactRouter from 'use-react-router';
import { sumBy } from 'lodash';
import moment from 'moment';
import React, { useState, useRef, useEffect, memo } from 'react';
import Moment from 'react-moment';
import { convertDate, DATE_TIME_FORMAT, TIME_FORMAT } from '../../constants';
import { diffAndFormatShort } from '../../utils';
import { TotalCount } from './SearchResults.styles';
import { Logger } from '../../logger';
import { useStoreActions } from '../../store/easyPeasy';

const calculateTotal = filteredData => {
    const totalMs = sumBy(filteredData, (c: any) =>
        convertDate(c.endDate).diff(convertDate(c.beginDate)),
    );
    const dur = moment.duration(totalMs);

    return <TotalCount>Total {dur.format()}</TotalCount>;
};

const SearchResultsPlain = ({ searchResult, searchPaging, setSearchPaging }) => {
    const loadTimerange = useStoreActions(state => state.loadTimerange);
    const setVisibleTimerange = useStoreActions(state => state.setVisibleTimerange);

    const { history } = useReactRouter();

    const paginationConf = {
        total: searchResult.total,
        showSizeChanger: true,
        pageSize: searchPaging.pageSize,
        current: searchPaging.page,
        pageSizeOptions: ['50', '100', '300', '500'],
        onChange: (page, pageSize) => {
            console.error('Pagination changed', page, pageSize);
            // setSearchPaging({ page, pageSize });
        },
    };
    const [state, setState] = useState<any>({
        filteredInfo: {},
        sortedInfo: {},
        filterDropdownVisible: false,
        searchText: '',
        filtered: false,
        selectedRowKeys: [],
    });

    const searchInput = useRef<any>();

    useEffect(() => {
        if (searchInput.current) {
            searchInput.current.focus();
        }
    }, [state.filterDropdownVisible]);

    const handleChange = (pagination: any, filters: any, sorter: any) => {
        Logger.debug('Various parameters', pagination, filters, sorter);
        setSearchPaging({ page: pagination.current, pageSize: pagination.pageSize });
        setState({ ...state, filteredInfo: filters, sortedInfo: sorter });
    };

    const onSelectChange = selectedRowKeys => {
        Logger.debug('selectedRowKeys changed: ', selectedRowKeys);
        setState({ ...state, selectedRowKeys });
    };

    const goToTimelinePage = record => {
        loadTimerange([
            moment(record.beginDate).startOf('day'),
            moment(record.beginDate).endOf('day'),
        ]);
        setVisibleTimerange([
            moment(record.beginDate).subtract(15, 'minutes'),
            moment(record.endDate).add(15, 'minutes'),
        ]);
        history.push('/app/timeline');
    };

    const { isOneDay, sortedInfo } = state;

    const columns = [
        {
            title: 'App',
            dataIndex: 'app',
            key: 'app',
            width: 200,
            sorter: (a: any, b: any) => a.app - b.app,
            sortOrder: sortedInfo.columnKey === 'app' && sortedInfo.order,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',

            sorter: (a: any, b: any) => a.title.length - b.title.length,
            sortOrder: sortedInfo.columnKey === 'title' && sortedInfo.order,
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            width: 300,
            ellipsis: true,
            sorter: (a: any, b: any) => a.url.length - b.url.length,
            sortOrder: sortedInfo.columnKey === 'url' && sortedInfo.order,
        },
        {
            title: 'Begin',
            dataIndex: 'beginDate',
            key: 'beginDate',
            width: 170,
            onFilter: (value: any, record: any) => convertDate(record.beginDate) > value,
            sorter: (a: any, b: any) =>
                convertDate(a.beginDate).valueOf() - convertDate(b.beginDate).valueOf(),
            sortOrder: sortedInfo.columnKey === 'beginDate' && sortedInfo.order,
            render: (text, record) => (
                <Moment format={isOneDay ? TIME_FORMAT : DATE_TIME_FORMAT}>
                    {record.beginDate}
                </Moment>
            ),
        },
        {
            title: 'End',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 170,
            onFilter: (value: any, record: any) => convertDate(record.endDate) > value,
            sorter: (a: any, b: any) =>
                convertDate(a.endDate).valueOf() - convertDate(b.endDate).valueOf(),
            sortOrder: sortedInfo.columnKey === 'endDate' && sortedInfo.order,

            render: (text, record) => (
                <Moment format={isOneDay ? TIME_FORMAT : DATE_TIME_FORMAT}>{record.endDate}</Moment>
            ),
        },

        {
            title: 'Dur',
            dataIndex: '',
            key: 'duration',
            width: 80,
            sorter: (a: any, b: any) =>
                convertDate(a.endDate).diff(convertDate(a.beginDate)) -
                convertDate(b.endDate).diff(convertDate(b.beginDate)),
            sortOrder: sortedInfo.columnKey === 'duration' && sortedInfo.order,

            render: (text, record) => (
                <span>{diffAndFormatShort(record.beginDate, record.endDate)}</span>
            ),
        },
        {
            title: '',
            dataIndex: '',
            key: 'actions',
            width: 40,
            render: (text, record) => (
                <Tooltip placement="left" title="Select date and go to timeline view">
                    <UnorderedListOutlined onClick={() => goToTimelinePage(record)} />
                </Tooltip>
            ),
        },
    ];

    const { selectedRowKeys } = state;
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    return (
        <Table
            rowSelection={rowSelection}
            rowKey={(record: any) => `${record.id}`}
            columns={columns}
            pagination={paginationConf}
            dataSource={searchResult.results}
            onChange={handleChange}
            footer={calculateTotal}
        />
    );
};

export const SearchResults = memo(SearchResultsPlain);
