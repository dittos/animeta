import * as React from 'react';
import { Link } from 'react-router';
import * as API from './API';
import ObjectList from './ObjectList';

class PersonList extends React.Component<{location: any}> {
  render() {
    return <ObjectList
      location={this.props.location}
      loader={API.listPerson}
      basePath="/people"
      renderItem={this._renderItem}
    />;
  }

  private _renderItem(item: any) {
    return <Link to={`/people/${item.id}`}>{item.name}</Link>;
  }
}

export default PersonList;
