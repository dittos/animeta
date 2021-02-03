import $ from 'jquery';
import cookie from 'cookie';
import { getCurrentUser } from './API';

export function getToken() {
  return cookie.parse(document.cookie).crumb;
}

export function refresh() {
  const cookies = cookie.parse(document.cookie);
  const deferred = $.Deferred();
  if (cookies.crumb && cookies._csrf)
    deferred.resolve(null);
  else
    getCurrentUser().always(() => deferred.resolve(null));
  return deferred;
}

export function refreshPromise() {
  const cookies = cookie.parse(document.cookie);
  return new Promise((resolve) => {
    if (cookies.crumb && cookies._csrf)
      resolve(null);
    else
      getCurrentUser().always(() => resolve(null));
  });
}
