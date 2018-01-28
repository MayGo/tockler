import * as React from 'react';
import * as styles from './TimelineItemEdit.css';

import { Input, Col } from 'antd';
import { ColorPicker } from './ColorPicker';
const InputGroup = Input.Group;

interface IProps {
    selectedTimelineItem: any;
}

interface IHocProps {}

type IFullProps = IProps & IHocProps;

export class TimelineItemEdit extends React.Component<IFullProps, IProps> {
    constructor(props: any) {
        super(props);
    }
    changeHandler = colors => {
        console.log(colors);
    };

    render() {
        const { selectedTimelineItem }: IFullProps = this.props;

        if (!selectedTimelineItem) {
            console.log('No item');
            return null;
        }

        console.log('Have timerange', selectedTimelineItem);

        const item = selectedTimelineItem.data().toJS();

        console.log(item);
        return (
            <div className={styles.editForm}>
                <InputGroup>
                    <Col span={6}>
                        <Input defaultValue={item.app} placeholder="App" />
                    </Col>
                    <Col span={17}>
                        <Input defaultValue={item.title} placeholder="Title" />
                    </Col>
                    <Col span={1}>
                        <ColorPicker color={item.color} onChange={this.changeHandler} />
                    </Col>
                </InputGroup>
            </div>
        );
    }
}
