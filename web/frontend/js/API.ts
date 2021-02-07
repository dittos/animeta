import $ from 'jquery';
import { PostDTO, PostFetchOptions, RecordDTO, RecordFetchOptions, StatusType, UserFetchOptions } from '../../shared/types';
import * as CSRF from './CSRF';
import { CategoryDTO, UserDTO } from '../../shared/types';
import isString from 'lodash/isString';

export function serializeParams(params: any) {
  if (!params) {
    return params;
  }
  const result: {[key: string]: string} = {};
  for (var k in params) {
    const v = params[k];
    result[k] = isString(v) ? v : JSON.stringify(v);
  }
  return result;
}

export function toPromise<T>(jqXHR: JQueryXHR): Promise<T> {
  return new Promise((resolve, reject) => {
    jqXHR.then(data => resolve(data), err => reject(err))
  })
}

function get<T>(url: string, data: any = {}, customErrorHandling: boolean = false): Promise<T> {
  return toPromise($.get({
    url,
    data,
    __silent__: customErrorHandling,
  }))
}

function postJSON<T>(url: string, data: any = {}, customErrorHandling: boolean = false): Promise<T> {
  return CSRF.refresh().then(() => toPromise($.post({
    url,
    data: JSON.stringify(data),
    contentType: 'application/json',
    __silent__: customErrorHandling,
  })));
}

export function doDelete(url: string) {
  return CSRF.refresh().then(() => toPromise($.ajax({ type: 'DELETE', url })));
}

//////////////////////////

// Login Session

type AuthResult = {
  sessionKey: string;
  expiryMs: number;
};

export function authenticate(params: {
  username: string;
  password: string;
  persistent: boolean;
}): Promise<AuthResult> {
  return postJSON('/api/v3/Authenticate', params);
}

export function createFrontendSession(params: { authResult: AuthResult }) {
  return postJSON('/api/fe/sessions', params);
}

export function deleteFrontendSession() {
  return doDelete('/api/fe/sessions');
}

export async function getCurrentUser(params?: {
  options?: UserFetchOptions
}): Promise<UserDTO | null> {
  const data = params?.options ? {
    options: JSON.stringify(params.options)
  } : {}
  try {
    return await get('/api/v2/me', data, true);
  } catch (e) {
    if (e.statusCode) return null;
    else throw e;
  }
}

// Account

export function createAccount(params: {
  username: string;
  password1: string;
  password2: string;
}, customErrorHandling = false): Promise<{ authResult: AuthResult }> {
  return postJSON('/api/v3/CreateAccount', params, customErrorHandling);
}

export function changePassword(params: {
  oldPassword: string;
  newPassword: string;
}) {
  return postJSON('/api/v3/ChangePassword', params);
}

export function createBackup(): Promise<{ downloadUrl: string }> {
  return postJSON('/api/v3/CreateBackup');
}

// External Services

export function disconnectTwitter() {
  return postJSON('/api/v3/DisconnectTwitter');
}

// Record

export function createRecord(
  { title, statusType, status, categoryId, comment, publishTwitter }: {
    title: string;
    statusType: StatusType;
    status: string;
    categoryId: number | null;
    comment: string;
    publishTwitter: boolean;
  },
  options: RecordFetchOptions | null = {},
  postOptions: PostFetchOptions | null = null
): Promise<{ record: RecordDTO | null; post: PostDTO | null }> {
  return postJSON('/api/v3/CreateRecord', {
    title,
    categoryId,
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

// Category

export function renameCategory(id: number, name: string) {
  return postJSON('/api/v3/UpdateCategory', { id, name });
}

export function removeCategory(id: number) {
  return postJSON('/api/v3/DeleteCategory', { id });
}

// User Categories

export function addCategory(name: string): Promise<{ category: CategoryDTO }> {
  return postJSON('/api/v3/CreateCategory', {
    name,
  });
}

export function updateCategoryOrder(categoryIds: number[]): Promise<{ categories: CategoryDTO[] }> {
  return postJSON('/api/v3/UpdateCategoryOrder', { categoryIds });
}

// User Posts

export function getUserPosts(userName: string, count: number, beforeID?: number): Promise<PostDTO[]> {
  return get(`/api/v2/users/${userName}/posts`, {
    count,
    before_id: beforeID,
    options: JSON.stringify({
      record: {},
    }),
  });
}
