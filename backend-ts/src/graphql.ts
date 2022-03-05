
/*
 * -------------------------------------------------------
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
    currentUser(): Nullable<User> | Promise<Nullable<User>>;
    userByName(name?: Nullable<string>): Nullable<User> | Promise<Nullable<User>>;
    timeline(beforeId?: Nullable<string>, count?: Nullable<number>): Nullable<Nullable<Post>[]> | Promise<Nullable<Nullable<Post>[]>>;
    curatedLists(): Nullable<Nullable<CuratedList>[]> | Promise<Nullable<Nullable<CuratedList>[]>>;
    curatedList(id?: Nullable<string>): Nullable<CuratedList> | Promise<Nullable<CuratedList>>;
    searchWorks(query: string): Nullable<SearchWorksResult> | Promise<Nullable<SearchWorksResult>>;
}

export interface User {
    id?: Nullable<string>;
    name?: Nullable<string>;
    joinedAt?: Nullable<GraphQLTimestamp>;
    isTwitterConnected?: Nullable<boolean>;
    categories?: Nullable<Nullable<Category>[]>;
    recordCount?: Nullable<number>;
    postCount?: Nullable<number>;
}

export interface Category {
    id?: Nullable<string>;
    user?: Nullable<User>;
    name?: Nullable<string>;
}

export interface Post {
    id?: Nullable<string>;
    record?: Nullable<Record>;
    status?: Nullable<string>;
    comment?: Nullable<string>;
    user?: Nullable<User>;
}

export interface Record {
    id?: Nullable<string>;
    statusType?: Nullable<StatusType>;
    status?: Nullable<string>;
}

export interface CuratedList {
    id?: Nullable<string>;
    name?: Nullable<string>;
    works?: Nullable<CuratedListWorkConnection>;
}

export interface CuratedListWorkConnection {
    edges?: Nullable<Nullable<CuratedListWorkEdge>[]>;
    totalCount?: Nullable<number>;
}

export interface CuratedListWorkEdge {
    node?: Nullable<Work>;
}

export interface Work {
    id?: Nullable<string>;
    title?: Nullable<string>;
    imageUrl?: Nullable<string>;
    record?: Nullable<Record>;
    recordCount?: Nullable<number>;
}

export interface SearchWorksResult {
    edges: SearchWorksResultEdge[];
}

export interface SearchWorksResultEdge {
    node: Work;
    recordCount?: Nullable<number>;
}

export type GraphQLTimestamp = any;
type Nullable<T> = T | null;
