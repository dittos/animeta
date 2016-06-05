import pathToRegexp from 'path-to-regexp';

class App {
    constructor() {
        this.routes = [];
    }

    route(path, handler) {
        const keys = [];
        const regexp = pathToRegexp(path, keys);
        this.routes.push({
            regexp,
            keys,
            handler,
        })
    }
}

export function createApp() {
    return new App();
}

export function matchRoute(app, path) {
    for (var i = 0; i < app.routes.length; i++) {
        const route = app.routes[i];
        const matches = route.regexp.exec(path);
        if (matches) {
            const params = {};
            for (var j = 0; j < matches.length - 1; j++) {
                params[route.keys[j].name] = decodeURIComponent(matches[j + 1]);
            }
            return {
                route,
                params
            };
        }
    }
    return null;
}

export {default as Link} from './ui/Link';
