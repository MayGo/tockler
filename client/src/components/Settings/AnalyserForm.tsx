import * as React from 'react';
import { FieldArray } from 'redux-form';
import { Card, Button, Icon, Tooltip } from 'antd';
import { AnalyserFormItemContainer } from './AnalyserFormItemContainer';

interface IProps {}

interface IState {}

const renderRow = ({ fields, meta: { error, submitFailed } }) => {
    return (
        <div>
            <div>{submitFailed && error && <span>{error}</span>}</div>
            {fields.map((row, index) => (
                <AnalyserFormItemContainer
                    key={index}
                    row={row}
                    index={index}
                    removeItem={() => fields.remove(index)}
                    analyserItem={fields.get(index)}
                />
            ))}
            <div>
                <Button type="primary" shape="circle" icon="plus" onClick={() => fields.push({})} />
            </div>
        </div>
    );
};

export class AnalyserForm extends React.Component<IProps, IState> {
    render() {
        return (
            <Card
                title="Analyser settings"
                extra={
                    <Tooltip placement="left" title="Notify if title equals these analyser items.">
                        <Icon type="info-circle" style={{ fontSize: 20, color: 'primary' }} />
                    </Tooltip>
                }
            >
                <FieldArray name="analyser" component={renderRow} rerenderOnEveryChange={true} />
            </Card>
        );
    }
}
