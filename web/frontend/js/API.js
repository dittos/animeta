import $ from 'jquery';
import isString from 'lodash/isString';

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
