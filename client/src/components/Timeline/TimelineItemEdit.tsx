import { Box, Flex } from '@rebass/grid';
import { Button, Input, Select, Tooltip } from 'antd';
import React from 'react';
import { ITrackItem } from '../../@types/ITrackItem';
import { ColorPicker } from './ColorPicker';
import { Logger } from '../../logger';

interface IProps {
    selectedTimelineItem: any;
    saveTimelineItem: any;
    changeColorForApp?: any;
    updateColorForApp?: any;
    colorScopeHidden?: boolean;
    showCloseBtn?: boolean;
    showDeleteBtn?: boolean;
    showPlayIcon?: boolean;
    clearTimelineItem?: any;
    deleteTimelineItem?: any;
}

interface IState {
    item: ITrackItem;
    colorScope: string;
}

type IFullProps = IProps;

export class TimelineItemEdit extends React.PureComponent<IProps, IState> {
    constructor(props) {
        super(props);

        this.state = {
            item: props.selectedTimelineItem,
            colorScope: 'ONLY_THIS',
        };
    }

    public componentWillReceiveProps(nextProps: any) {
        if (nextProps.selectedTimelineItem) {
            this.setState({
                item: nextProps.selectedTimelineItem,
                colorScope: 'ONLY_THIS',
            });
        }
    }

    public changeColorHandler = color => {
        Logger.debug('Changed color:', color);

        this.setState(prevState => ({
            ...prevState,
            item: {
                ...prevState.item,
                color,
            },
        }));
    };

    public changeAppName = e => {
        const { value } = e.target;
        Logger.debug('Changed app name:', value);

        this.setState(prevState => ({
            ...prevState,
            item: {
                ...prevState.item,
                app: value,
            },
        }));
    };

    public changeAppTitle = e => {
        const { value } = e.target;
        Logger.debug('Changed app title:', value);

        this.setState(prevState => ({
            ...prevState,
            item: {
                ...prevState.item,
                title: value,
            },
        }));
    };

    public closeEdit = () => {
        Logger.debug('Close TimelineItem');
        this.props.clearTimelineItem();
    };

    public changeColorScopeHandler = colorScope => {
        Logger.debug('Changed color scope:', colorScope);

        this.setState(prevState => ({
            ...prevState,
            colorScope,
        }));
    };

    public saveBasedOnColorOptionHandler = () => {
        const { item, colorScope } = this.state;

        this.props.saveTimelineItem(item, colorScope);
    };

    public deleteItem = () => {
        const { item } = this.state;

        this.props.deleteTimelineItem(item);
    };

    public render() {
        const {
            selectedTimelineItem,
            colorScopeHidden,
            showCloseBtn,
            showDeleteBtn,
            showPlayIcon,
        }: IFullProps = this.props;

        const trackItem = this.state.item;

        if (!selectedTimelineItem) {
            Logger.debug('No item');
            return null;
        }

        const saveBtnIcon = showPlayIcon ? 'play-circle-o' : 'save';
        Logger.debug('Have selectedTimelineItem', selectedTimelineItem);

        return (
            <Flex p={1} w={1}>
                <Box px={1} w={1 / 3}>
                    <Input value={trackItem.app} placeholder="App" onChange={this.changeAppName} />
                </Box>
                <Box px={1} flex="1">
                    <Input
                        value={trackItem.title}
                        placeholder="Title"
                        onChange={this.changeAppTitle}
                    />
                </Box>

                <Box px={1}>
                    <ColorPicker color={trackItem.color} onChange={this.changeColorHandler} />
                </Box>

                {!colorScopeHidden && (
                    <Box px={1}>
                        <Tooltip
                            placement="left"
                            title="Can also change color for all items or all future items"
                        >
                            <Select
                                value={this.state.colorScope}
                                style={{ width: 120 }}
                                onChange={this.changeColorScopeHandler}
                            >
                                <Select.Option value="ONLY_THIS">This item</Select.Option>
                                <Select.Option value="NEW_ITEMS">Future items</Select.Option>
                                <Select.Option value="ALL_ITEMS">All items</Select.Option>
                            </Select>
                        </Tooltip>
                    </Box>
                )}
                <Box px={1}>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={saveBtnIcon}
                        onClick={this.saveBasedOnColorOptionHandler}
                    />
                </Box>
                {showDeleteBtn && (
                    <Box px={1}>
                        <Button
                            type="primary"
                            shape="circle"
                            icon="delete"
                            onClick={this.deleteItem}
                        />
                    </Box>
                )}
                {showCloseBtn && (
                    <Box px={1}>
                        <Button
                            type="primary"
                            shape="circle"
                            icon="close"
                            onClick={this.closeEdit}
                        />
                    </Box>
                )}
            </Flex>
        );
    }
}
