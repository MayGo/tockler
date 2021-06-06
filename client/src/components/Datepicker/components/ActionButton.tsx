import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { IconButton, IconButtonProps } from '@chakra-ui/react'
import React from 'react'
import { useStyleProps } from '../context/StylesContext'
import { ActionButtonStyles } from '../types'

export interface ActionButtonProps extends Omit<IconButtonProps, 'aria-label'> {
  direction?: 'up' | 'right' | 'down' | 'left'
}

export const ActionButton: React.FC<ActionButtonProps> = ({ direction, ...props }) => {
  let IconComponent = ChevronLeftIcon

  const styleProps = useStyleProps<ActionButtonStyles>({
    actionButton: {
      position: 'relative',
    },
  })

  if (direction === 'up') {
    IconComponent = ChevronUpIcon
  } else if (direction === 'right') {
    IconComponent = ChevronRightIcon
  } else if (direction === 'down') {
    IconComponent = ChevronDownIcon
  } else if (direction === 'left') {
    IconComponent = ChevronLeftIcon
  }

  return (
    <IconButton
      aria-label={`Arrow ${direction}`}
      icon={<IconComponent />}
      {...props}
      {...styleProps.actionButton}
    />
  )
}
