import {
    Box,
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
    useMultiStyleConfig,
    useColorMode,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { ColorPicker as ReactPicker, useColor, toColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';
import { THEMES } from '../../store/theme.util';

interface IProps {
    color: any;
    onChange: any;
    readOnly?: boolean;
}

const defaultColor = '#000000';

export const ColorPicker = ({ color = defaultColor, onChange }: IProps) => {
    const { colorMode } = useColorMode();
    const [pickerColor, setPickerColor] = useColor('hex', color);

    useEffect(() => {
        if (color) {
            setPickerColor(toColor('hex', color));
        } else {
            setPickerColor(toColor('hex', defaultColor));
        }
    }, [setPickerColor, color]);

    const handleChange = (value) => {
        setPickerColor(value);
        onChange(value.hex);
    };

    const styles = useMultiStyleConfig('ColorPicker', { bgColor: pickerColor.hex });

    return (
        <>
            <Popover>
                <PopoverTrigger>
                    <Button __css={styles.button}>
                        <Box __css={styles.color}></Box>
                    </Button>
                </PopoverTrigger>
                <PopoverContent p={0} mx={2} border="none" background="transparent" boxShadow="lg">
                    <ReactPicker
                        width={320}
                        height={200}
                        color={pickerColor}
                        onChange={handleChange}
                        hideHSV
                        dark={colorMode === THEMES.DARK}
                    />
                </PopoverContent>
            </Popover>
        </>
    );
};
