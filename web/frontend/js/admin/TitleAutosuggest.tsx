import React from 'react';
import { FormControl } from 'react-bootstrap';
import { loadTypeahead } from '../typeahead';
import * as API from './API';
import './TitleAutosuggest.css';
import { SearchResultItem } from '../../../shared/types';
import throttle from 'lodash/throttle';

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

const source = cachingSource(
  throttle((q, cb) => {
    API.searchWork(q, { minRecordCount: 0 }).then(cb);
  }, 200),
  20
);

function escapeHTML(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const typeaheadTemplates = {
  suggestion: function(item: SearchResultItem) {
    return (
      '<span class="title">' +
      escapeHTML(item.title) +
      '</span> <span class="count">' +
      item.recordCount +
      '명 기록</span>'
    );
  },
};

class TitleAutosuggest extends React.Component<{
  onSelected: (item: SearchResultItem) => void;
}> {
  input = React.createRef<HTMLInputElement>();
  private _typeahead: any;

  async componentDidMount() {
    const $ = await loadTypeahead()
    this._typeahead = ($(this.input.current!) as any)
      .typeahead(
        { hint: false },
        {
          source,
          displayKey: 'title',
          templates: typeaheadTemplates,
        }
      )
      .on('typeahead:selected', (_: any, item: SearchResultItem) => {
        this.props.onSelected(item);
      });
  }

  render() {
    return <FormControl ref={this.input} />;
  }

  clear() {
    this._typeahead.typeahead('val', '');
  }

  getValue() {
    return this._typeahead.typeahead('val');
  }
}

export default TitleAutosuggest;
