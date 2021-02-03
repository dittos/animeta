import $ from 'jquery';
import { PostDTO, PostFetchOptions, RecordDTO, RecordFetchOptions, StatusType } from './types';
import * as CSRF from './CSRF';

function toPromise<T>(jqXHR: JQueryXHR): Promise<T> {
  return new Promise((resolve, reject) => {
    jqXHR.then(data => resolve(data), err => reject(err))
  })
}

function get<T>(url: string, params: any): Promise<T> {
  return toPromise($.get(url, params))
}

function postJSON<T>(url: string, data: any = {}, customErrorHandling: boolean = false): Promise<T> {
  return CSRF.refreshPromise().then(() => toPromise($.post({
    url,
    data: JSON.stringify(data),
    contentType: 'application/json',
    __silent__: customErrorHandling,
  } as any)));
}

//////////////////////////

export function createRecord(
  { title, statusType, status, categoryID, comment, publishTwitter }: {
    title: string;
    statusType: StatusType;
    status: string;
    categoryID: number | null;
    comment: string;
    publishTwitter: boolean;
  },
  options: RecordFetchOptions | null = {},
  postOptions: PostFetchOptions | null = null
): Promise<{ record: RecordDTO | null; post: PostDTO | null }> {
  return postJSON('/api/v3/CreateRecord', {
    title,
    categoryId: categoryID,
    status,
    statusType: statusType.toUpperCase(),
    comment,
    publishTwitter,
    options,
    postOptions,
  });
}

export function getRecordPosts(recordID: number): Promise<{posts: PostDTO[]}> {
  return get(`/api/v2/records/${recordID}/posts`, {
    options: JSON.stringify({}),
  });
}

export function updateRecordTitle(id: number, title: string, options: RecordFetchOptions): Promise<{ record: RecordDTO }> {
  return postJSON('/api/v3/UpdateRecord', {
    id,
    title,
    options,
  });
}

export function updateRecordCategoryID(id: number, categoryId: number | null, options: RecordFetchOptions): Promise<{ record: RecordDTO }> {
  return postJSON('/api/v3/UpdateRecord', {
    id,
    categoryId,
    categoryIdIsSet: true,
    options,
  });
}

export function deleteRecord(id: number): Promise<{ ok: boolean }> {
  return postJSON('/api/v3/DeleteRecord', { id });
}

export type CreatePostParams = {
  status: string;
  statusType: StatusType;
  comment: string;
  containsSpoiler: boolean;
  publishTwitter: boolean;
};

export function createPost(
  recordId: number,
  { status, statusType, comment, containsSpoiler, publishTwitter }: CreatePostParams,
  options?: RecordFetchOptions,
): Promise<{ post: PostDTO }> {
  return postJSON('/api/v3/CreatePost', {
    recordId,
    status,
    statusType: statusType.toUpperCase(),
    comment,
    containsSpoiler: containsSpoiler || false,
    publishTwitter: publishTwitter || false,
    options,
  });
}

// Post

export function deletePost(id: number, recordOptions: RecordFetchOptions): Promise<{ record: RecordDTO | null }> {
  return postJSON('/api/v3/DeletePost', { id, recordOptions });
}
