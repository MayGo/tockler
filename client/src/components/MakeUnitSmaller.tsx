import { Text, useColorModeValue } from '@chakra-ui/react';

export const MakeUnitSmaller = ({ children }) => {
    const values = children.split(/(\d+)/);
    const color = useColorModeValue('gray.700', 'gray.300');

    return values.map((value) => {
        if (isNaN(value)) {
            return (
                <Text key={value} fontSize="sm" as="span" color={color}>
                    {value}
                </Text>
            );
        }
        return value;
    });
};
