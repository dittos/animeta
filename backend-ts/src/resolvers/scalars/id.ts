import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';
import { NodeId } from '../id';

/**
 * wrap/unwrap GraphQL ID type to/from NodeId object for type safety
 */
export const GraphQLID = new GraphQLScalarType<NodeId, string>({
  name: 'ID',
  description:
    'The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.',

  serialize(outputValue) {
    if (outputValue instanceof NodeId) {
      return outputValue.toJSON();
    }
    throw new GraphQLError(`ID cannot represent value: ${outputValue}`);
  },

  parseValue(inputValue) {
    if (typeof inputValue === 'string') {
      return new NodeId(inputValue);
    }
    if (typeof inputValue === 'number' && Number.isInteger(inputValue)) {
      return new NodeId(inputValue.toString());
    }
    throw new GraphQLError(`ID cannot represent value: ${inputValue}`);
  },

  parseLiteral(valueNode) {
    if (valueNode.kind !== Kind.STRING && valueNode.kind !== Kind.INT) {
      throw new GraphQLError(
        'ID cannot represent a non-string and non-integer value: ' + valueNode,
        { nodes: valueNode },
      );
    }
    return new NodeId(valueNode.value);
  },
});
