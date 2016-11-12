import React from 'react';
import { findDOMNode } from 'react-dom';
import {
  Table,
  Form,
  FormGroup,
  FormControl,
  Button,
} from 'react-bootstrap';
import * as API from './API';

class WorkDetail extends React.Component {
  state = {
    work: null
  };

  componentDidMount() {
    this._load();
  }

  _load = async () => {
    const work = await API.getWork(this.props.params.id);
    this.setState({ work });
  };

  render() {
    const work = this.state.work;

    if (!work)
      return <div />;

    return (
      <div>
        <h2>{work.title}</h2>

        <Table>
          <tbody>
            <tr>
              <th>ID</th>
              <td>{work.id}</td>
            </tr>

            <tr>
              <th>Record Count (Index)</th>
              <td>{work.index.record_count}</td>
            </tr>

            <tr>
              <th>Rank (Index)</th>
              <td>{work.index.rank}</td>
            </tr>
          </tbody>
        </Table>

        <h3>Titles</h3>
        <Table>
          <tbody>
            {work.title_mappings.map(mapping =>
              <tr key={mapping.id}>
                <td>{mapping.title}</td>
                <td>{mapping.record_count} records</td>
                {mapping.title === work.title
                  ? <td><b>Primary Title</b></td>
                  : <td>
                    <button onClick={() => this._setPrimaryTitleMapping(mapping.id)}>Set as primary title</button>
                    <button onClick={() => this._deleteTitleMapping(mapping.id)}>Remove</button>
                  </td>}
              </tr>
            )}
          </tbody>
        </Table>

        <Form inline onSubmit={this._submitAddMapping}>
          <FormGroup>
            <FormControl ref="titleToAdd" />
          </FormGroup>
          <Button type="submit">Add title</Button>
        </Form>
      </div>
    );
  }

  _submitAddMapping = (event) => {
    event.preventDefault();
    API.addTitleMapping(this.state.work.id, {
      title: findDOMNode(this.refs.titleToAdd).value
    }).then(this._load);
  };

  _setPrimaryTitleMapping = (id) => {
    API.editWork(this.state.work.id, {
      primaryTitleMappingId: id
    }).then(this._load);
  };

  _deleteTitleMapping = (id) => {
    API.deleteTitleMapping(id).then(this._load);
  };
}

export default WorkDetail;
