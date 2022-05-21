import cookie from 'cookie'

export function getToken() {
  return cookie.parse(document.cookie).crumb
}

export async function refresh() {
  const cookies = cookie.parse(document.cookie)
  if (cookies.crumb && cookies._csrf) {
    return
  }
  try {
    await fetch('/api/fe/csrf-token')
  } catch (e) {
    // ignore
  }
}
