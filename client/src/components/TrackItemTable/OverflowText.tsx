import { Tooltip, Text, TextProps } from '@chakra-ui/react';

interface IProps extends TextProps {
    value?: string;
}

export const OverflowText = ({ children, ...props }: TextProps) => {
    return (
        <Tooltip label={children}>
            <Text isTruncated {...props}>
                {children}
            </Text>
        </Tooltip>
    );
};

export const OverflowTextCell = ({ value }: IProps) => {
    return (
        <Tooltip label={value}>
            <Text noOfLines={1}>{value}</Text>
        </Tooltip>
    );
};
