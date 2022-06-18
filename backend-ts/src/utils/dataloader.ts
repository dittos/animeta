export function objResults<K, V>(
  batchLoader: (keys: ReadonlyArray<K>) => Promise<(V | null)[]>,
  keyToString: (key: K) => string,
  toKey: (value: V) => string
) {
  return (keys: ReadonlyArray<K>) => batchLoader(keys).then(values => {
    const objValues: {[key: string]: V} = {};
    values.forEach(value => {
      if (value != null) {
        objValues[toKey(value)] = value
      }
    });
    return keys.map(key => objValues[keyToString(key)])
  })
}

export function objResultsNullable<K, V>(
  batchLoader: (keys: ReadonlyArray<K>) => Promise<(V | null)[]>,
  keyToString: (key: K) => string,
  toKey: (value: V) => string
) {
  return (keys: ReadonlyArray<K>) => batchLoader(keys).then(values => {
    const objValues: {[key: string]: V | undefined} = {};
    values.forEach(value => {
      if (value != null) {
        objValues[toKey(value)] = value
      }
    });
    return keys.map(key => objValues[keyToString(key)])
  })
}
