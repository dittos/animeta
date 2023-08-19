/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.28.785 on 2021-02-27 21:41:30.

export interface CategoryDTO {
    id: number;
    name: string;
}

export interface Episode {
    number: number;
    post_count: number | null;
}

export interface ErrorDTO {
    message: string;
    extra: any | null;
}

export interface PostDTO {
    id: number;
    record_id: number;
    status: string;
    status_type: string;
    comment: string;
    updated_at: number | null;
    contains_spoiler: boolean;
    record: RecordDTO | null;
    user: UserDTO | null;
    rating: number | null;
}

export interface RecordDTO {
    id: number;
    user_id: number;
    work_id: number;
    category_id: number | null;
    title: string;
    status: string;
    status_type: string;
    updated_at: number | null;
    has_newer_episode: boolean | null;
    user: UserDTO | null;
    rating: number | null;
}

export interface UserDTO {
    id: number;
    name: string;
    date_joined: number;
    categories: CategoryDTO[] | null;
    record_count: number | null;
    history_count: number | null;
    is_twitter_connected: boolean | null;
}

export interface WorkLinks {
    website: string | null;
    namu: string | null;
    ann: string | null;
}

export interface WorkMetadataDTO {
    title: string;
    links: WorkLinks;
    studios: string[] | null;
    source: WorkMetadata$SourceType | null;
    schedule: { [index: string]: WorkSchedule | null } | null;
    durationMinutes: number | null;
}

export interface WorkSchedule {
    date: number | null;
    date_only: boolean | null;
    broadcasts: string[] | null;
}

export type WorkMetadata$SourceType = "MANGA" | "ORIGINAL" | "LIGHT_NOVEL" | "GAME" | "FOUR_KOMA" | "VISUAL_NOVEL" | "NOVEL";
