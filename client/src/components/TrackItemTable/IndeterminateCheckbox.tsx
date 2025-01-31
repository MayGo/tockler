import { Checkbox } from '@chakra-ui/react';

export const IndeterminateCheckbox = ({ indeterminate, ...rest }) => {
    return <Checkbox isIndeterminate={indeterminate} {...rest} />;
};
