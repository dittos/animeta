import throttle from 'lodash/throttle';
var $ = require('jquery');
require('../typeahead');

export type SearchResultItem = {
  title: string;
  n: number;
  id: number;
};
type TypeaheadSource = (q: string, cb: (result: SearchResultItem[]) => void) => void

function cachingSource(source: TypeaheadSource, maxSize: number): TypeaheadSource {
  var cache: [string, SearchResultItem[]][] = [];
  return function(q, cb) {
    for (var i = cache.length - 1; i >= 0; i--) {
      if (cache[i][0] == q) {
        cb(cache[i][1]);
        return;
      }
    }
    source(q, function(data) {
      cache.push([q, data]);
      if (cache.length >= maxSize) {
        cache.shift();
      }
      cb(data);
    });
  };
}

export const searchSource = cachingSource(
  throttle(function(q, cb) {
    $.getJSON('/api/v2/search', { q: q }, cb);
  }, 200),
  20
);

export function init(node: Element, viewOptions: any, sourceOptions: any) {
  return $(node).typeahead(viewOptions, sourceOptions);
}

export function initSuggest(node: Element) {
  return init(node, null, {
    source: cachingSource(
      throttle(function(q, cb) {
        $.getJSON('/api/v2/search/suggest', { q: q }, cb);
      }, 200),
      20
    ),
    displayKey: 'title',
    templates: templates,
  });
}

export const templates = {
  suggestion: function(item: SearchResultItem) {
    return $('<div />')
      .append($('<span class="title" />').text(item.title))
      .append(' ')
      .append($('<span class="count" />').text(item.n + '명 기록'))
      .html();
  },
};
