import * as Sentry from '@sentry/react';
import fetch from 'cross-fetch';
import { PostDTO, PostFetchOptions, RecordDTO, RecordFetchOptions, LegacyStatusType, UserFetchOptions, StatusType } from '../../shared/types';
import * as CSRF from './CSRF';
import { CategoryDTO, UserDTO } from '../../shared/types';
import isString from 'lodash/isString';
import graphqlRequest, { ClientError } from 'graphql-request';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { GraphQLRequestContext, GraphQLResponse } from 'graphql-request/dist/types';

function serializeParams(params: any) {
  if (!params) {
    return params;
  }
  const result: {[key: string]: string} = {};
  for (var k in params) {
    const v = params[k];
    if (typeof v !== 'undefined') {
      result[k] = isString(v) ? v : JSON.stringify(v);
    }
  }
  return result;
}

async function handleError(
  request: ApiRequest,
  response: Response | null,
  thrownError: any,
  customErrorHandling: boolean
) {
  if (customErrorHandling) return;

  try {
    const responseText = await response?.text()
    Sentry.captureMessage(thrownError?.message || response?.statusText, {
      extra: {
        method: request.method,
        url: request.url,
        params: request.params,
        status: response?.status,
        error: thrownError || response?.statusText,
        response: responseText && responseText.substring(0, 100),
      },
    });
  } catch (e) {
    try {
      Sentry.captureException(e);
    } catch (e2) {
      // ignore
    }
  }

  if (thrownError instanceof ApiError) {
    alert(thrownError.message)
  } else {
    alert('서버 오류로 요청에 실패했습니다.')
  }
}

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly payload: any) {
    super(payload.message)

    // https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript/
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

type ApiRequest = {
  method: string
  url: string
  params: any
}

async function _fetch<T>(
  method: 'GET' | 'POST' | 'DELETE',
  url: string,
  params: any,
  customErrorHandling: boolean
): Promise<T> {
  const originalUrl = url
  if (method === 'GET') {
    const qs = new URLSearchParams(serializeParams(params) ?? {}).toString()
    if (qs) url += '?' + qs
  }
  let response: Response | null = null
  try {
    const init: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
      },
      // 'same-origin' does not work on Firefox private browsing
      credentials: 'include',
    }
    if (method !== 'GET') {
      // try to refresh CSRF token if not exists
      try {
        await CSRF.refresh()
      } catch (e) {
        Sentry.captureException(e)
        // ignore
      }

      if (typeof params !== 'undefined') {
        init.body = JSON.stringify(params)
      }
      init.headers = {
        ...init.headers,
        'Content-Type': 'application/json',
        'X-CSRF-Token': CSRF.getToken(),
      }
    }
    const r = await fetch(url, init)
    response = r.clone() // store cloned response for double body consume in handleError
    const body = await r.json()
    if (r.ok) {
      return body
    } else {
      throw new ApiError(r.status, body)
    }
  } catch (e) {
    await handleError({
      method,
      url: originalUrl,
      params,
    }, response, e, customErrorHandling)
    throw e
  }
}

export async function get<T>(url: string, params: any = {}, customErrorHandling: boolean = false): Promise<T> {
  return _fetch('GET', url, params, customErrorHandling)
}

export function postJSON<T>(url: string, params: any = {}, customErrorHandling: boolean = false): Promise<T> {
  return _fetch('POST', url, params, customErrorHandling)
}

export function doDelete(url: string) {
  return _fetch('DELETE', url, undefined, false)
}

//////////////////////////

// Login Session

export type AuthResult = {
  sessionKey: string;
  expiryMs: number;
};

export function authenticate(params: {
  username: string;
  password: string;
  persistent: boolean;
}): Promise<AuthResult> {
  return postJSON('/api/v4/Authenticate', params);
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
  try {
    return await get('/api/v4/me', params, true);
  } catch (e) {
    if (e.status && 400 <= e.status && e.status < 500) return null;
    else throw e;
  }
}

// Account

export function createAccount(params: {
  username: string;
  password1: string;
  password2: string;
}, customErrorHandling = false): Promise<{ authResult: AuthResult }> {
  return postJSON('/api/v4/CreateAccount', params, customErrorHandling);
}

export function changePassword(params: {
  oldPassword: string;
  newPassword: string;
}) {
  return postJSON('/api/v4/ChangePassword', params);
}

export function createBackup(): Promise<{ downloadUrl: string }> {
  return postJSON('/api/v4/CreateBackup');
}

// External Services

export function disconnectTwitter() {
  return postJSON('/api/v4/DisconnectTwitter');
}

// Record

