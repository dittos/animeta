import ts from 'typescript'
import { RootType } from "./root_type_collector"

type JSONSchema = any // TODO

export function writeJsonSchema(roots: Map<string, RootType>, typeChecker: ts.TypeChecker): Map<string, JSONSchema> {
  const schemas = new Map<string, JSONSchema>()
  const visitType = createVisitor(roots, typeChecker, schemas)
  for (const root of roots.values()) {
    const type = root.declaration.type!
    const schema = visitType(type, {$id: root.name})
    if (!schemas.has(root.name))
      schemas.set(root.name, schema)
  }
  return schemas
}

export function writeJsonSchemaFor(roots: Map<string, RootType>, type: ts.TypeNode, typeChecker: ts.TypeChecker): JSONSchema {
  return createVisitor(roots, typeChecker)(type, undefined)
}

function createVisitor(roots: Map<string, RootType>, typeChecker: ts.TypeChecker, schemas?: Map<string, JSONSchema>) {
  function visitType(type: ts.TypeNode, options: { $id: string } | undefined): JSONSchema {
    if (ts.isTypeReferenceNode(type)) {
      const name = typeChecker.getSymbolAtLocation(type.typeName)!.getName() // TODO: find declaration name
      if (schemas) {
        const definedSchema = schemas.get(name)
        if (!definedSchema) {
          const schema = visitType(roots.get(name)!.declaration.type, { $id: name })
          schemas.set(name, schema)
        }
      }
      return { $ref: schemas ? '' : 'common' + '#/definitions/' + name }
    }
    // number, string, boolean, null, literal(const), any
    const t = typeChecker.getTypeAtLocation(type)
    if ((t.flags & ts.TypeFlags.Number) !== 0) {
      return { type: 'number' }
    } else if ((t.flags & ts.TypeFlags.String) !== 0) {
      return { type: 'string' }
    } else if (t.isStringLiteral()) {
      return { type: 'string', const: t.value }
    } else if ((t.flags & ts.TypeFlags.Boolean) !== 0) {
      return { type: 'boolean' }
    } else if ((t.flags & ts.TypeFlags.Null) !== 0) {
      return { type: 'null', nullable: true }
    } else if ((t.flags & ts.TypeFlags.Any) !== 0) {
      return {}
    }
    // array, object, union
    else if (ts.isArrayTypeNode(type)) {
      return {
        ...options,
        type: 'array',
        items: visitType(type.elementType, undefined),
      }
    } else if (ts.isTypeLiteralNode(type)) {
      const indexSignature = type.members.find(it => ts.isIndexSignatureDeclaration(it))
      if (indexSignature && ts.isIndexSignatureDeclaration(indexSignature)) {
        return {
          ...options,
          type: 'object',
          patternProperties: {
            '^.*$': visitType(indexSignature.type, undefined),
          },
        }
      } else {
        const properties: {[key: string]: JSONSchema} = {}
        const required: string[] = []
        for (const p of type.members) {
          if (ts.isPropertySignature(p)) {
            const name = p.name.getText()
            properties[name] = visitType(p.type!, undefined)
            if (!p.questionToken) required.push(name)
          }
        }
        return {
          ...options,
          type: 'object',
          properties,
          required,
        }
      }
    } else if (ts.isUnionTypeNode(type)) {
      const subTypes = type.types.map(t => visitType(t, undefined))
      const nullSubTypes = subTypes.filter(it => it.type === 'null')
      const nonNullSubTypes = subTypes.filter(it => it.type !== 'null')
      return {
        ...options,
        // always put null subtypes in the front
        // because ajv's coercion relies on the order of types.
        // (e.g. null could be coerced to 0 if type is `number | null`)
        anyOf: nullSubTypes.concat(nonNullSubTypes),
      }
    }
    throw new Error('??? - ' + type.getText())
  }
  return visitType
}
