import { Box, useMultiStyleConfig } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';

interface IProps {
    color: any;
    onChange: any;
    readOnly?: boolean;
}

const defaultColor = '#000000';
export const ColorPicker = ({ color = defaultColor, onChange, readOnly }: IProps) => {
    const [pickerColor, setPickerColor] = useState(color);

    const [displayColorPicker, setSisplayColorPicker] = useState(false);

    useEffect(() => {
        if (color) {
            setPickerColor(color);
        } else {
            setPickerColor(defaultColor);
        }
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

    const styles = useMultiStyleConfig('ColorPicker', { pickerColor });

    return (
        <Box __css={styles.swatch} onClick={handleClick}>
            <Box __css={styles.color} />

            {!readOnly && displayColorPicker ? (
                <Box __css={styles.popover}>
                    <Box __css={styles.cover} onClick={handleClose} />
                    <SketchPicker color={pickerColor} onChange={handleChange} />
                </Box>
            ) : null}
        </Box>
    );
};
