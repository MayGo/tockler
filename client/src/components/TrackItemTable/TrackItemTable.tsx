import * as React from 'react';
import { Table, Input, Button, Icon } from 'antd';
import { Flex, Box } from 'grid-styled';
import { FilterDropdown, Highlight, FilterInput } from './TrackItemTable.styles';
import Moment from 'react-moment';
import moment from 'moment';
import { DATE_TIME_FORMAT, TIME_FORMAT } from '../../constants';
import { diffAndFormatShort } from '../../utils';

export class TrackItemTable extends React.Component {
    searchInput: any;

    state: any = {
        filteredInfo: null,
        sortedInfo: null,
        filterDropdownVisible: false,
        data: [],
        searchText: '',
        filtered: false,
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

    setAgeSort = () => {
        this.setState({
            sortedInfo: {
                order: 'descend',
                columnKey: 'age',
            },
        });
    };

    onInputChange = e => {
        this.setState({ searchText: e.target.value });
    };

    componentWillReceiveProps(nextProps: any) {
        const { appTrackItems, visibleTimerange } = nextProps;
        console.log('Props received:', appTrackItems, visibleTimerange);

        this.setState({
            data: appTrackItems,
            isOneDay: moment(visibleTimerange[0]).isSame(moment(visibleTimerange[1]), 'day'),
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
                                    .map(
                                        (text, i) =>
                                            i > 0
                                                ? [
                                                      <Highlight key={text}>{match[0]}</Highlight>,
                                                      text,
                                                  ]
                                                : text,
                                    )}
                            </span>
                        ),
                    };
                })
                .filter(record => !!record),
        });
    };

    render() {
        let { sortedInfo, filteredInfo, isOneDay } = this.state;

        sortedInfo = sortedInfo || {};
        filteredInfo = filteredInfo || {};

        const columns = [
            {
                title: 'Task',
                dataIndex: 'taskName',
                key: 'taskName',
                width: 150,
                onFilter: (value: any, record: any) => record.taskName.includes(value),
                sorter: (a: any, b: any) => a.taskName.length - b.taskName.length,
                sortOrder: sortedInfo.columnKey === 'taskName' && sortedInfo.order,
            },
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
                onFilter: (value: any, record: any) => new Date(record.beginDate) > value,
                sorter: (a: any, b: any) =>
                    new Date(a.beginDate).getTime() - new Date(b.beginDate).getTime(),
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
                onFilter: (value: any, record: any) => new Date(record.endDate) > value,
                sorter: (a: any, b: any) =>
                    new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
                sortOrder: sortedInfo.columnKey === 'endDate' && sortedInfo.order,

                render: (text, record) => (
                    <Moment format={isOneDay ? TIME_FORMAT : DATE_TIME_FORMAT}>
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
                    moment(new Date(a.endDate)).diff(moment(new Date(a.beginDate))) -
                    moment(new Date(b.endDate)).diff(moment(new Date(b.beginDate))),
                sortOrder: sortedInfo.columnKey === 'duration' && sortedInfo.order,

                render: (text, record) => (
                    <span>{diffAndFormatShort(record.beginDate, record.endDate)}</span>
                ),
            },
        ];
        return (
            <div>
                <Flex p={1}>
                    <Box pr={1}>
                        <Button onClick={this.setAgeSort}>Sort age</Button>
                    </Box>
                    <Box pr={1}>
                        <Button onClick={this.clearFilters}>Clear filters</Button>
                    </Box>
                    <Box pr={1}>
                        <Button onClick={this.clearAll}>Clear filters and sorters</Button>
                    </Box>
                </Flex>
                <Table
                    rowKey={(record: any) => `${record.id}`}
                    columns={columns}
                    dataSource={this.state.data}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}
