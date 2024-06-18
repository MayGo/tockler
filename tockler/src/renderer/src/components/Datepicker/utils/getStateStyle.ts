import { StateProp } from '../types'

export const getStateStyle = <T>({ base, active }: StateProp<T>, isActive: boolean) => {
  return isActive ? { ...base, ...active } : base
}
