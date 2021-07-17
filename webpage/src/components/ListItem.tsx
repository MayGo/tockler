import React from 'react';
import { Text, Box, Flex } from '@chakra-ui/layout';

export const ListItem = ({ children }) => (
  <Flex alignItems="center">
    <Box pr={4}>
      <Box
        borderColor={'brand.mainColor'}
        borderWidth={1}
        w="14px"
        h="14px"
        minWidth="14px"
        borderRadius="full"
      />
    </Box>
    <Text fontSize="md">{children}</Text>
  </Flex>
);
