import * as CSRF from '../CSRF';

const SESSION_KEY_STORAGE_KEY = 'sessionKey';

let sessionKey;

function fetchWithSession(input, init = {}) {
  init.headers = init.headers || {};
  init.headers['Accept'] = 'application/json';
  init.headers['X-Animeta-Session-Key'] = sessionKey;
  init.headers['X-CSRF-Token'] = CSRF.getToken();
  init.credentials = 'same-origin'; // allow cookie
  return fetch(input, init).then(r => {
    if (!r.ok) return r.json().then(data => Promise.reject(data));
    return r.json();
  });
}

export function call(path, params = {}) {
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

export async function login(username, password) {
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

export function createWork(title) {
  return call(`/api/admin/v1/createWork`, {title})
}

export function searchWork(q, { minRecordCount = 2 }) {
  const params = new URLSearchParams();
  params.append('q', q);
  params.append('min_record_count', minRecordCount);
  return fetchWithSession(`/api/v4/search?${params}`);
}

export function clearCache() {
  return fetchWithSession('/api/admin/v0/caches', { method: 'DELETE' });
}

let _companies;

export function getCompanies(cached = true) {
  if (!_companies || !cached) {
    _companies = call('/api/admin/v1/getCompanies');
  }
  return _companies;
}
