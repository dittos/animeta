import request from 'request';
import Promise from 'bluebird';

export const HttpNotFound = {};

export class HttpRedirect {
    constructor(uri) {
        this.uri = uri;
    }
};

export default class {
    constructor(options) {
        var host = options.host;
        if (options.port !== 80) {
            host += ':' + options.port;
        }
        this.endpoint = `http://${host}/api/v2`;
    }

    async call(req, path, params) {
        const {response, body} = await this._call(req, path, params);
        if (response.statusCode === 404) {
            throw HttpNotFound;
        }
        return JSON.parse(body);
    }

    async getCurrentUser(req) {
        const {response, body} = await this._call(req, '/me');
        if (response.statusCode !== 200) {
            return null;
        }
        return JSON.parse(body);
    }

    _call(req, path, params) {
        return new Promise((resolve, reject) => {
            request({
                baseUrl: this.endpoint,
                url: path,
                qs: params,
                forever: true,
                headers: {
                    'Cookie': req.headers.cookie,
                },
            }, (err, response, body) => {
                if (!err) {
                    resolve({response, body});
                } else {
                    reject(err);
                }
            });
        });
    }
}
