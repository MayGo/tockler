import styled from 'styled-components';

export const MainChart = styled.div`
    border-top: 1px solid lightgray;
    height: 110px;
    background: white;
`;

export const BrushChart = styled.div`
    border-top: 1px solid lightgray;
    border-bottom: 1px solid lightgray;
    background: #f8f8f8;
    height: 70px;
`;

export const Spinner = styled.div`
    position: absolute;
    text-align: center;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    padding: 50px;
    width: 100%;
    height: 100%;
    z-index: 10000;
    margin: auto auto;
`;
