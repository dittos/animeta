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

export function postJSON(url, data) {
  return CSRF.refresh().then(() => $.post({
    url,
    data: JSON.stringify(data),
    contentType: 'application/json',
  }));
}

// Login Session

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

export function logout() {
  return doDelete('/api/v2/auth');
}

// Account

export function changePassword(oldPassword, newPassword1, newPassword2) {
  return post('/api/v2/me/password', {
    old_password: oldPassword,
    new_password1: newPassword1,
    new_password2: newPassword2,
  });
}

export function createBackup() {
  return post('/api/v2/backups');
}

// External Services

export function disconnectTwitter() {
  return doDelete('/api/v2/me/external-services/twitter');
}

// User Records

export function createRecord(
  { title, statusType, status, categoryID, comment },
  options = {},
  postOptions = null
) {
  return postJSON('/api/v3/CreateRecord', {
    title,
    categoryId: categoryID,
    status,
    statusType: statusType.toUpperCase(),
    comment,
    options,
    postOptions,
  });
}

// Record

export function updateRecordTitle(recordID, title) {
  return post(`/api/v2/records/${recordID}`, { title: title });
}

export function updateRecordCategoryID(recordID, categoryID) {
  return post(`/api/v2/records/${recordID}`, { category_id: categoryID });
}

export function deleteRecord(id) {
  return postJSON('/api/v3/DeleteRecord', { id });
}

// Record Posts

export function getRecordPosts(recordID) {
  return $.get(`/api/v2/records/${recordID}/posts`, {
    options: JSON.stringify({}),
  });
}

export function createPost(
  recordId,
  { status, statusType, comment, containsSpoiler, publishTwitter },
  options,
) {
  return postJSON('/api/v3/CreatePost', {
    recordId,
    status,
    statusType: statusType.toUpperCase(),
    comment,
    containsSpoiler: containsSpoiler || false,
    publishTwitter: publishTwitter || false,
    options,
  });
}

// Post

export function deletePost(id, recordOptions) {
  return postJSON('/api/v3/DeletePost', { id, recordOptions });
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
