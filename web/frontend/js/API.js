import $ from 'jquery';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import * as CSRF from './CSRF';

export function merge(a, b) {
  if (isPlainObject(a) && isPlainObject(b)) {
    // recursively merge() each matching property
    const merged = {};
    var k;
    for (k in a) {
      if (k in b) {
        merged[k] = merge(a[k], b[k]);
      } else {
        merged[k] = a[k];
      }
    }
    for (k in b) {
      if (!(k in merged)) {
        merged[k] = b[k];
      }
    }
    return merged;
  } else {
    // (true, true) => true
    // (true, false) => true
    // (false, true) => true
    // (false, false) => false
    return a || b;
  }
}

export function serializeParams(params) {
  if (!params) {
    return params;
  }
  const result = {};
  for (var k in params) {
    const v = params[k];
    result[k] = isString(v) ? v : JSON.stringify(v);
  }
  return result;
}

export function doDelete(url) {
  return CSRF.refresh().then(() => $.ajax({ type: 'DELETE', url }));
}

export function put(url, data) {
  return CSRF.refresh().then(() => $.ajax({ type: 'PUT', url, data }));
}

export function post(url, data) {
  return CSRF.refresh().then(() => $.post(url, data));
}

export function postJSON(url, data = {}, customErrorHandling = false) {
  return CSRF.refresh().then(() => $.post({
    url,
    data: JSON.stringify(data),
    contentType: 'application/json',
    __silent__: customErrorHandling,
  }));
}

// Login Session

export function authenticate({ username, password, persistent }) {
  return postJSON('/api/v3/Authenticate', {
    username,
    password,
    persistent,
  });
}

export function createFrontendSession(authResult) {
  return postJSON('/api/fe/sessions', { authResult });
}

export function deleteFrontendSession() {
  return doDelete('/api/fe/sessions');
}

export function getCurrentUser(params) {
  return $.ajax({
    url: '/api/v2/me',
    data: serializeParams(params),
    __silent__: true,
  }).then(undefined, jqXHR => {
    var deferred = $.Deferred();
    if (jqXHR.statusCode) deferred.resolve(null);
    else deferred.reject(jqXHR);
    return deferred;
  });
}

// Account

export function createAccount({ username, password1, password2 }, customErrorHandling = false) {
  return postJSON('/api/v3/CreateAccount', {
    username,
    password1,
    password2,
  }, customErrorHandling);
}

export function changePassword(oldPassword, newPassword) {
  return postJSON('/api/v3/ChangePassword', {
    oldPassword,
    newPassword,
  });
}

export function createBackup() {
  return postJSON('/api/v3/CreateBackup');
}

// External Services

export function disconnectTwitter() {
  return postJSON('/api/v3/DisconnectTwitter');
}

// User Posts

export function getUserPosts(userName, count, beforeID) {
  return $.get(`/api/v2/users/${userName}/posts`, {
    count,
    before_id: beforeID,
    options: JSON.stringify({
      record: {},
    }),
  });
}

// Category

export function renameCategory(id, name) {
  return postJSON('/api/v3/UpdateCategory', { id, name });
}

export function removeCategory(id) {
  return postJSON('/api/v3/DeleteCategory', { id });
}

// User Categories

export function addCategory(name) {
  return postJSON('/api/v3/CreateCategory', {
    name,
  });
}

export function updateCategoryOrder(categoryIds) {
  return postJSON('/api/v3/UpdateCategoryOrder', { categoryIds });
}
