import React from 'react';
import { Button, Nav } from 'react-bootstrap';
import { AdminWorkDto } from '../../../shared/client';

const ImageSources = {
  ANN: 'ann',
  URL: 'url',
} as const;

type Props = {
  work: AdminWorkDto;
  onUpload: (source: string, options: any) => void;
}

function ImageUploadForm(props: Props) {
  const work = props.work;
  return <ImageUploadFormInternal key={`${work.id} ${work.metadata?.annId ?? ''}`} {...props} />;
}

class ImageUploadFormInternal extends React.Component<Props, {
  source: 'ann' | 'url';
  options: any;
}> {
  constructor(props: Props) {
    super(props);
    this.state = this._buildState(props);
  }

  _buildState({ work }: Pick<Props, 'work'>) {
    const metadata = work.metadata;
    return {
      source: ImageSources.ANN,
      options: {
        annId: (metadata && metadata.annId) || '',
      },
    };
  }

  render() {
    const { source, options } = this.state;
    return (
      <div>
        <Nav variant="tabs" activeKey={source} onSelect={this._setSource}>
          <Nav.Item><Nav.Link eventKey={ImageSources.ANN}>ANN</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey={ImageSources.URL}>URL</Nav.Link></Nav.Item>
        </Nav>
        {source === ImageSources.ANN && (
          <span>
            Download from ANN ID:
            <input
              value={options.annId}
              onChange={e =>
                this.setState({
                  options: {
                    annId: e.target.value,
                  },
                })
              }
            />
          </span>
        )}
        {source === ImageSources.URL && (
          <span>
            Download from URL:
            <input
              value={options.url}
              onChange={e =>
                this.setState({
                  options: {
                    url: e.target.value,
                  },
                })
              }
            />
          </span>
        )}
        <Button onClick={this._upload}>Upload</Button>
      </div>
    );
  }

  _upload = () => {
    this.props.onUpload(this.state.source, this.state.options);
  };

  _setSource = (source: 'ann' | 'url') => {
    let options: any = {};
    switch (source) {
      case 'ann':
        options.annId = '';
        break;
      case 'url':
        options.url = '';
        break;
      default:
        break;
    }
    this.setState({ source, options });
  };
}

export default ImageUploadForm;
