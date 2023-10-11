import { fetch } from 'cross-fetch';
import { request as graphqlRequest } from 'graphql-request';
import express from 'express';

export const HttpNotFound = {};

export default class {
  constructor(private v5BaseUrl: string, private graphqlUrl: string) {
  }

  async callV5(req: express.Request, path: string, params?: any) {
    try {
      return await this._callV5(req, this.v5BaseUrl, path, params);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        throw HttpNotFound;
      }
      throw e;
    }
  }

  async getCurrentUserV5(req: express.Request, params?: any) {
    try {
      return await this._callV5(req, this.v5BaseUrl, '/api/v5/getCurrentUser', params);
    } catch (e) {
      return null;
    }
  }

  async graphql(req: express.Request, doc: any, variables: any) {
    return graphqlRequest(this.graphqlUrl, doc, variables, {
      'x-animeta-session-key': req.cookies?.sessionid,
      'Referer': getFrontendUrlHeader(req),
      'User-Agent': req.headers['user-agent'],
    })
  }

  async _callV5(req: express.Request, baseUrl: string, path: string, params?: any) {
    let body
    if (typeof params !== 'undefined')
      body = JSON.stringify(params)
    const r = await fetch(baseUrl + path, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-animeta-session-key': req.cookies?.sessionid,
        'Referer': getFrontendUrlHeader(req),
        'User-Agent': req.headers['user-agent'],
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

function getFrontendUrlHeader(req: express.Request): string {
  return req.headers['referer'] || req.url
}

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly payload: any) {
    super(payload.message)

    // https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript/
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}
