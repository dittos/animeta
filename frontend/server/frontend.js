import querystring from 'querystring';
import Hapi from 'hapi';
import ejs from 'ejs';
import renderers from './renderers';
import Backend, {HttpNotFound} from './backend';
import assetFilenames from '../assets.json';
import config from '../config.json';

const DEBUG = process.env.NODE_ENV !== 'production';

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000 });

server.ext('onPreResponse', (request, reply) => {
    const response = request.response;

    if (response.isBoom &&
        response.output.statusCode === 404) {
        var redirectPath;
        // Strip slashes
        if (request.path.match(/^\/-(.+)\/$/)) {
            redirectPath = request.path.substring(0, request.path.length - 1);
        }
        // Add slashes
        if (request.path.match(/^\/(works|table|login|signup|settings|records)/) &&
            !request.path.match(/\/$/)) {
            redirectPath = request.path + '/';
        }
        if (redirectPath) {
            var url = redirectPath;
            var query = querystring.stringify(request.query);
            if (query) {
                url += '?' + query;
            }
            return reply().redirect(url);
        }
    }
    return reply.continue();
});

const backend = new Backend(config.apiEndpoint);

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
            console.trace(e);
            reply(e);
        });
    };
}

server.route({
    method: 'GET',
    path: '/',
    handler: wrapHandler(async(request, reply) => {
        const [currentUser, posts, chart] = await* [
            backend.getCurrentUser(request),
            backend.call(request, '/posts', {
                min_record_count: 2,
                count: 10
            }),
            backend.call(request, '/charts/works/weekly', {limit: 5}),
        ];
        const preloadData = {
            current_user: currentUser,
            chart,
            posts
        };
        const html = renderers.index('/', preloadData);
        reply.view('template', {
            html,
            preloadData,
            stylesheets: [`build/${assetFilenames.index.css}`],
            scripts: [`build/${assetFilenames.index.js}`],
        });
    })
});

server.route({
    method: 'GET',
    path: '/login/',
    handler(request, reply) {
        reply.view('template', {
            html: '',
            title: '로그인',
            preloadData: null,
            stylesheets: [`build/${assetFilenames.index.css}`],
            scripts: [`build/${assetFilenames.index.js}`],
        });
    }
});

server.route({
    method: 'GET',
    path: '/signup/',
    handler(request, reply) {
        reply.view('template', {
            html: '',
            title: '회원 가입',
            preloadData: null,
            stylesheets: [`build/${assetFilenames.index.css}`],
            scripts: [`build/${assetFilenames.index.js}`],
        });
    }
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

server.route({
    method: 'GET',
    path: '/works/{title}/',
    handler: wrapHandler(async(request, reply) => {
        const {title} = request.params;
        const [currentUser, work, chart] = await* [
            backend.getCurrentUser(request),
            backend.call(request, '/works/_/' + encodeURIComponent(title)),
            backend.call(request, '/charts/works/weekly', {limit: 5}),
        ];
        const preloadData = {
            current_user: currentUser,
            title,
            work,
            chart,
            daum_api_key: config.daumAPIKey,
        };
        const html = renderers.work('/', preloadData);
        reply.view('template', {
            html,
            preloadData,
            title,
            meta: {
                og_url: `/works/${encodeURIComponent(title)}/`,
                og_type: 'tv_show',
                og_image: work.metadata && work.metadata.image_url,
                tw_image: work.metadata && work.metadata.image_url,
            },
            stylesheets: [`build/${assetFilenames.work.css}`],
            scripts: [`build/${assetFilenames.work.js}`],
        });
    })
});

server.route({
    method: 'GET',
    path: '/-{id}',
    handler: wrapHandler(async(request, reply) => {
        const {id} = request.params;
        const post = await backend.call(request, `/posts/${id}`);
        const [currentUser, work, chart] = await* [
            backend.getCurrentUser(request),
            backend.call(request, `/works/${post.record.work_id}`),
            backend.call(request, '/charts/works/weekly', {limit: 5}),
        ];
        const preloadData = {
            current_user: currentUser,
            post,
            work,
            chart,
            daum_api_key: config.daumAPIKey,
        };
        const html = renderers.post('/', preloadData);
        reply.view('template', {
            html,
            preloadData,
            title: post.record.title,
            stylesheets: [`build/${assetFilenames.post.css}`],
            scripts: [`build/${assetFilenames.post.js}`],
        });
    })
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

server.register(require('vision'), err => {
    if (err)
        throw err;

    server.views({
        engines: {
            html: require('ejs')
        },
        relativeTo: __dirname,
        path: '.',
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

    server.register(require('h2o2'), err => {
        if (err)
            throw err;

        server.route({
            method: '*',
            path: '/api/{path*}',
            handler: {
                proxy: {
                    host: '127.0.0.1',
                    port: 8000,
                    passThrough: true
                }
            }
        });
    });
}

export default server;
