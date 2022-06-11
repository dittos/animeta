const {generateCode, loadSchemaFiles, writeGeneratedCode} = require('mercurius-codegen')
const {buildSchema} = require('graphql')

async function codegen(schema) {
  const targetPath = './src/graphql/generated.ts'
  let code = await generateCode(
    buildSchema(schema.join('\n')),
    {
      mapperTypeSuffix: 'Model',
      mappers: {
        'Post': 'src/entities/history.entity#History',
        'User': 'src/entities/user.entity#User',
        'Record': 'src/entities/record.entity#Record',
      }
    },
    undefined, // preImportCode
    undefined, // silent
    undefined, // operationsGlob
  )
  // Remove "declare module 'mercurius' { ... }" to keep using skipLibCheck: false
  code = code.substring(0, code.indexOf("declare module 'mercurius'"))
  const absoluteTargetPath = await writeGeneratedCode({
    code,
    targetPath,
  })
  console.log(`[mercurius-codegen] Code generated at ${absoluteTargetPath}`)
}

const { schema } = loadSchemaFiles('src/schema.graphql', {
  prebuild: {
    enabled: false,
    targetPath: null,
  },
  watchOptions: {
    enabled: true,
    onChange(schema) {
      codegen(schema).catch(console.error)
    },
  },
})

codegen(schema).catch(console.error)
