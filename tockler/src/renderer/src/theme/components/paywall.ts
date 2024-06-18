import { mode, transparentize } from '@chakra-ui/theme-tools';

export const PaywallStyle = {
    parts: ['overlay'],
    baseStyle: props => ({
        overlay: {
            background: mode(
                transparentize(`white`, 0.5)(props.theme),
                transparentize(`black`, 0.5)(props.theme),
            )(props),
            backdropFilter: 'blur(4px)',
        },
    }),
};
