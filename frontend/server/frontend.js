import querystring from 'querystring';
import Hapi from 'hapi';
import ejs from 'ejs';
import Backend, {HttpNotFound} from './backend';
import renderFeed from './renderFeed';
import assetFilenames from '../assets.json';
import config from '../config.json';
import * as IsomorphicServer from './IsomorphicServer';
import IndexSpec from '../js/Index';

const DEBUG = process.env.NODE_ENV !== 'production';

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000 });

server.ext('onPreResponse', (request, reply) => {
    const response = request.response;

    if (response.statusCode === 404 ||
        (response.isBoom &&
        response.output.statusCode === 404)) {
        var path = request.path;
        // Strip slashes
        if (path.match(/\/{2,}/)) {
            path = path.replace(/\/{2,}/g, '/');
        }
        if (path.match(/^\/-(.+)\/$/)) {
            path = path.substring(0, path.length - 1);
        }
        // Add slashes
        if (path.match(/^\/(works|table|login|signup|settings|records|support|charts|users|library)/) &&
            !path.match(/\/$/)) {
            path = path + '/';
        }
        if (path !== request.path) {
            var url = path;
            var query = querystring.stringify(request.query);
            if (query) {
                url += '?' + query;
            }
            return reply().redirect(url);
        }
    }
    return reply.continue();
});

server.register(require('vision'), err => {
    if (err)
        throw err;

    server.views({
        engines: {
            html: require('ejs')
        },
        relativeTo: __dirname,
        path: '.',
        layout: true,
        layoutPath: '.',
        context: {
            DEBUG,
            STATIC_URL: '/static/',
            assetFilenames,
            title: '',
            meta: {},
            stylesheets: [],
            scripts: [],
            useModernizr: false
        },
        isCached: !DEBUG,
    });
});

server.register({
    register: require('crumb'),
    options: {
        restful: true
    }
}, err => {
    if (err)
        throw err;
});

server.register(require('h2o2'), err => {
    if (err)
        throw err;

    server.route({
        method: '*',
        path: '/api/{path*}',
        handler: {
            proxy: {
                host: config.backend.host,
                port: config.backend.port,
                passThrough: true
            }
        }
    });
});

if (DEBUG) {
    server.register(require('inert'), err => {
        if (err)
            throw err;

        server.route({
            method: 'GET',
            path: '/static/{param*}',
            handler: {
                directory: {
                    path: __dirname + '/../../animeta/static'
                }
            }
        });
    });
}

const backend = new Backend(config.backend);
IsomorphicServer.injectBackend(backend);

function wrapHandler(handler) {
    return (request, reply) => {
        handler.call(null, request, reply).catch(e => {
            if (e === HttpNotFound) {
                const response = reply('Not found.');
                response.statusCode = 404;
                return;
            }
            if (!(e instanceof Error)) {
                e = new Error(e);
            }
            console.trace(e.stack);
            reply(e);
        });
    };
}

server.handler('isomorphic', (route, { spec, prerender = false }) => {
    return wrapHandler(async(request, reply) => {
        const {html, preloadData, title, meta} = await IsomorphicServer.render(request, spec, prerender);
        preloadData.daum_api_key = config.daumAPIKey; // XXX
        reply.view('template', {
            html,
            preloadData,
            title,
            meta,
            stylesheets: [`build/${assetFilenames.index.css}`],
            scripts: [`build/${assetFilenames.index.js}`],
        });
    });
});

const indexHandler = {
    isomorphic: {
        spec: IndexSpec,
        prerender: false
    }
};

server.route({
    method: 'GET',
    path: '/',
    handler: {
        isomorphic: {
            spec: IndexSpec,
            prerender: true
        }
    },
});

server.route({
    method: 'GET',
    path: '/login/',
    handler: indexHandler,
});

server.route({
    method: 'GET',
    path: '/signup/',
    handler: indexHandler,
});

server.route({
    method: 'GET',
    path: '/charts/{type}/{range}/',
    handler: {
        isomorphic: {
            spec: IndexSpec,
            prerender: true
        }
    },
});

server.route({
    method: 'GET',
    path: '/works/{path*}',
    handler: {
        isomorphic: {
            spec: IndexSpec,
            prerender: true
        }
    },
});

server.route({
    method: 'GET',
    path: '/-{id}',
    handler: {
        isomorphic: {
            spec: IndexSpec,
            prerender: true
        }
    },
});

