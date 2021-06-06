import { Box } from '@chakra-ui/layout';
import styled from 'styled-components';

export const LineChartBox = styled(Box).attrs({ m: 2, p: 2 })`
    background: ${({ theme: { variables } }) => variables['@component-background']};
`;
