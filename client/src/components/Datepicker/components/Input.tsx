import { CalendarIcon } from '@chakra-ui/icons';
import {
    Icon,
    Input as ChakraInput,
    InputGroup,
    InputRightElement,
    InputProps as ChakraInputProps,
} from '@chakra-ui/react';
import { parseDate } from '@datepicker-react/hooks';
import { ChangeEvent, FocusEvent, forwardRef, Ref, useEffect, useRef, useState } from 'react';
import { useStyleProps } from '../context/StylesContext';
import { InputComponentStyles, InputDate } from '../types';
import { defaultDisplayFormat } from '../utils/formatters';
import { getStateStyle } from '../utils/getStateStyle';

export interface InputProps {
    allowEditableInputs?: boolean;
    dateFormat?: string;
    disableAccessibility?: boolean;
    iconComponent?: typeof CalendarIcon;
    id?: string;
    isActive?: boolean;
    name?: string;
    onChange?(date: InputDate): void;
    onClick?(): void;
    placeholder?: string;
    showCalendarIcon?: boolean;
    value?: string;
}

interface BaseProps extends Omit<ChakraInputProps, 'onChange' | 'onClick' | 'value'>, InputProps {}

export const Input = forwardRef((props: BaseProps, inputRef: Ref<any>) => {
    const {
        dateFormat = defaultDisplayFormat,
        disableAccessibility,
        iconComponent = CalendarIcon,
        id,
        isActive = false,
        name,
        onChange = () => {},
        onClick = () => {},
        placeholder,
        showCalendarIcon = true,
        value,
        allowEditableInputs = false,

        ...inputProps
    } = props;

    const ref = useRef<any>(null);

    const [searchString, setSearchString] = useState(value);

    const styleProps = useStyleProps<InputComponentStyles>({
        inputComponentInputGroup: {
            base: {},
            active: {},
        },
        inputComponentInput: {
            base: {},
            active: {},
        },
        inputComponentIcon: {
            base: {},
            active: {},
        },
        inputComponentInputAddon: {
            base: {},
            active: {},
        },
    });

    // Note: value was updated outside of InputComponent
    useEffect(() => {
        setSearchString(value);
    }, [value]);

    function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
        const dateValue = e.target.value;
        setSearchString(dateValue);

        if (typeof ref.current === 'number') {
            clearTimeout(ref.current);
        }

        ref.current = setTimeout(() => {
            onClick();
            const parsedDate = parseDate(dateValue, dateFormat, new Date());
            const isValidDate = !isNaN(parsedDate.getDate());

            if (isValidDate) {
                onChange(parsedDate);
            } else {
                onChange(null);
            }
        }, 1000);
    }

    function handleOnFocus(_e: FocusEvent<HTMLInputElement>) {
        onClick();
    }

    return (
        <InputGroup {...getStateStyle(styleProps.inputComponentInputGroup, isActive)} htmlFor={id}>
            {showCalendarIcon && (
                <InputRightElement
                    {...getStateStyle(styleProps.inputComponentInputAddon, isActive)}
                    children={<Icon as={iconComponent} {...getStateStyle(styleProps.inputComponentIcon, isActive)} />}
                />
            )}
            <ChakraInput
                {...inputProps}
                {...getStateStyle(styleProps.inputComponentInput, isActive)}
                ref={inputRef}
                id={id}
                name={name}
                isReadOnly={!allowEditableInputs}
                value={searchString}
                placeholder={placeholder}
                tabIndex={disableAccessibility ? -1 : 0}
                autoComplete="off"
                data-testid="DatepickerInput"
                onFocus={handleOnFocus}
                onChange={handleOnChange}
            />
        </InputGroup>
    );
});
