import React from 'react';
import {
  FormGroup,
  Button,
} from 'react-bootstrap';
import * as API from './API';
import TitleAutosuggest from './TitleAutosuggest';

class WorkMergeForm extends React.Component {
  state = {
    workToMerge: null
  };

  render() {
    return (
      <div>
        <FormGroup style={{display: this.state.workToMerge ? 'none' : ''}}>
          <TitleAutosuggest onSelected={this._onWorkToMergeSelected} />
        </FormGroup>

        {this.state.workToMerge && (
          <FormGroup>
            <p>Do you want to merge <strong>{this.state.workToMerge.title}</strong> into <strong>{this.props.work.title}</strong>?</p>
            <Button bsStyle="danger" onClick={this._merge}>Merge</Button>
            <Button bsStyle="link" onClick={this._cancelMerge}>Cancel</Button>
          </FormGroup>
        )}
      </div>
    );
  }

  _onWorkToMergeSelected = (work) => {
    this.setState({ workToMerge: work });
  };

  _merge = () => {
    // TODO
  };

  _cancelMerge = () => {
    this.setState({ workToMerge: null });
  };
}

export default WorkMergeForm;
