import dateFormat from 'date-fns/format'

export {
  monthLabelFormat as monthLabelFormatFn,
  weekdayLabelFormat as weekdayLabelFormatFn,
} from '@datepicker-react/hooks'

export const dayLabelFormatFn = (date: Date) => dateFormat(date, 'd')

export const defaultDisplayFormat = 'MM/dd/yyyy'
