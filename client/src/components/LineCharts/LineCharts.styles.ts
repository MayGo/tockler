import styled from 'styled-components';
import { Box } from 'reflexbox';

export const LineChartBox = styled(Box).attrs({ m: 2, p: 2 })`
    background: ${({ theme: { variables } }) => variables['@component-background']};
`;
