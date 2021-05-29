export type Token = {
    aud: string;
    email_verified: boolean;
    exp: number;
    ['https://hasura.io/jwt/claims']: {
        'x-hasura-agency-id': null | string;
        'x-hasura-client-id': null | string;
        'x-hasura-allowed-roles': string[];
        'x-hasura-default-role': string;
        'x-hasura-developer-id': null | string;
        'x-hasura-user-id': string;
    };
    iat: number;
    iss: string;
    nonce: string;
    sub: string;
    updated_at: string;
};

export type User = {
    id: number;
    clientId?: string | null;
    agencyId?: string | null;
    developerId?: string | null;
    candidateId?: string | null;
    roles: string[];
    defaultRole: string;
};
