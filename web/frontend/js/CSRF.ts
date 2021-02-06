import cookie from 'cookie';
import { getCurrentUser } from './API';

export function getToken() {
  return cookie.parse(document.cookie).crumb;
}

export async function refresh() {
  const cookies = cookie.parse(document.cookie);
  if (cookies.crumb && cookies._csrf) {
    return null
  }
  try {
    await getCurrentUser()
  } catch (e) {
    // ignore
  }
  return null;
}
