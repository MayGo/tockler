import React from 'react';

import { Button, Modal } from 'antd';
import { Logger } from '../../logger';

interface IProps {
    modalVisible: boolean;
    selectColorOption: any;
}

const btnStyle = { width: '100%', marginBottom: 5 };
export class ColorChangerModal extends React.PureComponent<IProps, {}> {
    constructor(props) {
        super(props);
        Logger.debug('ColorChangerModal', props);
    }

    public changeColorHandler = color => {
        Logger.debug('Changed color:', color);
        this.setState({ color });
    };

    public saveItemHandler = opts => {
        this.props.selectColorOption(opts);
    };

    public saveOnlyThis = () => this.saveItemHandler('ONLY_THIS');

    public saveNew = () => this.saveItemHandler('NEW_ITEMS');

    public saveAll = () => this.saveItemHandler('ALL_ITEMS');

    public render() {
        const { modalVisible }: IProps = this.props;

        return (
            <Modal
                title="What items we change color?"
                style={{ top: 20 }}
                visible={modalVisible}
                footer={null}
            >
                <Button style={btnStyle} type="primary" onClick={this.saveOnlyThis}>
                    Only this
                </Button>
                <br />
                <Button style={btnStyle} onClick={this.saveNew}>
                    This and new items
                </Button>
                <br />
                <Button style={btnStyle} onClick={this.saveAll}>
                    All items
                </Button>
            </Modal>
        );
    }
}
