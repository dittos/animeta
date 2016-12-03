import React from 'react';
import { findDOMNode } from 'react-dom';
import { FormControl } from 'react-bootstrap';
import jQuery from 'jquery';
import '../typeahead';
import * as API from './API';
import './TitleAutosuggest.css';

function cachingSource(source, maxSize) {
  var cache = [];
  return function(q, cb) {
    for (var i = cache.length - 1; i >= 0; i--) {
      if (cache[i][0] === q) {
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

function debouncingSource(source, rate) {
  var timer = null;
  return function(q, cb) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function() {
      source(q, cb);
    }, rate);
  };
}

const source = cachingSource(debouncingSource((q, cb) => {
  API.searchWork(q, {minRecordCount: 0}).then(cb);
}));

function escapeHTML(html) {
    return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const typeaheadTemplates = {
    suggestion: function(item) {
        return '<span class="title">' + escapeHTML(item.title) + '</span> <span class="count">' + item.n + '명 기록</span>';
    }
};

class TitleAutosuggest extends React.Component {
  componentDidMount() {
    this._typeahead = jQuery(findDOMNode(this.refs.input)).typeahead({hint: false}, {
      source,
      displayKey: 'title',
      templates: typeaheadTemplates,
    }).on('typeahead:selected', (event, item) => {
      this.props.onSelected(item);
    });
  }

  render() {
    return <FormControl ref="input" />;
  }

  clear() {
    this._typeahead.typeahead('val', '');
  }

  getValue() {
    return this._typeahead.typeahead('val');
  }
}

export default TitleAutosuggest;
