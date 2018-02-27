import * as React from 'react';
import * as Typeahead from './Typeahead';

class SearchInput extends React.Component {
    componentDidMount() {
        const onSelect = this._onSelect;
        this.$ = Typeahead.init(this.refs.input,
            {highlight: true, hint: false}, {
                source: Typeahead.searchSource,
                displayKey: 'title',
                templates: Typeahead.templates
            }).on('typeahead:selected', function(event, item) {
                onSelect(item.title);
            }).on('keypress', function(event) {
                if (event.keyCode == 13) {
                    var self = this;
                    var q = self.value;
                    Typeahead.searchSource(q, function(data) {
                        if (q != self.value || data.length === 0)
                            return;
                        if (data.filter(function(item) { return item.title == q; }).length == 1)
                            onSelect(q);
                        else
                            onSelect(data[0].title);
                    });
                }
            });
    }

    componentWillUnmount() {
        this.$.typeahead('destroy');
    }

    render() {
        return <input type="search" placeholder="작품 검색" ref="input" />;
    }

    _onSelect = (title) => {
        this.$.typeahead('close').typeahead('val', '');
        this.props.onSelect(title);
    };
}

export default SearchInput;