server.route({
    method: 'GET',
    path: '/support/',
    handler(request, reply) {
        reply.view('support', {
            title: '버그 제보 / 건의',
            preloadData: null,
        });
    }
});

server.route({
    method: 'GET',
    path: '/library/',
    handler: wrapHandler(async (request, reply) => {
        const currentUser = await backend.getCurrentUser(request);
        if (!currentUser) {
            reply.redirect('/login/');
        } else {
            reply.redirect(`/users/${currentUser.name}/`);
        }
    })
});

server.route({
    method: 'GET',
    path: '/{username}',
    handler: wrapHandler(async (request, reply) => {
        const {username} = request.params;
        const user = await backend.call(request, `/users/${username}`);
        reply.redirect(`/users/${username}/`);
    })
});

async function userHandler(request, reply, username, currentUser) {
    if (!currentUser) {
        currentUser = await backend.getCurrentUser(request);
    }
    const [owner, records] = await* [
        backend.call(request, `/users/${username}`),
        backend.call(request, `/users/${username}/records`, {
            include_has_newer_episode: JSON.stringify(true)
        }),
    ];
    const preloadData = {
        current_user: currentUser,
        owner,
        records
    };
    reply.view('template', {
        html: '',
        title: `${owner.name} 사용자`,
        preloadData,
        scripts: [`build/${assetFilenames.library.js}`],
    });
}

const libraryHandler = wrapHandler(async (request, reply) => {
    const {username} = request.params;
    return await userHandler(request, reply, username);
});

server.route({
    method: 'GET',
    path: '/users/{username}/',
    handler: libraryHandler
});

server.route({
    method: 'GET',
    path: '/users/{username}/history/',
    handler: libraryHandler
});

server.route({
    method: 'GET',
    path: '/users/{username}/history/{id}/',
    handler: wrapHandler(async (request, reply) => {
        // TODO: check username
        reply.redirect(`/-${request.params.id}`);
    })
});

server.route({
    method: 'GET',
    path: '/users/{username}/feed/',
    handler: wrapHandler(async (request, reply) => {
        const {username} = request.params;
        const [owner, posts] = await* [
            backend.call(request, `/users/${username}`),
            backend.call(request, `/users/${username}/posts`),
        ];
        reply(renderFeed(owner, posts))
            .type('application/atom+xml; charset=UTF-8');
    })
});

const recordHandler = wrapHandler(async (request, reply) => {
    const {id} = request.params;
    const record = await backend.call(request, `/records/${id}`);
    return await userHandler(request, reply, record.user.name);
});

server.route({
    method: 'GET',
    path: '/records/{id}/',
    handler: recordHandler
});

server.route({
    method: 'GET',
    path: '/records/{id}/delete/',
    handler: recordHandler
});

const currentUserHandler = wrapHandler(async (request, reply) => {
    const currentUser = await backend.getCurrentUser(request);
    if (!currentUser) {
        reply.redirect('/login/');
        return;
    }
    return await userHandler(request, reply, currentUser.name, currentUser);
});

server.route({
    method: 'GET',
    path: '/records/add/{title*}',
    handler: currentUserHandler
});

server.route({
    method: 'GET',
    path: '/records/category/',
    handler: currentUserHandler
});

server.route({
    method: 'GET',
    path: '/settings/',
    handler: currentUserHandler
});

const CURRENT_PERIOD = '2015Q4';

server.route({
    method: 'GET',
    path: '/table/',
    handler(request, reply) {
        reply.redirect(`/table/${CURRENT_PERIOD}/`);
    }
});

server.route({
    method: 'GET',
    path: '/table/{period}/',
    handler: wrapHandler(async (request, reply) => {
        const {period} = request.params;
        const matches = period.match(/([0-9]{4})Q([1-4])/);
        if (!matches) {
            const response = reply('Not found.');
            response.statusCode = 404;
            return;
        }
        const year = matches[1];
        const quarter = matches[2];
        const month = [1, 4, 7, 10][quarter - 1];
        const [currentUser, schedule] = await* [
            backend.getCurrentUser(request),
            backend.call(request, `/table/periods/${period}`, {
                only_first_period: JSON.stringify(true)
            }),
        ];
        const preloadData = {
            current_user: currentUser,
            period,
            schedule,
        };
        reply.view('template', {
            html: '',
            preloadData,
            title: `${year}년 ${month}월 신작`,
            scripts: [`build/${assetFilenames.table_period.js}`],
            useModernizr: true,
        });
    })
});

export default server;
