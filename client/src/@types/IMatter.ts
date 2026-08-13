export interface IMatter {
    id: number;
    caseReference: string;
    clientName: string;
    keywords: string; // JSON-encoded string[], as stored
    color?: string | null;
    archived: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface MatterInput {
    caseReference: string;
    clientName: string;
    keywords: string[];
    color?: string;
    archived?: boolean;
}
