import * as React from 'react';
import * as Typeahead from './Typeahead';
import { ControllerContext } from 'nuri/components';
import { SearchResultItem } from './Typeahead';

class SearchInput extends React.Component<{
  onSelect?(title: string): void;
}> {
  static contextType = ControllerContext;
  private $: any;
  private input = React.createRef<HTMLInputElement>();

  componentDidMount() {
    const onSelect = this._onSelect;
    this.$ = Typeahead.init(
      this.input.current!,
      { highlight: true, hint: false },
      {
        source: Typeahead.searchSource,
        displayKey: 'title',
        templates: Typeahead.templates,
      }
    )
      .on('typeahead:selected', function(_: any, item: SearchResultItem) {
        onSelect(item.title);
      })
      .on('keypress', function(event: KeyboardEvent) {
        if (event.keyCode == 13) {
          var self = this;
          var q = self.value;
          Typeahead.searchSource(q, function(data) {
            if (q != self.value || data.length === 0) return;
            if (
              data.filter(function(item) {
                return item.title == q;
              }).length == 1
            )
              onSelect(q);
            else onSelect(data[0].title);
          });
        }
      });
  }

  componentWillUnmount() {
    this.$.typeahead('destroy');
  }

  render() {
    return <input type="search" placeholder="검색할 작품명 입력" ref={this.input} className="tt-input" />;
  }

  _onSelect = (title: string) => {
    this.$.typeahead('close').typeahead('val', '');
    if (this.props.onSelect) {
      this.props.onSelect(title);
    } else {
      const path = '/works/' + encodeURIComponent(title) + '/';
      if (this.context) {
        this.context.load({ path, query: {} });
      } else {
        location.href = path;
      }
    }
  };
}

export default SearchInput;
