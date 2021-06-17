import { chakra } from '@chakra-ui/system';
import { transparentize } from '@chakra-ui/theme-tools';
import styled from 'styled-components';

export const SpinnerContainer = chakra('div', {
    baseStyle: {
        position: 'absolute',
        textAlign: 'center',
        bg: transparentize('gray.100', 0.75),
        borderRadius: 'md',
        padding: 6,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 10000,
        margin: 'auto auto',
    },
});
export const SpinnerContainer2 = styled.div`
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
