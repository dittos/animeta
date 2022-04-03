import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Table, Form, FormGroup, FormControl, Button } from 'react-bootstrap';
import { API } from './ApiClient';
import { PersonDto } from '../../../shared/client';

type RouteParams = {
  id: string;
}
type State = {
  person: PersonDto | null;
  editName: string;
}

class PersonDetail extends React.Component<RouteComponentProps<RouteParams>, State> {
  state: State = {
    person: null,
    editName: '',
  };

  componentDidMount() {
    this._reload();
  }

  componentDidUpdate(prevProps: RouteComponentProps<RouteParams>) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this._reload();
    }
  }

  _reload = () => {
    return API.call('/api/admin/v1/PersonDetail/', {id: this.props.match.params.id})
      .then(person => this.setState({ person, editName: person.name }));
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
        
        <Form inline onSubmit={this._submitName}>
          <FormGroup>
            <FormControl
              value={this.state.editName}
              onChange={(e) => this.setState({ editName: e.target.value })}
            />
          </FormGroup>
          <Button type="submit">Rename</Button>
        </Form>

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
          {person.staffs!.map(it => (
            <tr>
              <th className="col-xs-2">{it.roleOrTask}</th>
              <td><Link to={`/works/${it.workId}`}>{it.workTitle}</Link></td>
            </tr>
          ))}
          {person.casts!.map(it => (
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

  _submitName = (event: React.FormEvent) => {
    event.preventDefault();
    API.call('/api/admin/v1/PersonDetail/rename', {
      id: this.state.person!.id,
      name: this.state.editName,
    }).then(this._reload);
  };
}

export default PersonDetail;
