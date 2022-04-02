import ts from "typescript"
import {main} from './compiler'

export function before(options: Record<string, any>, program: ts.Program): ts.TransformerFactory<any> {
  return (context) => main(program, context)
}
