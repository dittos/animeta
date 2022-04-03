import * as React from 'react';
import { Link } from 'react-router-dom';
import { API } from './ApiClient';
import ObjectList from './ObjectList';

function TransliterationCheckNavigatorForm() {
  const currentYear = new Date().getFullYear();
  const items = [];
  for (var y = currentYear; y <= currentYear + 1; y++) {
    const maxQuarter = y <= currentYear ? 4 : 1;
    for (var q = 1; q <= maxQuarter; q++) {
      const period = `${y}Q${q}`;
      items.push(
        <Link to={`/people/transliterationCheck/${period}`}>{period}</Link>,
        ' '
      );
    }
  }
  items.reverse();
  return <p>
    Transliteration Check: {items}
  </p>;
}

class PersonList extends React.Component<{location: any}> {
  render() {
    return <>
      <TransliterationCheckNavigatorForm />

      <ObjectList
        location={this.props.location}
        loader={page => API.call('/api/admin/v1/PersonList/', {page})}
        basePath="/people"
        renderItem={this._renderItem}
      />
    </>;
  }

  private _renderItem(item: any) {
    return <Link to={`/people/${item.id}`}>{item.name}</Link>;
  }
}

export default PersonList;
