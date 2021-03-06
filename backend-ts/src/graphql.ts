
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export interface IQuery {
    currentUser(): User | Promise<User>;
    userByName(name?: string): User | Promise<User>;
    timeline(beforeId?: string, count?: number): Post[] | Promise<Post[]>;
}

export interface User {
    id?: string;
    name?: string;
    joinedAt?: GraphQLTimestamp;
    isTwitterConnected?: boolean;
    categories?: Category[];
    recordCount?: number;
    postCount?: number;
}

export interface Category {
    id?: string;
    user?: User;
    name?: string;
}

export interface Post {
    id?: string;
    record?: Record;
    status?: string;
    comment?: string;
    user?: User;
}

export interface Record {
    id?: string;
}

export type GraphQLTimestamp = any;
