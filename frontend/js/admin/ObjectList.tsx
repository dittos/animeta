import * as React from 'react';
import { Link } from 'react-router-dom';

interface Entity {
  id: number;
}

export interface ObjectListProps<T extends Entity> {
  location: {
    search: string;
  };
  basePath: string;
  loader: (page: number) => Promise<any[]>;
  renderItem: (item: T, context: ObjectListContext) => React.ReactNode;
}

interface ObjectListState<T extends Entity> {
  data: T[];
}

export interface ObjectListContext {
  reload(): Promise<any>;
}

class ObjectList<T extends Entity> extends React.Component<ObjectListProps<T>, ObjectListState<T>> {
  state: ObjectListState<T> = {
    data: [],
  };

  async _reload() {
    const query = new URLSearchParams(this.props.location.search);
    const page = parseInt(query.get('page') || '1', 10);
    this.setState({ data: await this.props.loader(page) }, () => {
      window.scrollTo(0, 0);
    });
  }

  componentDidMount() {
    this._reload();
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.location.search !== this.props.location.search) {
      this._reload();
    }
  }

  render() {
    const data = this.state.data;
    const query = new URLSearchParams(this.props.location.search);
    const page = parseInt(query.get('page') || '1', 10);
    const listContext = {
      reload: this._reload,
    };
    return (
      <div>
        <ul>
          {data.map(item => (
            <li key={item.id}>
              {this.props.renderItem(item, listContext)}
            </li>
          ))}
        </ul>

        <p>
          <Link to={{ pathname: this.props.basePath, search: `?page=${page + 1}` }}>
            Next
          </Link>
        </p>
      </div>
    );
  }
}

export default ObjectList;
