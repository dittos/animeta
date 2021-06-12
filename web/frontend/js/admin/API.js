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
  const resp = await fetch('/api/v3/Authenticate', {
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
  return fetchWithSession('/api/v2/me');
}

export function getWorks({ orphans = false, offset = 0 }) {
  const params = new URLSearchParams();
  params.append('offset', offset);
  if (orphans) params.append('orphans', '1');
  return fetchWithSession(`/api/admin/works?${params}`);
}

export function createWork(title) {
  return fetchWithSession(`/api/admin/works`, {
    method: 'POST',
    body: JSON.stringify({ title }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getWork(id) {
  return fetchWithSession(`/api/admin/works/${id}`);
}

export function editWork(id, request) {
  return fetchWithSession(`/api/admin/works/${id}`, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function deleteWork(id) {
  return fetchWithSession(`/api/admin/works/${id}`, { method: 'DELETE' });
}

export function addTitleMapping(workId, titleMapping) {
  return fetchWithSession(`/api/admin/works/${workId}/title-mappings`, {
    method: 'POST',
    body: JSON.stringify(titleMapping),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function deleteTitleMapping(id) {
  return fetchWithSession(`/api/admin/title-mappings/${id}`, {
    method: 'DELETE',
  });
}

export function searchWork(q, { minRecordCount = 2 }) {
  const params = new URLSearchParams();
  params.append('q', q);
  params.append('min_record_count', minRecordCount);
  return fetchWithSession(`/api/v2/search?${params}`);
}

export function clearCache() {
  return fetchWithSession('/api/admin/caches', { method: 'DELETE' });
}

export function listPerson(page = 1) {
  return fetchWithSession(`/api/admin/people?page=${page}`);
}

export function getPerson(id) {
  return fetchWithSession(`/api/admin/people/${id}`);
}

export function editPerson(id, request) {
  return fetchWithSession(`/api/admin/people/${id}`, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function bulkEditPerson(request) {
  return fetchWithSession(`/api/admin/people`, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { 'Content-Type': 'application/json' },
  });
}

let _companies;

export function getCompanies(cached = true) {
  if (!_companies || !cached) {
    _companies = fetchWithSession('/api/admin/companies');
  }
  return _companies;
}

export function getCompany(id) {
  return fetchWithSession(`/api/admin/companies/${id}`);
}

export function editCompany(id, request) {
  return fetchWithSession(`/api/admin/companies/${id}`, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getPeopleTransliterationCheck(period) {
  return fetchWithSession(`/api/admin/people/transliterationCheck?period=${period}`);
}
