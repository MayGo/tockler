import * as React from 'react';
import { Text } from '@chakra-ui/react';

export const MakeUnitSmaller: React.FC<any> = ({ children }) => {
    const values = children.split(/(\d+)/);

    return values.map(value => {
        if (isNaN(value)) {
            return (
                <Text key={value} fontSize="sm" color="gray.300" as="span">
                    {value}
                </Text>
            );
        }
        return value;
    });
};
