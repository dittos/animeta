import React from 'react';
import { withRouter, Link } from 'react-router';
import { Table, FormGroup } from 'react-bootstrap';
import * as API from './API';

class PersonDetail extends React.Component {
  state = {
    person: null,
  };

  componentDidMount() {
    this._reload();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.id !== this.props.params.id) {
      this._reload();
    }
  }

  _reload = () => {
    return API.getPerson(this.props.params.id).then(person => this.setState({ person }));
  };

  render() {
    const person = this.state.person;

    if (!person) return <div />;

    return (
      <div>
        <h2>{person.name}</h2>

        <Table>
          <thead>
            <tr>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{person.id}</td>
            </tr>
          </tbody>
        </Table>

        <h3>Metadata</h3>
        <FormGroup>
          <textarea
            rows={5}
            cols={50}
            readOnly={true}
            value={person.metadata && JSON.stringify(person.metadata, null, 2)}
          />
        </FormGroup>

        <hr />

        <h3>Works</h3>
        <Table>
          <tbody>
          {person.staffs.map(it => (
            <tr>
              <th className="col-xs-2">{it.roleOrTask}</th>
              <td><Link to={`/works/${it.workId}`}>{it.workTitle}</Link></td>
            </tr>
          ))}
          {person.casts.map(it => (
            <tr>
              <th className="col-xs-2">{it.roleOrTask}</th>
              <td><Link to={`/works/${it.workId}`}>{it.workTitle}</Link></td>
            </tr>
          ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default withRouter(PersonDetail);
