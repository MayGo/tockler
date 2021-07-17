import React from 'react';
import { Text, Box, Flex } from '@chakra-ui/layout';
import { Icon } from '@chakra-ui/react';

export const FeatureItem = ({ icon, title, children }) => (
  <Box>
    <Flex pb={5} alignItems="flex-end">
      <Box pr={5}>
        <Icon as={icon} width="60px" height="60px" color="brand.mainColor" />
      </Box>
      <Text fontSize="xx-large"> {title}</Text>
    </Flex>
    <Text fontSize="md">{children}</Text>
  </Box>
);
