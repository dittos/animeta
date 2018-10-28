import * as React from 'react';
import { Link } from 'react-router-dom';
import * as API from './API';
import ObjectList, { ObjectListContext } from './ObjectList';

class WorkList extends React.Component<{location: any}> {
  render() {
    return <ObjectList
      location={this.props.location}
      loader={(page) => API.getWorks({ offset: (page - 1) * 50 })}
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
    API.deleteWork(id).then(() => context.reload());
  };
}

export default WorkList;
