import * as React from 'react';
import * as styles from './TimelineItemEdit.css';

import { Input, Col, Button, Modal } from 'antd';
import { ColorPicker } from './ColorPicker';
import { ITrackItem } from '../../@types/ITrackItem';
const InputGroup = Input.Group;

interface IProps {
    modalVisible: boolean;
    selectColorOption: any;
}

const btnStyle = { width: '100%', marginBottom: 5 };
export class ColorChangerModal extends React.Component<IProps, {}> {
    constructor(props) {
        super(props);
        console.log('ColorChangerModal', props);
    }
    changeColorHandler = color => {
        console.log('Changed color:', color);

        this.setState({ color });
    };

    saveItemHandler = opts => {
        this.props.selectColorOption(opts);
    };

    render() {
        const { modalVisible }: IProps = this.props;

        return (
            <Modal
                title="What items we change color?"
                style={{ top: 20 }}
                visible={modalVisible}
                footer={null}
            >
                <Button
                    style={btnStyle}
                    type="primary"
                    onClick={() => this.saveItemHandler('ONLY_THIS')}
                >
                    Only this
                </Button>
                <br />
                <Button style={btnStyle} onClick={() => this.saveItemHandler('NEW_ITEMS')}>
                    This and new items
                </Button>
                <br />
                <Button style={btnStyle} onClick={() => this.saveItemHandler('ALL_ITEMS')}>
                    All items
                </Button>
            </Modal>
        );
    }
}
