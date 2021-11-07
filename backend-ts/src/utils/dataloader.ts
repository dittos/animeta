export function objResults<K, V>(
  batchLoader: (keys: ReadonlyArray<K>) => Promise<V[]>,
  keyToString?: (key: K) => string,
  toKey?: (value: V) => string
) {
  return (keys: ReadonlyArray<K>) => batchLoader(keys).then(values => {
    const objValues = {};
    values.forEach(value => objValues[toKey(value)] = value);
    return keys.map(key => objValues[keyToString(key)])
  })
}
