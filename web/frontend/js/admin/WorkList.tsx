import * as React from 'react';
import { Link } from 'react-router-dom';
import { API } from './ApiClient';
import ObjectList, { ObjectListContext } from './ObjectList';

class WorkList extends React.Component<{location: any}> {
  render() {
    return <ObjectList
      location={this.props.location}
      loader={(page) => API.call('/api/admin/v1/WorkList/', { offset: (page - 1) * 50 })}
      basePath="/works"
      renderItem={this._renderItem}
    />;
  }

  private _renderItem = (work: any, context: ObjectListContext) => (
    <>
      <Link to={`/works/${work.id}`}>{work.title}</Link>{' '}
      ({work.record_count}{' '}records)
      {work.record_count === 0 ? (
        <button onClick={() => this._deleteWork(work.id, context)}>
          Delete
        </button>
      ) : null}
    </>
  )

  private _deleteWork = (id: any, context: ObjectListContext) => {
    API.call('/api/admin/v1/WorkList/delete', {workId: id})
      .then(() => context.reload(), e => {
        alert(e.message);
      });
  };
}

export default WorkList;
