
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum StatusType {
    FINISHED = "FINISHED",
    WATCHING = "WATCHING",
    SUSPENDED = "SUSPENDED",
    INTERESTED = "INTERESTED"
}

export interface IQuery {
    currentUser(): User | Promise<User>;
    userByName(name?: string): User | Promise<User>;
    timeline(beforeId?: string, count?: number): Post[] | Promise<Post[]>;
    curatedLists(): CuratedList[] | Promise<CuratedList[]>;
    curatedList(id?: string): CuratedList | Promise<CuratedList>;
    searchWorks(query: string): SearchWorksResult | Promise<SearchWorksResult>;
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
    statusType?: StatusType;
    status?: string;
}

export interface CuratedList {
    id?: string;
    name?: string;
    works?: CuratedListWorkConnection;
}

export interface CuratedListWorkConnection {
    edges?: CuratedListWorkEdge[];
    totalCount?: number;
}

export interface CuratedListWorkEdge {
    node?: Work;
}

export interface Work {
    id?: string;
    title?: string;
    imageUrl?: string;
    record?: Record;
    recordCount?: number;
}

export interface SearchWorksResult {
    edges: SearchWorksResultEdge[];
}

export interface SearchWorksResultEdge {
    node: Work;
    recordCount?: number;
}

export type GraphQLTimestamp = any;
