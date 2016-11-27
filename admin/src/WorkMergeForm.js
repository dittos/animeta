import React from 'react';
import {
  FormGroup,
  Button,
  Modal,
} from 'react-bootstrap';
import * as API from './API';
import TitleAutosuggest from './TitleAutosuggest';

class WorkMergeForm extends React.Component {
  state = {
    workToMerge: null,
    forceMerge: false,
  };

  render() {
    return (
      <div>
        <FormGroup>
          <TitleAutosuggest onSelected={this._onWorkToMergeSelected} />
        </FormGroup>

        {this.state.workToMerge && (
          <Modal show={true}>
            <Modal.Header>
              <Modal.Title>Merge</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Do you want to merge <strong>{this.state.workToMerge.title}</strong> into <strong>{this.props.work.title}</strong>?</p>
              {this.state.conflicts && (
                <div>
                  <p>Users with conflict exist:</p>
                  <ul>
                  {this.state.conflicts.map(c => (
                    <li key={c.user_id}>
                      {c.username}:
                      {c.ids.map(recordId => [
                        ' ',
                        <a href={`/records/${recordId}/`} target="_blank">{recordId}</a>
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
                    onChange={e => this.setState({ forceMerge: e.target.checked })}
                  />
                  Force merge
                </label>
              )}
              <Button
                bsStyle="danger"
                onClick={this._merge}
                disabled={this.state.conflicts && !this.state.forceMerge}>
                Merge
              </Button>
              <Button bsStyle="link" onClick={this._cancelMerge}>Cancel</Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    );
  }

  _onWorkToMergeSelected = (work) => {
    this.setState({ workToMerge: work });
  };

  _merge = () => {
    API.editWork(this.props.work.id, {
      mergeWorkId: this.state.workToMerge.id,
      forceMerge: this.state.conflicts && this.state.forceMerge,
    }).then(() => {
      this.setState({
        workToMerge: null,
        conflicts: null,
      });
      this.props.onMerge();
    }, err => {
      if (err.extra && err.extra.conflicts) {
        this.setState({
          conflicts: err.extra.conflicts,
          forceMerge: false,
        });
      } else {
        return Promise.reject(err);
      }
    });
  };

  _cancelMerge = () => {
    this.setState({ workToMerge: null });
  };
}

export default WorkMergeForm;
