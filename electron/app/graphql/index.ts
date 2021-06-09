import { ApolloQueryResult } from 'apollo-client/core/types';
import { NetworkStatus } from 'apollo-client/core/networkStatus';
import { GraphQLError } from 'graphql';
import fetch from 'node-fetch';
import { verify, decode, JwtHeader, SignCallback, SignOptions } from 'jsonwebtoken';

import type { Token, User } from './types';
import { logService } from '../services/log-service';

global.Headers = fetch.Headers;

async function getJwtKey(issuer: string) {
    const jwksClient = await import('jwks-rsa');
    return (header: JwtHeader, callback: SignCallback) => {
        try {
            // FIXME: removing @ts-ignore-next-line shows a typescript error
            // @ts-ignore-next-line
            const client = jwksClient.default({
                jwksUri: `${issuer}/.well-known/jwks.json`,
            });
            client.getSigningKey(header.kid as string, (_, key: any) => {
                const signingKey = key.publicKey || key.rsaPublicKey;
                callback(null, signingKey);
            });
        } catch (err) {
            callback(err, undefined);
        }
    };
}

function verifyToken(decoded: Token | null | undefined) {
    try {
        if (
            !decoded ||
            !decoded.exp ||
            !decoded['https://hasura.io/jwt/claims'] ||
            Date.now() >= decoded.exp * 1000
        ) {
            console.log('bad token: ', JSON.stringify(decoded, null, 4));
            return null;
        }

        return {
            id: +decoded['https://hasura.io/jwt/claims']['x-hasura-user-id'],
            clientId: decoded['https://hasura.io/jwt/claims']['x-hasura-client-id'],
            agencyId: decoded['https://hasura.io/jwt/claims']['x-hasura-agency-id'],
            developerId: decoded['https://hasura.io/jwt/claims']['x-hasura-developer-id'],
            roles: decoded['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'],
            defaultRole: decoded['https://hasura.io/jwt/claims']['x-hasura-default-role'],
        };
    } catch (ex) {
        console.error('error parsing JSON token:', ex);
        logService
            .createOrUpdateLog({
                type: 'ERROR',
                message: `Error parsing JSON token: "${ex.message}"`,
                jsonData: ex.toString(),
            })
            .catch(console.error);
        return null;
    }
}

/*
    TODO: this does NOT work in the browser, as getJwtKey() throws an exception
    Currently hacked through dynamic imports to make it work.
  */
export async function getUserFromTokenSecure(issuer: string, token?: string) {
    if (!token) {
        return null;
    }
    const options: SignOptions = {
        issuer,
        algorithm: 'RS256',
    };

    return new Promise<User | null>(async (res) => {
        try {
            verify(token, await getJwtKey(issuer), options, (err, decoded: any) => {
                if (err) {
                    console.error('got back error decoding token', err);
                    logService
                        .createOrUpdateLog({
                            type: 'ERROR',
                            message: `Got back error decoding token: "${err.message}"`,
                            jsonData: err.toString(),
                        })
                        .catch(console.error);
                    return res(null);
                }

                return res(verifyToken(decoded));
            });
        } catch (err) {
            console.error('error parsing JSON token:', err);
            logService
                .createOrUpdateLog({
                    type: 'ERROR',
                    message: `Error parsing JSON token: "${err.message}"`,
                    jsonData: err.toString(),
                })
                .catch(console.error);
            return res(null);
        }
    });
}

export const getUserFromToken = (token?: string) => {
    if (!token) {
        console.log('got back empty token ... returning early');
        return null;
    }
    const decoded = decode(token, { json: true }) as null | Token;
    return verifyToken(decoded);
};

export default function customFetch({
    token,
    secret,
    path,
    host,
}: {
    token?: string;
    secret?: string;
    path: string;
    host: string;
}) {
    const isSecure = !(host.indexOf('.local') !== -1 || host.indexOf('localhost') !== -1);
    const user = getUserFromToken(token);
    const uri = `${isSecure ? 'https' : 'http'}://${host}${path}`;
    const requestHeaders: HeadersInit = new Headers([
        ['Content-Type', 'application/json'],
        ['credentials', 'same-origin'],
        ['x-gitstart-fetch', 'true'],
    ]);

    if (token && !secret) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
    } else if (secret) {
        requestHeaders.set('x-hasura-admin-secret', secret);
    }

    if (user?.id) {
        requestHeaders.set('x-hasura-user-id', user.id.toString());
    }

    return async <T, U>({
        operationAction,
        variables,
        role: authRole,
    }: {
        operationAction: string;
        variables?: U | null;
        role?: string;
    }): Promise<ApolloQueryResult<T>> => {
        if (authRole) {
            requestHeaders.set('x-hasura-role', authRole);
        }

        const resp = await fetch(uri, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify({
                query: operationAction,
                variables,
            }),
        });

        if (!resp.ok) {
            throw new GraphQLError(resp.statusText);
        }

        const respJson = await resp.json();

        if (respJson?.errors) {
            throw respJson.errors[0];
        }

        return Promise.resolve({
            data: respJson?.data,
            errors: [],
            stale: false,
            loading: false,
            networkStatus: NetworkStatus.ready,
        });
    };
}

export const fetchGraphQLClient = (host: string, options: { token?: string; secret?: string }) => {
    return customFetch({
        token: options.token,
        secret: options.secret,
        host,
        path: '/v1/graphql',
    });
};
