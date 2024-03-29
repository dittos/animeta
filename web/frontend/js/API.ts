import * as Sentry from '@sentry/react';
import fetch from 'cross-fetch';
import * as CSRF from './CSRF';
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
  expiryMs: number | null;
};

export function createFrontendSession(params: { authResult: AuthResult }) {
  return postJSON('/api/fe/sessions', params);
}

export function deleteFrontendSession() {
  return doDelete('/api/fe/sessions');
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
