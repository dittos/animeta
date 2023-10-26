import * as path from 'path'
import * as fs from 'fs'
import { collectRootTypes, RootType } from './root_type_collector'
import { writeJsonSchema, writeJsonSchemaFor } from './json_schema_writer'
import ts from 'typescript'

export function main(options: Record<string, any>, program: ts.Program, context: ts.TransformationContext): ts.Transformer<any> {
  const app: App = {
    endpoints: [],
    types: new Map(),
  }

  const sourceRoot: string = options.sourceRoot
  const endpointsDir: string = options.endpointsDir
  const distDir: string = options.distDir
  const basePath = path.join(program.getCurrentDirectory(), sourceRoot, endpointsDir)
  const distPath = path.join(distDir, endpointsDir)
  
  const tc = program.getTypeChecker()
  
  program.getSourceFiles().filter(sf => sf.fileName.startsWith(basePath)).forEach(sf => {
    if (sf.fileName.endsWith('/_middleware.ts')) return
    ts.forEachChild(sf, node => {
      if (ts.isFunctionDeclaration(node) && node.modifiers?.find(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
        const paramsParam = node.parameters[0]
        if (!paramsParam) return
        const paramsType = paramsParam.type!
        collectRootTypes(app.types, paramsType, tc)
        const resultType = unwrapPromise(node.type!)
        collectRootTypes(app.types, resultType, tc)
        const relativePath = path.relative(path.join(sourceRoot, endpointsDir), sf.fileName)
        const fileName = path.basename(sf.fileName)
        app.endpoints.push({
          path: '/api/' + (fileName === 'index.ts' ? path.dirname(relativePath) + '/' : relativePath.replace(/\.ts$/, '')),
          file: sf,
          paramsType,
          resultType,
        })
      }
    })
  })
  
  const schema: any = {
    $id: 'common',
    definitions: {}
  }
  for (const [n,v] of writeJsonSchema(app.types, tc).entries()) {
    schema.definitions[n] = v
  }
  const schemaDistDir = path.join(distDir, 'gen/schemas')
  fs.mkdirSync(schemaDistDir, {recursive: true})
  fs.writeFileSync(path.join(schemaDistDir, 'common.json'), JSON.stringify(schema, null, 2))
  
  for (const endpoint of app.endpoints) {
    const schemaPath = path.resolve(distPath, path.relative(basePath, endpoint.file.fileName).replace(/\.ts$/, '.schema.json'))
    fs.mkdirSync(path.dirname(schemaPath), {recursive: true})
    fs.writeFileSync(
      schemaPath,
      JSON.stringify({
        body: writeJsonSchemaFor(app.types, endpoint.paramsType, tc),
        response: {
          200: writeJsonSchemaFor(app.types, endpoint.resultType, tc)
        },
      }, null, 2)
    )
  }

  let client = ''
  for (const rootType of app.types.values()) {
    client += `${rootType.declaration.getText()}\n`
  }
  client += '\n\n'
  client += 'export interface Client<TOptions = any> {\n'
  for (const endpoint of app.endpoints) {
    client += `  call(path: ${JSON.stringify(endpoint.path)}, params: ${endpoint.paramsType.getText()}, options?: TOptions): Promise<${endpoint.resultType.getText()}>\n`
  }
  client += '}'
  {
    const schemaPath = options.clientTypesOutput
    fs.mkdirSync(path.dirname(schemaPath), {recursive: true})
    fs.writeFileSync(schemaPath, client)
  }
  return (sf: ts.SourceFile) => sf
}

type App = {
  endpoints: Endpoint[];
  types: Map<string, RootType>;
}

type Endpoint = {
  path: string;
  file: ts.SourceFile;
  paramsType: ts.TypeNode;
  resultType: ts.TypeNode;
}

function unwrapPromise(type: ts.TypeNode) {
  if (ts.isTypeReferenceNode(type) && type.typeName.getText() === 'Promise') {
    return type.typeArguments![0]
  }
  return type
}
