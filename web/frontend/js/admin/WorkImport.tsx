import React, { useEffect } from 'react';
import { Link, RouteComponentProps, useLocation, useHistory } from 'react-router-dom';
import { FormGroup, FormControl, Button, FormLabel, Alert } from 'react-bootstrap';
import { API } from './ApiClient';
import WorkMetadataEditor from './WorkMetadataEditor';
import { WorkMetadata } from './WorkMetadata';

type InitialData = {
  title: string;
  metadata: WorkMetadata;
};

const WorkImport: React.FC<RouteComponentProps> = (props) => {
  const history = useHistory();
  const { search } = useLocation();
  const [data, setData] = React.useState<InitialData>({title: '', metadata: {}});
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<React.ReactNode | null>(null);

  useEffect(() => {
    let data: InitialData = {title: '', metadata: {}};

    if (search && search.startsWith('?')) {
      const dataJson = search.substring(1);
      if (dataJson) {
        try {
          data = JSON.parse(decodeURIComponent(dataJson));
        } catch (e) {}
      }
    }

    setData(data)
  }, [search])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      title: e.target.value,
    })
  };

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await API.call('/api/admin/v1/WorkImport/createWork', {
        title: data.title,
        metadata: {
          version: 2,
          ...data.metadata
        },
      })
      history.push(`/works/${result.id}`)
    } catch (e: any) {
      let error = e.message
      if (e.extra) {
        error = <span>{error}: <Link to={`/works/${e.extra.id}`} target='_blank'>{e.extra.title}</Link></span>
      }
      setSaveError(error)
    } finally {
      setSaving(false)
    }
  };

  return (
    <div>
      <h2>Import</h2>

      <FormGroup>
        <FormLabel>Title</FormLabel>
        <FormControl value={data.title} onChange={handleTitleChange} />
      </FormGroup>

      <WorkMetadataEditor
        title={data.title}
        metadata={data.metadata}
        onChange={(newMetadata) => setData({...data, metadata: newMetadata})}
      />

      {saveError && <Alert variant='danger'>{saveError}</Alert>}
      <Button variant="primary" onClick={handleSave} disabled={saving}>Save</Button>
    </div>
  )
};

export default WorkImport;
