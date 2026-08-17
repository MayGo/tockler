export interface IMatterReviewItem {
    id: number;
    app: string;
    title: string | null;
    url: string | null;
    beginDate: number;
    endDate: number;
    matterId: number | null;
    matterCaseReference: string | null;
    matterClientName: string | null;
    matterColor: string | null;
    matchType: string | null;
    matchedText: string | null;
}
