import * as React from 'react';
import { Table, Input, Button, Icon } from 'antd';
import * as styles from './TrackItemTable.css';

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
        const { appTrackItems } = nextProps;
        console.log('Props received');
        this.setState({
            data: appTrackItems
                .collection()
                .eventList()
                .toJS(),
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
                    const match = record.data.title.match(reg);
                    if (!match) {
                        return null;
                    }
                    return {
                        ...record,
                        name: (
                            <span>
                                {record.data.title.split(reg).map(
                                    (text, i) =>
                                        i > 0
                                            ? [
                                                  <span className={styles.highlight} key={text}>
                                                      {match[0]}
                                                  </span>,
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
        let { sortedInfo, filteredInfo } = this.state;
        console.log('Render', this.state);
        sortedInfo = sortedInfo || {};
        filteredInfo = filteredInfo || {};

        const columns = [
            {
                title: 'Task',
                dataIndex: 'data.taskName',
                key: 'taskName',
                onFilter: (value: any, record: any) => record.data.taskName.includes(value),
                sorter: (a: any, b: any) => a.data.taskName.length - b.data.taskName.length,
                sortOrder: sortedInfo.columnKey === 'taskName' && sortedInfo.order,
            },
            {
                title: 'App',
                dataIndex: 'data.app',
                key: 'app',
                filters: [
                    { text: 'loginwindow', value: 'loginwindow' },
                    { text: 'Google Chrome', value: 'Google Chrome' },
                ],
                filteredValue: filteredInfo.app || null,
                onFilter: (value: any, record: any) => record.data.app.includes(value),
                sorter: (a: any, b: any) => a.data.app - b.data.app,
                sortOrder: sortedInfo.columnKey === 'app' && sortedInfo.order,
            },
            {
                title: 'Title',
                dataIndex: 'data.title',
                key: 'title',
                filterDropdown: (
                    <div className={styles.customFilterDropdown}>
                        <Input
                            ref={ele => (this.searchInput = ele)}
                            placeholder="Search name"
                            value={this.state.searchText}
                            onChange={this.onInputChange}
                            onPressEnter={this.onSearch}
                        />
                        <Button type="primary" onClick={this.onSearch}>
                            Search
                        </Button>
                    </div>
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
                sorter: (a: any, b: any) => a.data.title.length - b.data.title.length,
                sortOrder: sortedInfo.columnKey === 'title' && sortedInfo.order,
            },
        ];
        return (
            <div className={styles.table}>
                <div className={styles.operations}>
                    <Button onClick={this.setAgeSort}>Sort age</Button>
                    <Button onClick={this.clearFilters}>Clear filters</Button>
                    <Button onClick={this.clearAll}>Clear filters and sorters</Button>
                </div>
                <Table
                    rowKey={(record: any) => `${record.data.id}`}
                    columns={columns}
                    dataSource={this.state.data}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}
