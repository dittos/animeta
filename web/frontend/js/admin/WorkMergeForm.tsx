import React from 'react';
import { FormGroup, Button, Modal } from 'react-bootstrap';
import { AdminWorkDto } from '../../../shared/client';
import { SearchResultItem } from '../../../shared/types';
import { API } from './ApiClient';
import TitleAutosuggest from './TitleAutosuggest';

const initialState: {
  workToMerge: { id: string; title: string; } | null;
  forceMerge: boolean;
  conflicts: {
    user_id: number;
    username: string;
    ids: string[];
  }[] | null;
} = {
  workToMerge: null,
  forceMerge: false,
  conflicts: null,
}
class WorkMergeForm extends React.Component<{
  work: AdminWorkDto;
  onMerge: () => void;
}, typeof initialState> {
  titleSearch = React.createRef<TitleAutosuggest>();
  state = {...initialState};

  render() {
    return (
      <div>
        <FormGroup>
          <TitleAutosuggest
            onSelected={this._onWorkToMergeSelected}
            ref={this.titleSearch}
          />
        </FormGroup>

        {this.state.workToMerge && (
          <Modal show={true}>
            <Modal.Header>
              <Modal.Title>Merge</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Do you want to merge{' '}
                <strong>{this.state.workToMerge.title}</strong> into{' '}
                <strong>{this.props.work.title}</strong>?
              </p>
              {this.state.conflicts && (
                <div>
                  <p>Users with conflict exist:</p>
                  <ul>
                    {this.state.conflicts.map(c => (
                      <li key={c.user_id}>
                        {c.username}:
                        {c.ids.map(recordId => [
                          ' ',
                          <a href={`/records/${recordId}/`} target="_blank">
                            {recordId}
                          </a>,
                        ])}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              {this.state.conflicts && (
                <label>
                  <input
                    type="checkbox"
                    checked={this.state.forceMerge}
                    onChange={e =>
                      this.setState({ forceMerge: e.target.checked })
                    }
                  />
                  Force merge
                </label>
              )}
              <Button
                variant="danger"
                onClick={this._merge}
                disabled={!!this.state.conflicts && !this.state.forceMerge}
              >
                Merge
              </Button>
              <Button variant="link" onClick={this._cancelMerge}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    );
  }

  _onWorkToMergeSelected = ({ id, title }: SearchResultItem) => {
    this.setState({ workToMerge: { id: '' + id, title } });
    this.titleSearch.current!.clear();
  };

  _merge = () => {
    API.call('/api/admin/v1/WorkMergeForm/merge', {
      workId: this.props.work.id,
      otherWorkId: this.state.workToMerge!.id,
      forceMerge: !!this.state.conflicts && this.state.forceMerge,
    }).then(
      () => {
        this.setState({
          workToMerge: null,
          conflicts: null,
        });
        this.props.onMerge();
      },
      err => {
        if (err.extra && err.extra.conflicts) {
          this.setState({
            conflicts: err.extra.conflicts,
            forceMerge: false,
          });
        } else {
          return Promise.reject(err);
        }
      }
    );
  };

  _cancelMerge = () => {
    this.setState(initialState);
  };
}

export default WorkMergeForm;
