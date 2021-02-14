import request from 'request';

export const HttpNotFound = {};

export default class {
  private baseUrl: string;
  private v4BaseUrl: string;

  constructor(baseUrl: string, v4BaseUrl: string) {
    this.baseUrl = baseUrl + '/v2';
    this.v4BaseUrl = v4BaseUrl;
  }

  async call(req: any, path: string, params?: any) {
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
    const { response, body } = await this._call(req, this.baseUrl, '/me', params);
    if (response.statusCode !== 200) {
      return null;
    }
    return JSON.parse(body);
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
