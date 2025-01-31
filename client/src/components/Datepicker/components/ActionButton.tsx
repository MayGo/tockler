import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { IconButton, IconButtonProps, Tooltip } from '@chakra-ui/react';

import { useStyleProps } from '../context/StylesContext';
import { ActionButtonStyles } from '../types';

export interface ActionButtonProps extends Omit<IconButtonProps, 'aria-label'> {
    direction?: 'up' | 'right' | 'down' | 'left';
    tooltipLabel;
}

export const ActionButton = ({ direction, tooltipLabel, ...props }: ActionButtonProps) => {
    let IconComponent = ChevronLeftIcon;

    const styleProps = useStyleProps<ActionButtonStyles>({
        actionButton: {
            position: 'relative',
        },
    });

    if (direction === 'up') {
        IconComponent = ChevronUpIcon;
    } else if (direction === 'right') {
        IconComponent = ChevronRightIcon;
    } else if (direction === 'down') {
        IconComponent = ChevronDownIcon;
    } else if (direction === 'left') {
        IconComponent = ChevronLeftIcon;
    }

    return (
        <Tooltip label={tooltipLabel}>
            <IconButton
                aria-label={`Arrow ${direction}`}
                icon={<IconComponent />}
                {...props}
                {...styleProps.actionButton}
            />
        </Tooltip>
    );
};
