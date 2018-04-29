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
  userName,
  { title, statusType, status, categoryID, comment }
) {
  return post(`/api/v2/users/${userName}/records`, {
    work_title: title,
    status_type: statusType,
    category_id: categoryID,
    status,
    comment,
  });
}

// Record

export function updateRecordTitle(recordID, title) {
  return post(`/api/v2/records/${recordID}`, { title: title });
}

export function updateRecordCategoryID(recordID, categoryID) {
  return post(`/api/v2/records/${recordID}`, { category_id: categoryID });
}

export function deleteRecord(recordID) {
  return doDelete(`/api/v2/records/${recordID}`);
}

// Record Posts

export function getRecordPosts(recordID) {
  return $.get(`/api/v2/records/${recordID}/posts`, {
    options: JSON.stringify({}),
  });
}

export function createPost(
  recordID,
  { status, statusType, comment, containsSpoiler, publishTwitter }
) {
  return post(`/api/v2/records/${recordID}/posts`, {
    status,
    status_type: statusType,
    comment,
    contains_spoiler: containsSpoiler,
    publish_twitter: publishTwitter ? 'on' : 'off',
  });
}

// Post

export function deletePost(postID) {
  return doDelete(`/api/v2/posts/${postID}`);
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

export function renameCategory(categoryID, categoryName) {
  return post(`/api/v2/categories/${categoryID}`, { name: categoryName });
}

export function removeCategory(categoryID) {
  return doDelete(`/api/v2/categories/${categoryID}`);
}

// User Categories

export function addCategory(userName, categoryName) {
  return post(`/api/v2/users/${userName}/categories`, {
    name: categoryName,
  });
}

export function updateCategoryOrder(userName, categoryIDs) {
  return put(`/api/v2/users/${userName}/categories`, { ids: categoryIDs });
}
