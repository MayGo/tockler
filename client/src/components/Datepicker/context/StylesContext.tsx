import { createContext, FC, ReactNode, useContext } from 'react';
import { DatepickerStyles } from '../types';
import merge from '../utils/deepmerge';
import pick from '../utils/pick';

export interface StylesContextProps {
    overwriteDefaultStyles: boolean;
    styles: DatepickerStyles;
}

export interface StylesProviderProps {
    overwriteDefaultStyles?: boolean;
    styles?: Partial<DatepickerStyles>;
    children: ReactNode;
}

export const emptyStylesObject: DatepickerStyles = {
    actionButton: {},
    arrowIcon: {},
    buttonsWrapper: {},
    closeButton: {},
    datepickerContainer: {},
    dateRangeInputContainer: {},
    dateRangeInputDivider: {},
    day: {
        base: {},
        normal: {},
        rangeHover: {},
        selected: {},
        first: {},
        firstOrLast: {},
        last: {},
    },
    dayContainer: {
        base: {},
        normal: {},
        rangeHover: {},
        selected: {},
        first: {},
        firstOrLast: {},
        last: {},
    },
    inputComponentIcon: {
        active: {},
        base: {},
    },
    inputComponentInput: {
        active: {},
        base: {},
    },
    inputComponentInputAddon: {
        active: {},
        base: {},
    },
    inputComponentInputGroup: {
        active: {},
        base: {},
    },
    monthContainer: {},
    monthDayGrid: {},
    monthMonthLabel: {},
    monthsWrapper: {},
    monthWeekdayLabel: {},
    resetDatesButton: {},
    selectDateContainer: {
        active: {},
        base: {},
    },
    selectDateDateText: {
        active: {},
        base: {},
    },
    selectDateText: {
        active: {},
        base: {},
    },
    datepickerHeader: {},
    emptyDay: {},
};

export const StylesContext = createContext<StylesContextProps>({
    styles: emptyStylesObject,
    overwriteDefaultStyles: false,
});

export const StylesProvider: FC<StylesProviderProps> = ({
    children,
    overwriteDefaultStyles = false,
    styles = emptyStylesObject,
}) => (
    <StylesContext.Provider value={{ overwriteDefaultStyles, styles: merge(emptyStylesObject, styles) }}>
        {children}
    </StylesContext.Provider>
);

export function useStyleProps<InitialStyles extends Partial<DatepickerStyles> = Partial<DatepickerStyles>>(
    inlineStyles: InitialStyles,
) {
    const { styles, overwriteDefaultStyles } = useContext(StylesContext);
    const keys = Object.keys(inlineStyles) as (keyof DatepickerStyles)[];
    const filteredStyles = pick(styles, keys);
    const result = merge(filteredStyles, !overwriteDefaultStyles ? inlineStyles : ({} as InitialStyles));
    return result;
}
