import { StringOrCallback } from 'victory';

export const colorProp: StringOrCallback | undefined = ({ datum }: { datum?: { color: string } }) => datum?.color || '';
