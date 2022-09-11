/// <reference types="mocha" />

import React from 'react'
import { RouteComponentProps } from '../routes'
import * as API from '../API'
import { assert } from 'chai'

async function captureAlert(fn: () => Promise<any>): Promise<string | null> {
  let _text: string | null = null
  window.alert = (text) => _text = text
  await fn()
  return _text
}

async function runTests() {
  mocha.setup('tdd')
  mocha.checkLeaks()

  suite('get', () => {
    test('get', async () => {
      await API.get<any>('/api/getTest')
    })
    test('get with params', async () => {
      const result = await API.get<any>('/api/getTest', {num: 123, str: 'hi', obj: {key: 'val'}, arr: [123, 'hi'], und: undefined, nul: null})
      const url = new URL(result.url)
      assert.equal(url.search, `?num=123&str=hi&obj=${encodeURIComponent('{"key":"val"}')}&arr=${encodeURIComponent('[123,"hi"]')}&nul=null`)
    })

    test('standard error should alert message from response', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.get('/api/standardError')
          assert.fail()
        } catch (e) {
          assert.equal(e.status, 400)
        }
      })
      assert.equal(alertText, 'message')
    })
    test('standard error should not alert if custom error handling', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.get('/api/standardError', undefined, true)
          assert.fail()
        } catch (e) {
          assert.equal(e.status, 400)
        }
      })
      assert.isNull(alertText)
    })
    test('non-json error should alert common message', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.get('/api/nonJsonError')
          assert.fail()
        } catch (e) {
        }
      })
      assert.equal(alertText, '서버 오류로 요청에 실패했습니다.')
    })
    test('non-json error should not alert if custom error handling', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.get('/api/nonJsonError', undefined, true)
          assert.fail()
        } catch (e) {
        }
      })
      assert.isNull(alertText)
    })
    test('network error should alert common message', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.get('/api/networkError')
          assert.fail()
        } catch (e) {
          assert.isFalse(Boolean(e.status))
        }
      })
      assert.equal(alertText, '서버 오류로 요청에 실패했습니다.')
    })
    test('network error should not alert if custom error handling', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.get('/api/networkError', undefined, true)
          assert.fail()
        } catch (e) {
          assert.isFalse(Boolean(e.status))
        }
      })
      assert.isNull(alertText)
    })
  })
  
  suite('postJSON', () => {
    test('postJSON', async () => {
      await API.postJSON<any>('/api/postTest')
    })
    test('postJSON with params', async () => {
      const params = {num: 123, str: 'hi', obj: {key: 'val'}, arr: [123, 'hi'], und: undefined, nul: null}
      const result = await API.postJSON<any>('/api/postTest', params)
      delete params.und
      assert.deepEqual(result.body, params)
    })

    test('standard error should alert message from response', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.postJSON('/api/standardError')
          assert.fail()
        } catch (e) {
          assert.equal(e.status, 400)
        }
      })
      assert.equal(alertText, 'message')
    })
    test('standard error should not alert if custom error handling', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.postJSON('/api/standardError', undefined, true)
          assert.fail()
        } catch (e) {
          assert.equal(e.status, 400)
        }
      })
      assert.isNull(alertText)
    })
    test('non-json error should alert common message', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.postJSON('/api/nonJsonError')
          assert.fail()
        } catch (e) {
        }
      })
      assert.equal(alertText, '서버 오류로 요청에 실패했습니다.')
    })
    test('non-json error should not alert if custom error handling', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.postJSON('/api/nonJsonError', undefined, true)
          assert.fail()
        } catch (e) {
        }
      })
      assert.isNull(alertText)
    })
    test('network error should alert common message', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.postJSON('/api/networkError')
          assert.fail()
        } catch (e) {
          assert.isFalse(Boolean(e.status))
        }
      })
      assert.equal(alertText, '서버 오류로 요청에 실패했습니다.')
    })
    test('network error should not alert if custom error handling', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.postJSON('/api/networkError', undefined, true)
          assert.fail()
        } catch (e) {
          assert.isFalse(Boolean(e.status))
        }
      })
      assert.isNull(alertText)
    })
  })
  
  suite('doDelete', () => {
    test('doDelete', async () => {
      await API.doDelete('/api/deleteTest')
    })

    test('standard error should alert message from response', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.doDelete('/api/standardError')
          assert.fail()
        } catch (e) {
          assert.equal(e.status, 400)
        }
      })
      assert.equal(alertText, 'message')
    })
    test('non-json error should alert common message', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.doDelete('/api/nonJsonError')
          assert.fail()
        } catch (e) {
        }
      })
      assert.equal(alertText, '서버 오류로 요청에 실패했습니다.')
    })
    test('network error should alert common message', async () => {
      const alertText = await captureAlert(async () => {
        try {
          await API.doDelete('/api/networkError')
          assert.fail()
        } catch (e) {
          assert.isFalse(Boolean(e.status))
        }
      })
      assert.equal(alertText, '서버 오류로 요청에 실패했습니다.')
    })
  })

  mocha.run()
}

class Debug extends React.Component<RouteComponentProps<any>> {
  componentDidMount() {
    setTimeout(() => runTests(), 1000)
  }

  render() {
    return (
      <div id="mocha" />
    )
  }
}

export default {
  component: Debug,
}
