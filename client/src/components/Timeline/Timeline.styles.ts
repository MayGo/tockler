import styled from 'styled-components';

import { Box } from '@rebass/grid';

export const MainChart = styled(Box).attrs({ mb: 2, py: 2 })`
    border-top: 1px solid white;

    background: white;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

export const BrushChart = styled(Box).attrs({ mb: 2, py: 1 })`
    border-top: 1px solid white;
    border-bottom: 1px solid white;
    background: #f8f8f8;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

export const Spinner = styled.div`
    position: absolute;
    text-align: center;
    background: rgba(255, 255, 255, 0.75);
    border-radius: 4px;
    padding: 50px;
    width: 100%;
    height: 100%;
    z-index: 10000;
    margin: auto auto;
`;
