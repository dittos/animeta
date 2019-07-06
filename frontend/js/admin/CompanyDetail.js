import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Form, FormGroup, FormControl, Button } from 'react-bootstrap';
import * as API from './API';

class CompanyDetail extends React.Component {
  state = {
    company: null,
    editName: '',
  };

  componentDidMount() {
    this._reload();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this._reload();
    }
  }

  _reload = () => {
    return API.getCompany(this.props.match.params.id)
      .then(company => this.setState({ company, editName: company.name }));
  };

  render() {
    const company = this.state.company;

    if (!company) return <div />;

    return (
      <div>
        <h2>{company.name}</h2>

        <Table>
          <thead>
            <tr>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{company.id}</td>
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
            value={company.metadata && JSON.stringify(company.metadata, null, 2)}
          />
        </FormGroup>

        <hr />

        <h3>Works ({company.works.length})</h3>
        <Table>
          <tbody>
          {company.works.map(it => (
            <tr>
              <td><Link to={`/works/${it.id}`}>{it.title}</Link></td>
            </tr>
          ))}
          </tbody>
        </Table>
      </div>
    );
  }

  _submitName = event => {
    event.preventDefault();
    API.editCompany(this.state.company.id, {
      name: this.state.editName,
    }).then(this._reload);
  };
}

export default CompanyDetail;
