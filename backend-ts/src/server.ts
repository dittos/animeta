import fastify, { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from 'fastify'
import mercurius from 'mercurius'
import * as path from 'path'
import * as fs from 'fs'
import * as Sentry from '@sentry/node'
import { resolvers } from './resolvers'
import { getCurrentUser } from './auth'
import { glob } from 'glob'
import { GraphQLID } from './resolvers/scalars/id'
import { ValidationError } from './services/exceptions'

// TODO: dotenv

export const server = fastify({
  logger: {
    prettyPrint: process.env.NODE_ENV !== 'production',
  },
  serializerOpts: {
    ajv: {
      coerceTypes: true,
    },
  },
})

async function buildContext(req: FastifyRequest, _reply: FastifyReply) {
  return {
    currentUser: await getCurrentUser(req),
    useNewId: req.headers['x-graphql-use-new-id'] === 'true',
    request: req,

    _legacyIdWarned: false, // mutable
  }
}

type PromiseType<T> = T extends PromiseLike<infer U> ? U : T

declare module 'mercurius' {
  interface MercuriusContext extends PromiseType<ReturnType<typeof buildContext>> {}
}

server.register(mercurius, {
  schema: glob.sync('schema/**/*.graphql').map(it => fs.readFileSync(it, {encoding: 'utf-8'})),
  resolvers: {
    ...resolvers as any,
    ID: GraphQLID,
  },
  context: buildContext,
  graphiql: process.env.NODE_ENV !== 'production',
  errorFormatter(execution, context) {
    if (execution.errors) {
      for (const e of execution.errors) {
        Sentry.withScope(scope => {
          const request = context.request
          scope.setUser({
            ip_address: request.ip,
          });
          scope.setLevel(Sentry.Severity.Error);
          scope.setTag('path', request.url);
          scope.setExtra('headers', request.headers);
          if (
              request.headers['content-type'] === 'application/json' &&
              request.body
          ) {
            scope.setExtra('body', request.body);
          }
          Sentry.captureException(e)
        })
      }
    }
    return mercurius.defaultErrorFormatter(execution, context)
  },
})

const middlewareFilename = '_middleware.js'

function loadSchema(endpointPath: string): FastifySchema | null {
  try {
    const content = fs.readFileSync(endpointPath.replace(/\.js$/, '.schema.json'), {encoding: 'utf-8'})
    return JSON.parse(content)
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }
    throw e
  }
}

type Handler = (params: any, request?: FastifyRequest) => Promise<any> | any

function registerEndpoints(parent: FastifyInstance, endpointsDir: string, prefix: string) {
  parent.register(async (child, opts) => {
    const files = fs.readdirSync(endpointsDir, { withFileTypes: true })
    for (const file of files) {
      const fullpath = path.join(endpointsDir, file.name)
      if (file.isDirectory()) {
        registerEndpoints(child, fullpath, file.name)
      } else if (file.name === middlewareFilename) {
        const middleware = require(fullpath).default
        child.addHook('preHandler', middleware)
      } else if (path.extname(file.name) === '.js') {
        const handler = require(fullpath).default as Handler | undefined
        if (!handler) continue
        let schema = loadSchema(fullpath)
        child.route({
          method: 'POST',
          url: file.name === 'index.js' ? '/' : '/' + file.name.replace(/\.js$/, ''),
          schema: schema ?? undefined,
          handler: async (request, reply) => {
            try {
              return await handler(request.body, request)
            } catch (e) {
              if (e instanceof ValidationError) {
                reply.status(400).send({
                  message: e.message,
                  extra: e.extra,
                })
                return
              }
              throw e
            }
          }
        })
      }
    }
  }, {
    prefix
  })
}

server.addSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, './gen/schemas/common.json'), {encoding: 'utf8'})))
registerEndpoints(server, path.join(__dirname, 'endpoints'), '/api')

server.get('/health', async (_req, reply) => reply.send('pong'))
