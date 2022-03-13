import React from 'react';
import { FormGroup, Button, Modal } from 'react-bootstrap';
import AsyncSelect from 'react-select/lib/Async';
import * as API from './API';

class CompanyMergeForm extends React.Component {
  state = {
    companyToMerge: null,
    forceMerge: false,
  };

  render() {
    return (
      <div>
        <FormGroup>
          <AsyncSelect
            loadOptions={(q) => API.getCompanies()
              .then((data) => data.filter((it) => it.name.toLowerCase().indexOf(q.toLowerCase()) == 0)
                .map((it) => ({ label: it.name, value: it })))}
            defaultOptions
            cacheOptions
            filterOption={null}
            value={null}
            onChange={this._onCompanyToMergeSelected}
          />
        </FormGroup>

        {this.state.companyToMerge && (
          <Modal show={true}>
            <Modal.Header>
              <Modal.Title>Merge</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Do you want to merge{' '}
                <strong>{this.state.companyToMerge.name}</strong> into{' '}
                <strong>{this.props.company.name}</strong>?
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="danger"
                onClick={this._merge}
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

  _onCompanyToMergeSelected = ({ value }) => {
    this.setState({ companyToMerge: value });
  };

  _merge = () => {
    API.mergeCompany(this.props.company.id, this.state.companyToMerge.id).then(
      () => {
        this.setState({
          companyToMerge: null,
        });
        this.props.onMerge();
      }
    );
  };

  _cancelMerge = () => {
    this.setState({ companyToMerge: null });
  };
}

export default CompanyMergeForm;
