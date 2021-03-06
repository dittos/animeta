module.exports = {
  client: {
    includes: ['./frontend/**/*.tsx'],
    service: {
      name: 'animeta',
      localSchemaFile: '../backend-ts/src/schema.graphql',
    }
  }
}