import * as CSRF from '../CSRF';

const SESSION_KEY_STORAGE_KEY = 'sessionKey';

let sessionKey: string | null = null;

function fetchWithSession(input: RequestInfo, init: RequestInit = {}) {
  init.headers = {
    ...(init.headers || {}),
    'Accept': 'application/json',
    'X-CSRF-Token': CSRF.getToken(),
    ...(sessionKey ? {'X-Animeta-Session-Key': sessionKey} : {}),
  }
  init.credentials = 'same-origin'; // allow cookie
  return fetch(input, init).then(r => {
    if (!r.ok) return r.json().then(data => Promise.reject(data));
    return r.json();
  });
}

export function call(path: string, params = {}) {
  return fetchWithSession(path, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  });
}

function saveSession() {
  if (sessionKey) {
    window.localStorage.setItem(SESSION_KEY_STORAGE_KEY, sessionKey);
  } else {
    window.localStorage.removeItem(SESSION_KEY_STORAGE_KEY);
  }
}

export function loadSession() {
  sessionKey = window.localStorage[SESSION_KEY_STORAGE_KEY];
}

export function clearSession() {
  sessionKey = null;
  saveSession();
}

export function hasSession() {
  return !!sessionKey;
}

export async function login(username: string, password: string) {
  const resp = await fetch('/api/v4/Authenticate', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      persistent: false,
    }),
    headers: {
      'X-CSRF-Token': CSRF.getToken(),
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  });
  const result = await resp.json();
  sessionKey = result.sessionKey;
  saveSession();
  return result;
}

export function getCurrentUser() {
  return fetchWithSession('/api/v4/me');
}
