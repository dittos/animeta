// Speed up GraphQLModule initialization in tests
// by skipping apollo-server-express module resolution

export class ApolloServer {
  constructor(...args: any) {}

  applyMiddleware(...args: any) {}

  async start() {}
  async stop() {}
}