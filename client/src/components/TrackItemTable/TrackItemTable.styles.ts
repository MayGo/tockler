import { Box, Flex } from '@rebass/grid';
import styled from 'styled-components';

export const FilterDropdown = styled(Flex).attrs({ p: 2 })`
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
`;

export const FilterInput = styled(Box).attrs({ mr: 1 })`
    width: 130px;
`;
export const Highlight = styled.span`
    color: #f50;
`;

export const TotalCount = styled.div`
    text-align: right;
    padding-right: 10px;
`;
