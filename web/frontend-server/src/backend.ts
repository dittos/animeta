import { fetch } from 'cross-fetch';
import { request as graphqlRequest } from 'graphql-request';

export const HttpNotFound = {};

export default class {
  constructor(private v4BaseUrl: string, private v5BaseUrl: string, private graphqlUrl: string) {
  }

  async callV4(req: any, path: string, params?: any) {
    try {
      return await this._call(req, this.v4BaseUrl, path, params);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        throw HttpNotFound;
      }
      throw e;
    }
  }

  async callV5(req: any, path: string, params?: any) {
    try {
      return await this._callV5(req, this.v5BaseUrl, path, params);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        throw HttpNotFound;
      }
      throw e;
    }
  }

  async getCurrentUser(req: any, params?: any) {
    try {
      return await this._call(req, this.v4BaseUrl, '/me', params);
    } catch (e) {
      return null;
    }
  }

  async getCurrentUserV5(req: any, params?: any) {
    try {
      return await this._callV5(req, this.v5BaseUrl, '/api/v5/getCurrentUser', params);
    } catch (e) {
      return null;
    }
  }

  async graphql(req: any, doc: any, variables: any) {
    return graphqlRequest(this.graphqlUrl, doc, variables, {
      'x-animeta-session-key': req.cookies?.sessionid,
    })
  }

  async _call(req: any, baseUrl: string, path: string, params?: any) {
    const url = new URL(baseUrl + path)
    if (params)
      url.search = new URLSearchParams(params).toString()
    const r = await fetch(url, {
      headers: {
        'x-animeta-session-key': req.cookies?.sessionid,
        'Accept': 'application/json',
      },
    })
    const body = await r.json()
    if (r.ok) {
      return body
    } else {
      throw new ApiError(r.status, body)
    }
  }

  async _callV5(req: any, baseUrl: string, path: string, params?: any) {
    let body
    if (typeof params !== 'undefined')
      body = JSON.stringify(params)
    const r = await fetch(baseUrl + path, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-animeta-session-key': req.cookies?.sessionid,
        'Accept': 'application/json',
      },
    })
    const responseBody = await r.json()
    if (r.ok) {
      return responseBody
    } else {
      throw new ApiError(r.status, responseBody)
    }
  }
}

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly payload: any) {
    super(payload.message)

    // https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript/
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}
