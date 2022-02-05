export const jsonSerializer = {
  serialize(data: any): Buffer {
    return Buffer.from(JSON.stringify(data))
  },
  deserialize(data: Buffer): any {
    return JSON.parse(data.toString())
  },
}