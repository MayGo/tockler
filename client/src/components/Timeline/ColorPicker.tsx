import React, { useState, useEffect } from 'react';
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

export const ColorPicker = ({ color = '#000000', onChange }: IProps) => {
    const [pickerColor, setPickerColor] = useState(color);
    const [displayColorPicker, setSisplayColorPicker] = useState(false);

    useEffect(() => {
        setPickerColor(color);
    }, [color]);

    const handleClick = () => {
        setSisplayColorPicker(!displayColorPicker);
    };

    const handleClose = () => {
        setSisplayColorPicker(false);
    };

    const handleChange = color => {
        setPickerColor(color.hex);
        onChange(color.hex);
    };

    const styles = reactCSS({
        default: {
            color: {
                width: '20px',
                height: '20px',
                borderRadius: '2px',
                background: pickerColor,
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
            <div style={styles.swatch} onClick={handleClick}>
                <div style={styles.color} />
                {displayColorPicker ? (
                    <div style={styles.popover}>
                        <div style={styles.cover} onClick={handleClose} />
                        <SketchPicker color={pickerColor} onChange={handleChange} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};
