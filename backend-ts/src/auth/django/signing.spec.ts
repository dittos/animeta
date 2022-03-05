import { Signing } from "./signing"
import { SignatureExpired } from "./timestamp_signer"

describe('Signing', () => {
  describe('loadString', () => {
    test('works', () => {
      const value = Signing.loadString(".eJxVjcEOwiAQRP-FsyGFhrXt0bvfQBbYCmrAsG2iMf67JelBr_PmzbyFxXWJdmWq1qG_UQ5iEuGK-VKkL3mpyclWkTtleS6B7qe9e_gdiMhxswGc0oC9CXpW5I-I0A2jCuOg-xk35JQxPcC_nNqxahkTcyrZ0vOR6ktM3ecLDnM35g:1bRAys:7iVnJCJ8NWj7IXc9cLW9Pxfz6oY", "asdkfjlaskdfjklaf", "django.contrib.sessions.backends.signed_cookies", testSerializer, null)
      expect(value).toBe("{\"_auth_user_backend\":\"django.contrib.auth.backends.ModelBackend\",\"_auth_user_hash\":\"66b126a35d2f1ec7aa60891d9823fa126b155366\",\"_auth_user_id\":\"1\",\"_session_expiry\":0}");
    })

    test('should throw if expired', () => {
      expect(() => Signing.loadString(".eJxVjcEOwiAQRP-FsyGFhrXt0bvfQBbYCmrAsG2iMf67JelBr_PmzbyFxXWJdmWq1qG_UQ5iEuGK-VKkL3mpyclWkTtleS6B7qe9e_gdiMhxswGc0oC9CXpW5I-I0A2jCuOg-xk35JQxPcC_nNqxahkTcyrZ0vOR6ktM3ecLDnM35g:1bRAys:7iVnJCJ8NWj7IXc9cLW9Pxfz6oY", "asdkfjlaskdfjklaf", "django.contrib.sessions.backends.signed_cookies", testSerializer, 1000 * 60 * 60 * 24))
        .toThrow(SignatureExpired)
    })
  })

  describe('toString', () => {
    test('works', () => {
      const data = "{\"_auth_user_backend\":\"django.contrib.auth.backends.ModelBackend\",\"_auth_user_hash\":\"66b126a35d2f1ec7aa60891d9823fa126b155366\",\"_auth_user_id\":\"1\",\"_session_expiry\":0}"
      const signed = Signing.toString(data, "asdkfjlaskdfjklaf", "django.contrib.sessions.backends.signed_cookies", testSerializer, true)
      expect(data).toBe(Signing.loadString(signed, "asdkfjlaskdfjklaf", "django.contrib.sessions.backends.signed_cookies", testSerializer, null))
      expect(signed).not.toContain('undefined')
    })
  })

  const testSerializer = {
    serialize(s: string): Buffer {
      return Buffer.from(s)
    },
    deserialize(data: Buffer): string {
      return data.toString()
    }
  }
})
