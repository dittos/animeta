import request from 'request';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import fetch from 'cross-fetch';

export const HttpNotFound = {};

export default class {
  public apollo: ApolloClient<any>;

  constructor(private v4BaseUrl: string, private v5BaseUrl: string, graphqlUrl: string) {
    this.apollo = new ApolloClient({
      link: new HttpLink({
        uri: graphqlUrl,
        fetch,
      }),
      cache: new InMemoryCache(),
    });
  }

  async callV4(req: any, path: string, params?: any) {
    const { response, body } = await this._call(req, this.v4BaseUrl, path, params);
    if (response.statusCode === 404) {
      throw HttpNotFound;
    }
    return JSON.parse(body);
  }

  async callV5(req: any, path: string, params?: any) {
    const { response, body } = await this._callV5(req, this.v5BaseUrl, path, params);
    if (response.statusCode === 404) {
      throw HttpNotFound;
    }
    return body;
  }

  async getCurrentUser(req: any, params?: any) {
    const { response, body } = await this._call(req, this.v4BaseUrl, '/me', params);
    if (response.statusCode !== 200) {
      return null;
    }
    return JSON.parse(body);
  }

  async getCurrentUserV5(req: any, params?: any) {
    const { response, body } = await this._callV5(req, this.v5BaseUrl, '/api/v5/getCurrentUser', params);
    if (response.statusCode !== 200) {
      return null;
    }
    return body;
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

  _callV5(req: any, baseUrl: string, path: string, params?: any): Promise<{ response: request.Response, body: any }> {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          url: baseUrl + path,
          json: true,
          body: params,
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
