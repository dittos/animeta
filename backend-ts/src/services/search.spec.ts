import { makeKey } from "./search"

describe('makeKey', () => {
  it('should decompose Hangul characters', () => {
    expect(makeKey('옳소')).toEqual(['ㅇㅗㄹㅎ', 'ㅅㅗ'])
  })
  it('should lowercase and filter non-alphanumeric characters', () => {
    expect(makeKey('ANImetaアニメ好き!2021'))
      .toEqual(['a', 'n', 'i', 'm', 'e', 't', 'a', 'ア', 'ニ', 'メ', '好', 'き', '2', '0', '2', '1'])
  })
})
