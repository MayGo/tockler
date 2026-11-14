export interface IAppUsage {
    appName: string;
    appColor: string | null;
    categoryName: string | null;
    totalDuration: number;
}

export interface ICategoryUsage {
    categoryName: string;
    categoryColor: string | null;
    totalDuration: number;
}
