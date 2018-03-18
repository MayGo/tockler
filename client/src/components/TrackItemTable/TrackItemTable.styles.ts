import styled from 'styled-components';
import { Box, Flex } from 'grid-styled';

export const FilterDropdown = Flex.extend.attrs({ p: 2 })`
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);

`;

export const FilterInput = Box.extend.attrs({ mr: 1 })`
    width: 130px;
`;
export const Highlight = styled.span`
    color: #f50;
`;
