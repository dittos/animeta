import request from 'request';

export const HttpNotFound = {};

export default class {
  private endpoint: string;

  constructor(baseUrl: string) {
    this.endpoint = baseUrl + '/v2';
  }

  async call(req: any, path: string, params?: any) {
    const { response, body } = await this._call(req, path, params);
    if (response.statusCode === 404) {
      throw HttpNotFound;
    }
    return JSON.parse(body);
  }

  async getCurrentUser(req: any, params?: any) {
    const { response, body } = await this._call(req, '/me', params);
    if (response.statusCode !== 200) {
      return null;
    }
    return JSON.parse(body);
  }

  _call(req: any, path: string, params?: any): Promise<{ response: request.Response, body: any }> {
    return new Promise((resolve, reject) => {
      request(
        {
          baseUrl: this.endpoint,
          url: path,
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
