import * as React from 'react';

import { Button, Modal } from 'antd';

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

    saveOnlyThis = () => this.saveItemHandler('ONLY_THIS');
    saveNew = () => this.saveItemHandler('NEW_ITEMS');
    saveAll = () => this.saveItemHandler('ALL_ITEMS');

    render() {
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
