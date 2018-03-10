import request from 'request';
import Promise from 'bluebird';

export const HttpNotFound = {};

export default class {
    constructor(baseUrl) {
        this.endpoint = baseUrl + '/v2';
    }

    async call(req, path, params) {
        const { response, body } = await this._call(req, path, params);
        if (response.statusCode === 404) {
            throw HttpNotFound;
        }
        return JSON.parse(body);
    }

    async getCurrentUser(req, params) {
        const { response, body } = await this._call(req, '/me', params);
        if (response.statusCode !== 200) {
            return null;
        }
        return JSON.parse(body);
    }

    _call(req, path, params) {
        return new Promise((resolve, reject) => {
            request(
                {
                    baseUrl: this.endpoint,
                    url: path,
                    qs: params,
                    forever: true,
                    headers: {
                        'x-animeta-session-key': req.cookies.sessionid,
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
