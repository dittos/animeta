import * as React from 'react';
import { Link } from 'react-router-dom';
import * as API from './API';
import ObjectList, { ObjectListContext } from './ObjectList';

class CompanyList extends React.Component<{location: any}> {
  render() {
    return <ObjectList
      location={this.props.location}
      loader={(page) => API.call('/api/admin/v1/CompanyList/')}
      basePath="/companies"
      renderItem={this._renderItem}
      paginated={false}
    />;
  }

  private _renderItem = (company: any, context: ObjectListContext) => (
    <>
      <Link to={`/companies/${company.id}`}>{company.name}</Link>
    </>
  )
}

export default CompanyList;
