import { normalizeTitle } from "./work"

describe('normalizeTitle', () => {
  it('normalizes', () => {
    expect(normalizeTitle('  가나다 ㄱㄴㄷ AbCdE　ＡｂＣｄＥ 12345 １２３４５ !!+ @#$%^&*() '))
      .toBe('가나다ㄱㄴㄷabcdeabcde1234512345!!+')
  })
})
