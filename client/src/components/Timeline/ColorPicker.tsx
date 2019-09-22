import React from 'react';
import { SketchPicker } from 'react-color';
import reactCSS from 'reactcss';

interface IProps {
    color: any;
    onChange: any;
}
interface IState {
    color: any;
    displayColorPicker?: any;
}

export class ColorPicker extends React.PureComponent<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            displayColorPicker: false,
            color: props.color || '#000000',
        };
    }

    public componentWillReceiveProps(nextProps: any) {
        if (nextProps.color) {
            this.setState({
                color: nextProps.color,
            });
        }
    }

    public handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker });
    };

    public handleClose = () => {
        this.setState({ displayColorPicker: false });
    };

    public handleChange = color => {
        this.setState({ color: color.hex });
        this.props.onChange(color.hex);
    };

    public render() {
        const styles = reactCSS({
            default: {
                color: {
                    width: '20px',
                    height: '20px',
                    borderRadius: '2px',
                    background: this.state.color,
                },
                swatch: {
                    marginTop: '1px',
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '3px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                    position: 'relative',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                    right: '0',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
        });

        return (
            <div>
                <div style={styles.swatch} onClick={this.handleClick}>
                    <div style={styles.color} />
                    {this.state.displayColorPicker ? (
                        <div style={styles.popover}>
                            <div style={styles.cover} onClick={this.handleClose} />
                            <SketchPicker color={this.state.color} onChange={this.handleChange} />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}
