import * as React from 'react';
import { Table, Input, Button, Icon } from 'antd';
import { Flex, Box } from 'grid-styled';
import { FilterDropdown, Highlight, FilterInput, TotalCount } from './TrackItemTable.styles';
import Moment from 'react-moment';
import moment from 'moment';
import _ from 'lodash';
import { DATE_TIME_FORMAT, TIME_FORMAT, convertDate, INPUT_DATE_FORMAT } from '../../constants';
import { diffAndFormatShort } from '../../utils';
import { TrackItemType } from '../../enum/TrackItemType';
import { PaginationConfig } from 'antd/lib/table';
import { filterItems } from '../Timeline/timeline.utils';

interface IProps {
    visibleTimerange: any;
    timeItems: any;
    deleteTimelineItems: any;
}
interface IState {}

const checkIfOneDay = visibleTimerange => visibleTimerange[0].isSame(visibleTimerange[1], 'day');

const paginationConf: PaginationConfig = {
    showSizeChanger: true,
    pageSizeOptions: ['50', '100', '300', '500'],
};

export class TrackItemTable extends React.PureComponent<IProps, IState> {
    searchInput: any;

    state: any = {
        filteredInfo: null,
        sortedInfo: null,
        filterDropdownVisible: false,
        activeType: TrackItemType.AppTrackItem,
        data: [],
        searchText: '',
        filtered: false,
        selectedRowKeys: [],
    };

    handleChange = (pagination: any, filters: any, sorter: any) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
        });
    };

    clearFilters = () => {
        this.setState({ filteredInfo: null });
    };

    clearAll = () => {
        this.setState({
            filteredInfo: null,
            sortedInfo: null,
        });
    };

    toggleTask = () => {
        const { timeItems, visibleTimerange } = this.props;
        const { activeType } = this.state;

        this.clearAll();

        const newActiveType =
            activeType === TrackItemType.AppTrackItem
                ? TrackItemType.LogTrackItem
                : TrackItemType.AppTrackItem;
        this.setState({
            data:
                newActiveType === TrackItemType.AppTrackItem
                    ? filterItems(timeItems.appItems, visibleTimerange)
                    : filterItems(timeItems.logItems, visibleTimerange),
            activeType: newActiveType,
            isOneDay: checkIfOneDay(visibleTimerange),
        });
    };

    onInputChange = e => {
        this.setState({ searchText: e.target.value });
    };

    calculateTotal = filteredData => {
        const totalMs = _.sumBy(filteredData, c =>
            convertDate(c.endDate).diff(convertDate(c.beginDate)),
        );
        const dur = moment.duration(totalMs);

        return <TotalCount>Total {dur.format()}</TotalCount>;
    };

    componentWillReceiveProps(nextProps: any) {
        const { activeType } = this.state;
        const { timeItems, logItems, visibleTimerange } = nextProps;

        this.setState({
            data:
                activeType === TrackItemType.AppTrackItem
                    ? filterItems(timeItems.appItems, visibleTimerange)
                    : filterItems(timeItems.logItems, visibleTimerange),
            isOneDay: checkIfOneDay(visibleTimerange),
        });
    }

    onSearch = () => {
        const { searchText } = this.state;
        const reg = new RegExp(searchText, 'gi');

        this.setState({
            filterDropdownVisible: false,
            filtered: !!searchText,
            data: this.state.data
                .map((record: any) => {
                    const match = record.title.match(reg);
                    if (!match) {
                        return null;
                    }
                    return {
                        ...record,
                        name: (
                            <span>
                                {record.title
                                    .split(reg)
                                    .map((text, i) =>
                                        i > 0
                                            ? [<Highlight key={text}>{match[0]}</Highlight>, text]
                                            : text,
                                    )}
                            </span>
                        ),
                    };
                })
                .filter(record => !!record),
        });
    };
    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };
    deleteSelectedItems = () => {
        const { selectedRowKeys } = this.state;
        this.props.deleteTimelineItems(selectedRowKeys);
        this.setState({ selectedRowKeys: [] });
    };
    render() {
        let { sortedInfo, filteredInfo, isOneDay, activeType } = this.state;

        sortedInfo = sortedInfo || {};
        filteredInfo = filteredInfo || {};

        const columns = [
            {
                title: 'App',
                dataIndex: 'app',
                key: 'app',
                width: 200,
                filters: [
                    { text: 'loginwindow', value: 'loginwindow' },
                    { text: 'Google Chrome', value: 'Google Chrome' },
                ],
                filteredValue: filteredInfo.app || null,
                onFilter: (value: any, record: any) => record.app.includes(value),
                sorter: (a: any, b: any) => a.app - b.app,
                sortOrder: sortedInfo.columnKey === 'app' && sortedInfo.order,
            },
            {
                title: 'Title',
                dataIndex: 'title',
                key: 'title',
                filterDropdown: (
                    <FilterDropdown>
                        <FilterInput>
                            <Input
                                ref={ele => (this.searchInput = ele)}
                                placeholder="Search name"
                                value={this.state.searchText}
                                onChange={this.onInputChange}
                                onPressEnter={this.onSearch}
                            />
                        </FilterInput>
                        <Button type="primary" onClick={this.onSearch}>
                            Search
                        </Button>
                    </FilterDropdown>
                ),
                filterIcon: (
                    <Icon
                        type="search"
                        style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }}
                    />
                ),
                filterDropdownVisible: this.state.filterDropdownVisible,
                onFilterDropdownVisibleChange: visible => {
                    this.setState(
                        {
                            filterDropdownVisible: visible,
                        },
                        () => this.searchInput && this.searchInput.focus(),
                    );
                },
                sorter: (a: any, b: any) => a.title.length - b.title.length,
                sortOrder: sortedInfo.columnKey === 'title' && sortedInfo.order,
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
                    <Moment
                        format={isOneDay ? TIME_FORMAT : DATE_TIME_FORMAT}
                        parse={INPUT_DATE_FORMAT}
                    >
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
                    <Moment
                        format={isOneDay ? TIME_FORMAT : DATE_TIME_FORMAT}
                        parse={INPUT_DATE_FORMAT}
                    >
                        {record.endDate}
                    </Moment>
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
        ];

        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        return (
            <div>
                <Flex p={1}>
                    <Box pr={1}>
                        {!hasSelected && (
                            <Button type="primary" onClick={this.toggleTask}>
                                Showing{' '}
                                {activeType === TrackItemType.AppTrackItem ? 'Apps' : 'Logs'}
                            </Button>
                        )}
                        {hasSelected && (
                            <Button
                                type="primary"
                                onClick={this.deleteSelectedItems}
                                disabled={!hasSelected}
                            >
                                Delete <b> {selectedRowKeys.length} </b> items
                            </Button>
                        )}
                    </Box>
                    <Box pr={1}>
                        <Button onClick={this.clearFilters}>Clear filters</Button>
                    </Box>
                    <Box pr={1}>
                        <Button onClick={this.clearAll}>Clear filters and sorters</Button>
                    </Box>
                </Flex>
                <Flex p={1}>
                    <Box pr={1} />
                </Flex>
                <Table
                    rowSelection={rowSelection}
                    rowKey={(record: any) => `${record.id}`}
                    columns={columns}
                    pagination={paginationConf}
                    dataSource={this.state.data}
                    onChange={this.handleChange}
                    footer={this.calculateTotal}
                />
            </div>
        );
    }
}
