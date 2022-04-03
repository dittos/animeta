import ts from 'typescript'

export type RootType = {
  name: string;
  declaration: ts.TypeAliasDeclaration;
  location: {
    file: string;
    line: number;
    column: number;
  };
}

/*
given starting TypeNode
-> find and follow `TypeReferenceNode`s
-> find and collect `TypeAliasDeclaration`s
*/
export function collectRootTypes(roots: Map<string, RootType>, start: ts.TypeNode, typeChecker: ts.TypeChecker) {
  function visitTypeRef(type: ts.TypeReferenceNode) {
    const symbol = typeChecker.getSymbolAtLocation(type.typeName)!
    // if the symbol is an alias, it means it the reference is declared from an import
    const targetSymbol = (symbol.flags & ts.SymbolFlags.Alias) !== 0
      ? typeChecker.getAliasedSymbol(symbol)!
      : symbol;
    const declarations = targetSymbol.getDeclarations() ?? [];
    const declaration = declarations[0]
    if (!declaration) throw new Error('no declaration: ' + type.getText())
    const location = declaration.getSourceFile().fileName
    const lineAndCharacter = ts.getLineAndCharacterOfPosition(declaration.getSourceFile(), declaration.pos)
    const typeName = symbol.getName();
    const definedSchema = roots.get(typeName)
    if (definedSchema) {
      if (
        definedSchema.location.file === location &&
        definedSchema.location.line === lineAndCharacter.line &&
        definedSchema.location.column === lineAndCharacter.character
      ) {
        return
      } else {
        throw new Error(`${typeName} is already defined at ${definedSchema.location.file}:${definedSchema.location.line}`)
      }
    }
    if (!ts.isTypeAliasDeclaration(declaration)) {
      throw new Error(`Cannot process ${typeName} (${location}:${lineAndCharacter.line})`)
    }
    
    // type X = ...
    visitType(declaration.type)
    const root = {
      name: declaration.name.text,
      declaration,
      location: {
        file: location,
        line: lineAndCharacter.line,
        column: lineAndCharacter.character,
      }
    }
    roots.set(root.name, root)
  }
  function visitType(type: ts.TypeNode) {
    if (ts.isTypeReferenceNode(type)) {
      visitTypeRef(type)
    } else if (ts.isArrayTypeNode(type)) {
      visitType(type.elementType)
    } else if (ts.isTypeLiteralNode(type)) {
      type.members.forEach(s => {
        if (ts.isIndexSignatureDeclaration(s)) {
          visitType(s.parameters[0]!.type!)
          visitType(s.type)
        } else if (ts.isPropertySignature(s)) {
          visitType(s.type!)
        }
      })
    } else if (ts.isUnionTypeNode(type)) {
      type.types.forEach(t => visitType(t))
    } else {
      const t = typeChecker.getTypeAtLocation(type)
      const isValid = (
        t.flags & (
          ts.TypeFlags.String |
          ts.TypeFlags.Number |
          ts.TypeFlags.Boolean |
          ts.TypeFlags.StringLiteral |
          ts.TypeFlags.Null |
          ts.TypeFlags.Any
        )
      ) !== 0
      if (!isValid) {
        throw new Error('unsupported: ' + type.getText())
      }
    }
  }
  visitType(start)
}
