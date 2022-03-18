import request from 'request';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import fetch from 'cross-fetch';
import * as Sentry from '@sentry/node';

export const HttpNotFound = {};

export default class {
  private baseUrl: string;
  private v4BaseUrl: string;
  public apollo: ApolloClient<any>;

  constructor(baseUrl: string, v4BaseUrl: string, graphqlUrl: string) {
    this.baseUrl = baseUrl + '/v2';
    this.v4BaseUrl = v4BaseUrl;
    this.apollo = new ApolloClient({
      link: new HttpLink({
        uri: graphqlUrl,
        fetch,
      }),
      cache: new InMemoryCache(),
    });
  }

  async call(req: any, path: string, params?: any) {
    Sentry.captureMessage(`${path} called from backend`)
    const { response, body } = await this._call(req, this.baseUrl, path, params);
    if (response.statusCode === 404) {
      throw HttpNotFound;
    }
    return JSON.parse(body);
  }

  async callV4(req: any, path: string, params?: any) {
    const { response, body } = await this._call(req, this.v4BaseUrl, path, params);
    if (response.statusCode === 404) {
      throw HttpNotFound;
    }
    return JSON.parse(body);
  }

  async getCurrentUser(req: any, params?: any) {
    const { response, body } = await this._call(req, this.v4BaseUrl, '/me', params);
    if (response.statusCode !== 200) {
      return null;
    }
    return JSON.parse(body);
  }

  async graphql(req: any, doc: any, variables: any) {
    const result = await this.apollo.query({
      query: doc,
      variables,
      context: {
        headers: {
          'x-animeta-session-key': req.cookies?.sessionid,
        },
      },
      fetchPolicy: 'no-cache',
    })
    return result.data
  }

  _call(req: any, baseUrl: string, path: string, params?: any): Promise<{ response: request.Response, body: any }> {
    return new Promise((resolve, reject) => {
      request(
        {
          url: baseUrl + path,
          qs: params,
          forever: true,
          headers: {
            'x-animeta-session-key': req.cookies?.sessionid,
          },
        },
        (err, response, body) => {
          if (!err) {
            resolve({ response, body });
          } else {
            reject(err);
          }
        }
      );
    });
  }
}
