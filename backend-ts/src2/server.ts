import fastify, { FastifyInstance, FastifyRequest, FastifySchema } from 'fastify'
import mercurius, { IResolvers } from 'mercurius'
import * as path from 'path'
import * as fs from 'fs'
import { createConnection } from 'typeorm'
import { HttpException } from '@nestjs/common'
import { resolvers } from './resolvers'

// TODO: dotenv

const server = fastify({
  logger: {
    prettyPrint: process.env.NODE_ENV !== 'production',
  },
  serializerOpts: {
    ajv: {
      coerceTypes: true,
    },
  },
})

server.register(mercurius, {
  schema: fs.readFileSync('src/schema.graphql', {encoding: 'utf-8'}),
  resolvers: resolvers as IResolvers,
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
              if (e instanceof HttpException) {
                reply.status(e.getStatus()).send(e.getResponse())
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

server.addSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, '../gen/schemas/common.json'), {encoding: 'utf8'})))
registerEndpoints(server, path.join(__dirname, 'endpoints'), '/api')

export async function bootstrap2() {
  await createConnection()
  
  server.listen(8082, '0.0.0.0', (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
}

// bootstrap2()
