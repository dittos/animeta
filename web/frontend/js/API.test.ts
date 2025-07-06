import { describe, expect } from 'vitest'
import { test } from './test-extend';
import * as API from './API'

async function captureAlert(fn: () => Promise<any>): Promise<string | null> {
  let _text: string | null = null
  window.alert = (text) => _text = text
  await fn()
  return _text
}

describe('get', () => {
  test('get', async () => {
    await API.get<any>('/api/getTest')
  })
  test('get with params', async () => {
    const result = await API.get<any>('/api/getTest', {num: 123, str: 'hi', obj: {key: 'val'}, arr: [123, 'hi'], und: undefined, nul: null})
    const url = new URL(result.url)
    expect(url.search).toBe(`?num=123&str=hi&obj=${encodeURIComponent('{"key":"val"}')}&arr=${encodeURIComponent('[123,"hi"]')}&nul=null`)
  })

  test('standard error should alert message from response', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.get('/api/standardError')
        expect(false).toBe(true)
      } catch (e) {
        expect(e.status).toBe(400)
      }
    })
    expect(alertText).toBe('message')
  })
  test('standard error should not alert if custom error handling', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.get('/api/standardError', undefined, true)
        expect(false).toBe(true)
      } catch (e) {
        expect(e.status).toBe(400)
      }
    })
    expect(alertText).toBeNull()
  })
  test('non-json error should alert common message', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.get('/api/nonJsonError')
        expect(false).toBe(true)
      } catch (e) {
      }
    })
    expect(alertText).toBe('서버 오류로 요청에 실패했습니다.')
  })
  test('non-json error should not alert if custom error handling', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.get('/api/nonJsonError', undefined, true)
        expect(false).toBe(true)
      } catch (e) {
      }
    })
    expect(alertText).toBeNull()
  })
  test('network error should alert common message', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.get('/api/networkError')
        expect(false).toBe(true)
      } catch (e) {
        expect(Boolean(e.status)).toBe(false)
      }
    })
    expect(alertText).toBe('서버 오류로 요청에 실패했습니다.')
  })
  test('network error should not alert if custom error handling', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.get('/api/networkError', undefined, true)
        expect(false).toBe(true)
      } catch (e) {
        expect(Boolean(e.status)).toBe(false)
      }
    })
    expect(alertText).toBeNull()
  })
})

describe('postJSON', () => {
  test('postJSON', async () => {
    await API.postJSON<any>('/api/postTest')
  })
  test('postJSON with params', async () => {
    const params = {num: 123, str: 'hi', obj: {key: 'val'}, arr: [123, 'hi'], und: undefined, nul: null}
    const result = await API.postJSON<any>('/api/postTest', params)
    delete params.und
    expect(result.body).toEqual(params)
  })

  test('standard error should alert message from response', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.postJSON('/api/standardError')
        expect(false).toBe(true)
      } catch (e) {
        expect(e.status).toBe(400)
      }
    })
    expect(alertText).toBe('message')
  })
  test('standard error should not alert if custom error handling', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.postJSON('/api/standardError', undefined, true)
        expect(false).toBe(true)
      } catch (e) {
        expect(e.status).toBe(400)
      }
    })
    expect(alertText).toBeNull()
  })
  test('non-json error should alert common message', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.postJSON('/api/nonJsonError')
        expect(false).toBe(true)
      } catch (e) {
      }
    })
    expect(alertText).toBe('서버 오류로 요청에 실패했습니다.')
  })
  test('non-json error should not alert if custom error handling', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.postJSON('/api/nonJsonError', undefined, true)
        expect(false).toBe(true)
      } catch (e) {
      }
    })
    expect(alertText).toBeNull()
  })
  test('network error should alert common message', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.postJSON('/api/networkError')
        expect(false).toBe(true)
      } catch (e) {
        expect(Boolean(e.status)).toBe(false)
      }
    })
    expect(alertText).toBe('서버 오류로 요청에 실패했습니다.')
  })
  test('network error should not alert if custom error handling', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.postJSON('/api/networkError', undefined, true)
        expect(false).toBe(true)
      } catch (e) {
        expect(Boolean(e.status)).toBe(false)
      }
    })
    expect(alertText).toBeNull()
  })
})

describe('doDelete', () => {
  test('doDelete', async () => {
    await API.doDelete('/api/deleteTest')
  })

  test('standard error should alert message from response', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.doDelete('/api/standardError')
        expect(false).toBe(true)
      } catch (e) {
        expect(e.status).toBe(400)
      }
    })
    expect(alertText).toBe('message')
  })
  test('non-json error should alert common message', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.doDelete('/api/nonJsonError')
        expect(false).toBe(true)
      } catch (e) {
      }
    })
    expect(alertText).toBe('서버 오류로 요청에 실패했습니다.')
  })
  test('network error should alert common message', async () => {
    const alertText = await captureAlert(async () => {
      try {
        await API.doDelete('/api/networkError')
        expect(false).toBe(true)
      } catch (e) {
        expect(Boolean(e.status)).toBe(false)
      }
    })
    expect(alertText).toBe('서버 오류로 요청에 실패했습니다.')
  })
})
