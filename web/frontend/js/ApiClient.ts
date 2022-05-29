import * as Sentry from '@sentry/react';
import fetch from 'cross-fetch';
import * as CSRF from './CSRF';
import { Client } from "../../shared/client";
import { ApiError } from './API';

type CallOptions = {
  customErrorHandling?: boolean;
}

type ApiRequest = {
  url: string
  params: any
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

  // TODO: toast
  if (thrownError instanceof ApiError) {
    alert(thrownError.message)
  } else {
    alert('서버 오류로 요청에 실패했습니다.')
  }
}

async function _fetch<T>(
  url: string,
  params: any,
  customErrorHandling: boolean
): Promise<T> {
  let response: Response | null = null
  try {
    const init: RequestInit = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      // 'same-origin' does not work on Firefox private browsing
      credentials: 'include',
    }
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
      url,
      params,
    }, response, e, customErrorHandling)
    throw e
  }
}

function create(): Client<CallOptions> {
  return {
    async call(path: string, params: any, options?: CallOptions): Promise<any> {
      return _fetch(path, params, options?.customErrorHandling ?? false)
    }
  }
}

export const API = create()
