import React from 'react';
import { findDOMNode } from 'react-dom';
import { withRouter } from 'react-router';
import { Table, Form, FormGroup, FormControl, Button } from 'react-bootstrap';
import * as API from './API';
import WorkMergeForm from './WorkMergeForm';
import ImageUploadForm from './ImageUploadForm';
import ImageCropper from './ImageCropper';
import WorkMetadataEditor from './WorkMetadataEditor';

class WorkDetail extends React.Component {
  state = {
    work: null,
    editRawMetadata: false,
  };

  componentDidMount() {
    this._reload();
  }

  componentWillReceiveProps(nextProps) {
    this._load(nextProps);
  }

  _reload = () => this._load(this.props);

  _load = props => {
    return API.getWork(props.params.id).then(work => this.setState({ work }));
  };

  render() {
    const work = this.state.work;

    if (!work) return <div />;

    return (
      <div>
        <h2>{work.title}</h2>

        <div>
          <Button bsStyle="danger" onClick={this._blacklist}>
            Blacklist
          </Button>
        </div>

        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Record Count (Index)</th>
              <th>Rank (Index)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{work.id}</td>
              {work.index && <td>{work.index.record_count}</td>}
              {work.index && <td>{work.index.rank}</td>}
            </tr>
          </tbody>
        </Table>

        <h3>Titles</h3>
        <Table>
          <tbody>
            {work.title_mappings.map(mapping => (
              <tr key={mapping.id}>
                <td>{mapping.title}</td>
                <td>{mapping.record_count} records</td>
                {mapping.title === work.title ? (
                  <td>
                    <b>Primary Title</b>
                  </td>
                ) : (
                  <td>
                    <button
                      onClick={() => this._setPrimaryTitleMapping(mapping.id)}
                    >
                      Set as primary title
                    </button>
                    <button
                      onClick={() => this._deleteTitleMapping(mapping.id)}
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>

        <Form inline onSubmit={this._submitAddMapping}>
          <FormGroup>
            <FormControl ref="titleToAdd" />
          </FormGroup>
          <Button type="submit">Add title</Button>
        </Form>

        <hr />

        <h3>Merge</h3>
        <WorkMergeForm work={work} onMerge={this._reload} />

        <hr />

        <h3>Metadata</h3>
        {!this.state.editRawMetadata && (
          <WorkMetadataEditor
            onChange={this._onMetadataChange}
            metadata={work.metadata || {}}
          />
        )}
        <FormGroup>
          <textarea
            rows={10}
            cols={50}
            value={work.raw_metadata || ''}
            readOnly={!this.state.editRawMetadata}
            onChange={e => {
              work.raw_metadata = e.target.value;
              this.setState({ work });
            }}
          />
          <br />
          <Button bsStyle="link" bsSize="sm" onClick={this._toggleEditRawMetadata}>
            {this.state.editRawMetadata ? 'Apply raw metadata' : 'Edit raw metadata'}
          </Button>
        </FormGroup>
        <Button onClick={this._saveMetadata}>Save</Button>

        <hr />

        <h3>Image</h3>
        <ImageUploadForm
          key={work.id}
          work={work}
          onUpload={this._uploadImage}
        />

        {work.image_path && (
          <ImageCropper
            url={work.image_path}
            position={work.image_center_y}
            onSave={this._saveImageCenter}
          />
        )}
        {work.image_path && (
          <img src={work.image_path} alt={`Poster for ${work.title}`} />
        )}
      </div>
    );
  }

  _onMetadataChange = newMetadata => {
    const work = this.state.work;
    this.setState({
      work: {
        ...work,
        raw_metadata: JSON.stringify(newMetadata, null, 2),
        metadata: newMetadata,
      }
    });
  };

  _toggleEditRawMetadata = () => {
    if (this.state.editRawMetadata) {
      let metadata;
      try {
        metadata = JSON.parse(this.state.work.raw_metadata);
      } catch (e) {
        alert('Raw metadata is not valid JSON: ' + e);
        return;
      }
      this.setState({
        work: {
          ...this.state.work,
          metadata
        }
      });
    }
    this.setState({ editRawMetadata: !this.state.editRawMetadata });
  };

  _setPrimaryTitleMapping = id => {
    API.editWork(this.state.work.id, {
      primaryTitleMappingId: id,
    }).then(this._reload);
  };

  _deleteTitleMapping = id => {
    API.deleteTitleMapping(id).then(this._reload);
  };

  _submitAddMapping = event => {
    event.preventDefault();
    API.addTitleMapping(this.state.work.id, {
      title: findDOMNode(this.refs.titleToAdd).value,
    }).then(this._reload);
  };

  _saveMetadata = () => {
    API.editWork(this.state.work.id, {
      rawMetadata: this.state.work.raw_metadata,
    }).then(this._reload, e => {
      alert(e.message);
    });
  };

  _uploadImage = (source, options) => {
    API.editWork(this.state.work.id, {
      crawlImage: {
        source,
        ...options,
      },
    }).then(this._reload, e => {
      alert(e.message);
    });
  };

  _saveImageCenter = y => {
    API.editWork(this.state.work.id, {
      imageCenterY: y,
    }).then(this._reload, e => {
      alert(e.message);
    });
  };

  _blacklist = () => {
    API.editWork(this.state.work.id, {
      blacklisted: true,
    }).then(() => {
      this.props.router.push('/');
    });
  };
}

export default withRouter(WorkDetail);
