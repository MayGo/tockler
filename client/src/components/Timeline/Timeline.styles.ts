import styled from 'styled-components';

import { Box } from 'reflexbox';

export const MainChart = styled(Box).attrs({ mb: 2, py: 2 })`
    border-top: 1px solid ${({ theme: { variables } }) => variables['@normal-color']};

    background-color: ${({ theme: { variables } }) => variables['@normal-color']};
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

export const BrushChart = styled(Box).attrs({ mb: 2, py: 1 })`
    border-top: 1px solid ${({ theme: { variables } }) => variables['@normal-color']};
    border-bottom: 1px solid ${({ theme: { variables } }) => variables['@normal-color']};
    background: ${({ theme: { variables } }) => variables['@component-background']};
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

export const Spinner = styled.div`
    position: absolute;
    text-align: center;
    background: ${({ theme: { variables } }) => variables['@normal-color']};
    opacity: 0.85;
    border-radius: 4px;
    padding: 50px;
    width: 100%;
    height: 100%;
    z-index: 10000;
    margin: auto auto;
`;
