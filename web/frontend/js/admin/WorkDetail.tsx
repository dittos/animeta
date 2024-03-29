import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Table, Form, FormGroup, FormControl, Button, Navbar, Container, NavLink } from 'react-bootstrap';
import { API } from './ApiClient';
import WorkMergeForm from './WorkMergeForm';
import ImageUploadForm from './ImageUploadForm';
import ImageCropper from './ImageCropper';
import WorkMetadataEditor from './WorkMetadataEditor';
import { AdminWorkDto, WorkMetadata } from '../../../shared/client';
import * as EditingSessionState from './EditingSessionState';

type RouteParams = {
  id: string;
}
type State = {
  work: AdminWorkDto | null;
  editRawMetadata: boolean;
  isSavingMetadata: boolean;
  showMetadataSaved: boolean;
}

class WorkDetail extends React.Component<RouteComponentProps<RouteParams>, State> {
  state: State = {
    work: null,
    editRawMetadata: false,
    isSavingMetadata: false,
    showMetadataSaved: false,
  };
  titleToAddInput = React.createRef<HTMLInputElement>();

  componentDidMount() {
    this._reload();
  }

  componentDidUpdate(prevProps: RouteComponentProps<RouteParams>) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this._reload();
    }
  }

  _reload = () => {
    return API.call('/api/admin/v1/WorkDetail/', {id: this.props.match.params.id})
      .then(work => this.setState({ work }));
  };

  render() {
    const work = this.state.work;

    if (!work) return <div />;

    return (
      <div>
        <h2>{work.title}</h2>

        <div>
          <Button variant="danger" onClick={this._blacklist}>
            Blacklist
          </Button>
        </div>

        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Record Count (Index)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{work.id}</td>
              {work.index && <td>{work.index.record_count}</td>}
            </tr>
          </tbody>
        </Table>

        <h3>Titles</h3>
        <Table>
          <tbody>
            {work.title_mappings.map(mapping => (
              <tr key={'M' + mapping.id}>
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
            <FormControl ref={this.titleToAddInput} />
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
            key={'WorkMetadataEditor' + work.id}
            onChange={this._onMetadataChange}
            onAnnImport={this._onAnnImport}
            title={work.title || ''}
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
          <Button variant="link" size="sm" onClick={this._toggleEditRawMetadata}>
            {this.state.editRawMetadata ? 'Apply raw metadata' : 'Edit raw metadata'}
          </Button>
        </FormGroup>

        <hr />

        <h3>Image</h3>
        <ImageUploadForm
          key={'ImageUploadForm' + work.id}
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

        <h3>Staffs</h3>
        <Table>
          <tbody>
          {work.staffs.map(it => (
            <tr>
              <th className="col-xs-2">{it.task}</th>
              <td><Link to={`/people/${it.personId}`}>{it.name}</Link></td>
            </tr>
          ))}
          </tbody>
        </Table>

        <h3>Casts</h3>
        <Table>
          <tbody>
          {work.casts.map(it => (
            <tr>
              <th className="col-xs-2">{it.role}</th>
              <td><Link to={`/people/${it.personId}`}>{it.name}</Link></td>
            </tr>
          ))}
          </tbody>
        </Table>

        {/* space for bottom navbar */}
        <div style={{height: '50px'}} />

        <Navbar fixed="bottom" style={{ padding: '10px 0' }} bg="light">
          <Container>
            <Form inline>
              <Button variant="primary" onClick={this._saveMetadata} disabled={this.state.isSavingMetadata}>Save</Button>
              {this.state.showMetadataSaved ? ' Saved!' : null}
            </Form>
            <NavLink href="#top" onClick={this._backToTop}>&uarr; Back to top</NavLink>
          </Container>
        </Navbar>
      </div>
    );
  }

  _onMetadataChange = (newMetadata: WorkMetadata) => {
    const work = this.state.work!;
    newMetadata.version = 2;
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
        metadata = JSON.parse(this.state.work!.raw_metadata);
      } catch (e) {
        alert('Raw metadata is not valid JSON: ' + e);
        return;
      }
      this.setState({
        work: {
          ...this.state.work!,
          metadata
        }
      });
    }
    this.setState({ editRawMetadata: !this.state.editRawMetadata });
  };

  _setPrimaryTitleMapping = (id: string) => {
    API.call('/api/admin/v1/WorkDetail/setPrimaryTitle', {
      workId: this.state.work!.id,
      primaryTitleMappingId: id,
    }).then(this._reload);
  };

  _deleteTitleMapping = (titleMappingId: string) => {
    API.call('/api/admin/v1/WorkDetail/deleteTitleMapping', {
      workId: this.state.work!.id,
      titleMappingId
    }).then(this._reload);
  };

  _submitAddMapping = (event: React.FormEvent) => {
    event.preventDefault();
    API.call('/api/admin/v1/WorkDetail/addTitleMapping', {
      workId: this.state.work!.id,
      title: this.titleToAddInput.current!.value,
    }).then(this._reload);
  };

  _saveMetadata = () => {
    this.setState({ isSavingMetadata: true });

    const periods = this.state.work!.metadata?.periods
    if (periods) {
      const period = periods[periods.length - 1];
      if (period) {
        EditingSessionState.setPeriod(period);
      }
    }

    API.call('/api/admin/v1/WorkDetail/editMetadata', {
      workId: this.state.work!.id,
      rawMetadata: this.state.work!.raw_metadata,
    }).then(() => {
      this._reload();
      this.setState({ isSavingMetadata: false, showMetadataSaved: true });
      setTimeout(() => this.setState({ showMetadataSaved: false }), 3000);
    }, e => {
      alert(e.message);
    });
  };

  _onAnnImport = (annId: string) => {
    API.call('/api/admin/v1/WorkDetail/editMetadata', {
      workId: this.state.work!.id,
      rawMetadata: this.state.work!.raw_metadata,
    }).then(() => API.call('/api/admin/v1/WorkDetail/importAnnMetadata', {
      workId: this.state.work!.id,
      annId,
    })).then(this._reload, e => {
      alert(e.message);
    });
  };

  _uploadImage = (source: 'ann' | 'url', options: any) => {
    API.call('/api/admin/v1/WorkDetail/crawlImage', {
      workId: this.state.work!.id,
      options: {
        source,
        ...options,
      },
    }).then(this._reload, e => {
      alert(e.message);
    });
  };

  _saveImageCenter = (y: number) => {
    API.call('/api/admin/v1/WorkDetail/update', {
      workId: this.state.work!.id,
      imageCenterY: y,
    }).then(this._reload, e => {
      alert(e.message);
    });
  };

  _blacklist = () => {
    API.call('/api/admin/v1/WorkDetail/update', {
      workId: this.state.work!.id,
      blacklisted: true,
    }).then(() => {
      this.props.history.push('/works');
    }, e => {
      alert(e.message);
    });
  };

  _backToTop = (event: React.MouseEvent) => {
    event.preventDefault();
    window.scrollTo(0, 0);
  };
}

export default WorkDetail;