export function createRecord(
  { title, statusType, status, categoryId, comment, rating, publishTwitter }: {
    title: string;
    statusType: StatusType;
    status: string;
    categoryId: number | null;
    comment: string;
    rating: number | null;
    publishTwitter: boolean;
  },
  options: RecordFetchOptions | null = {},
  postOptions: PostFetchOptions | null = null
): Promise<{ record: RecordDTO | null; post: PostDTO | null }> {
  return postJSON('/api/v4/CreateRecord', {
    title,
    categoryId,
    status,
    statusType,
    comment,
    rating,
    publishTwitter,
    options,
    postOptions,
  });
}

export function getRecordPosts(recordID: number): Promise<{posts: PostDTO[]}> {
  return get(`/api/v4/records/${recordID}/posts`, {
    options: {},
  });
}

export function updateRecordTitle(id: number, title: string, options: RecordFetchOptions): Promise<{ record: RecordDTO }> {
  return postJSON('/api/v4/UpdateRecord', {
    id,
    title,
    options,
  });
}

export function updateRecordCategoryID(id: number, categoryId: number | null, options: RecordFetchOptions): Promise<{ record: RecordDTO }> {
  return postJSON('/api/v4/UpdateRecord', {
    id,
    categoryId,
    categoryIdIsSet: true,
    options,
  });
}

export function updateRecordRating(id: number, rating: number | null, options: RecordFetchOptions): Promise<{ record: RecordDTO }> {
  return postJSON('/api/v4/UpdateRecord', {
    id,
    rating,
    ratingIsSet: true,
    options,
  });
}

export function deleteRecord(id: number): Promise<{ ok: boolean }> {
  return postJSON('/api/v4/DeleteRecord', { id });
}

export type CreatePostParams = {
  status: string;
  statusType: LegacyStatusType;
  comment: string;
  containsSpoiler: boolean;
  publishTwitter: boolean;
};

export function createPost(
  recordId: number,
  { status, statusType, comment, containsSpoiler, publishTwitter }: CreatePostParams,
  options?: RecordFetchOptions,
): Promise<{ post: PostDTO }> {
  return postJSON('/api/v4/CreatePost', {
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
  return postJSON('/api/v4/DeletePost', { id, recordOptions });
}

// Category

export function renameCategory(id: number, name: string) {
  return postJSON('/api/v4/UpdateCategory', { id, name });
}

export function removeCategory(id: number) {
  return postJSON('/api/v4/DeleteCategory', { id });
}

// User Categories

export function addCategory(name: string): Promise<{ category: CategoryDTO }> {
  return postJSON('/api/v4/CreateCategory', {
    name,
  });
}

export function updateCategoryOrder(categoryIds: number[]): Promise<{ categories: CategoryDTO[] }> {
  return postJSON('/api/v4/UpdateCategoryOrder', { categoryIds });
}

// User Records

export function getUserRecords(username: string, params: {}): Promise<RecordDTO[]> {
  return get(`/api/v4/users/${username}/records`, params);
}

// GraphQL

export async function graphql<Result, Variables>(doc: TypedDocumentNode<Result, Variables>, variables?: Variables, customErrorHandling: boolean = false): Promise<Result> {
  // try to refresh CSRF token if not exists
  try {
    await CSRF.refresh()
  } catch (e) {
    Sentry.captureException(e)
    // ignore
  }
  try {
    return await graphqlRequest('/api/graphql', doc, variables, {
      'Accept': 'application/json',
      'X-CSRF-Token': CSRF.getToken(),
    })
  } catch (e) {
    if (e instanceof ClientError) {
      await handleGqlError(e.request, e.response, e, customErrorHandling)
    } else {
      if (!customErrorHandling) {
        alert(`서버 오류로 요청에 실패했습니다.`)
      }
    }
    throw e
  }
}

async function handleGqlError(
  request: GraphQLRequestContext,
  response: GraphQLResponse,
  thrownError: any,
  customErrorHandling: boolean,
) {
  if (customErrorHandling) return;

  const message = response.errors?.[0]?.message

  try {
    let responseText = ""
    try {
      responseText = JSON.stringify(response)
    } catch (e) {
      // ignore
    }
    Sentry.captureMessage(message ?? `GraphQL Error (Code: ${response.status})`, {
      extra: {
        query: request.query,
        variables: request.variables,
        status: response?.status,
        error: thrownError,
        response: responseText.substring(0, 100),
      },
    });
  } catch (e) {
    try {
      Sentry.captureException(e);
    } catch (e2) {
      // ignore
    }
  }

  if (message) {
    alert(message)
  } else {
    alert(`서버 오류로 요청에 실패했습니다. [${response.status}]`)
  }
}
