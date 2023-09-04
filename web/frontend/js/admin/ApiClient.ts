import { Client, CompanyDto } from "../../../shared/client";
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

function create(): Client {
  return {
    async call(path: string, params: any): Promise<any> {
      return call(path, params)
    }
  }
}

export const API = create()

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

export function saveSessionKey(key: string) {
  sessionKey = key;
  saveSession();
}

export function getCurrentUser() {
  return API.call('/api/admin/v1/getCurrentUser', {});
}

let _companies: Promise<CompanyDto[]> | undefined;

export function getCompanies(cached = true) {
  if (!_companies || !cached) {
    _companies = API.call('/api/admin/v1/getCompanies', {});
  }
  return _companies;
}
