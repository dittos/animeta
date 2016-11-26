let sessionKey;

function fetchWithSession(input, init = {}) {
  init.headers = init.headers || {};
  init.headers['Accept'] = 'application/json';
  init.headers['X-Animeta-Session-Key'] = sessionKey;
  return fetch(input, init).then(r => {
    if (!r.ok)
      return Promise.reject(r);
    return r.json();
  });
}

function saveSession() {
  window.localStorage.setItem('sessionKey', sessionKey);
}

export function loadSession() {
  sessionKey = window.localStorage.sessionKey;
}

export function clearSession() {
  sessionKey = null;
  saveSession();
}

export function hasSession() {
  return !!sessionKey;
}

export async function login(username, password){
  const data = new FormData();
  data.append('username', username);
  data.append('password', password);
  const resp = await fetch('/api/v2/auth', {method: 'POST', body: data});
  const result = await resp.json();
  if (result.ok) {
    sessionKey = result.session_key;
  }
  saveSession();
  return result;
}

export function getCurrentUser() {
  return fetchWithSession('/api/v2/me');
}

export function getWorks({ orphans = false, offset = 0 }) {
  const params = new URLSearchParams();
  params.append('offset', offset);
  if (orphans)
    params.append('orphans', '1');
  return fetchWithSession(`/api/admin/works?${params}`);
}

export function getWork(id) {
  return fetchWithSession(`/api/admin/works/${id}`);
}

export function editWork(id, request) {
  return fetchWithSession(`/api/admin/works/${id}`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function deleteWork(id) {
  return fetchWithSession(`/api/admin/works/${id}`, {method: 'DELETE'});
}

export function addTitleMapping(workId, titleMapping) {
  return fetchWithSession(`/api/admin/works/${workId}/title-mappings`, {
    method: 'POST',
    body: JSON.stringify(titleMapping),
  });
}

export function deleteTitleMapping(id) {
  return fetchWithSession(`/api/admin/title-mappings/${id}`, {method: 'DELETE'});
}

export function searchWork(q, {minRecordCount = 2}) {
  const params = new URLSearchParams();
  params.append('q', q);
  params.append('min_record_count', minRecordCount);
  return fetchWithSession(`/api/v2/search?${params}`);
}
