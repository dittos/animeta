import querystring from 'querystring';
import Hapi from 'hapi';
import ejs from 'ejs';
import renderers from './server/renderers';
import Backend, {HttpNotFound} from './server/backend';
import assetFilenames from './assets.json';
import config from './config.json';

const DEBUG = process.env.NODE_ENV !== 'production';

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000 });

server.ext('onPreResponse', (request, reply) => {
    const response = request.response;

    if (response.isBoom &&
        response.output.statusCode === 404 &&
        !request.path.match(/\/$/)) {
        var url = request.path + '/';
        if (request.query) {
            url += '?' + querystring.stringify(request.query);
        }
        return reply().redirect(url);
    }
    return reply.continue();
});

const backend = new Backend(config.apiEndpoint);

server.start(() => {
    console.log('Server running at:', server.info.uri);
});

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
            reply(e);
        });
    };
}

server.route({
    method: 'GET',
    path: '/works/{title}/',
    handler: wrapHandler(async(request, reply) => {
        const {title} = request.params;
        const [currentUser, work, chart] = await Promise.all([
            backend.getCurrentUser(request),
            backend.call(request, '/works/_/' + encodeURIComponent(title)),
            backend.call(request, '/charts/works/weekly', {limit: 5}),
        ]);
        const preloadData = {
            current_user: currentUser,
            title,
            work,
            chart,
            daum_api_key: config.daumAPIKey,
        };
        const html = await renderers.work('/', preloadData);
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
                    path: __dirname + '/../animeta/static'
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
