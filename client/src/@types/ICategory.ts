export interface ICategory {
    id: number;
    name: string;
    color: string | null;
}

export type NewCategory = Omit<ICategory, 'id'>;
