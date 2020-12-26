import React from 'react';
import { Button, Nav, NavItem } from 'react-bootstrap';

const ImageSources = {
  ANN: 'ann',
  URL: 'url',
};

function ImageUploadForm(props) {
  return <ImageUploadFormInternal key={props.work.id} {...props} />;
}

class ImageUploadFormInternal extends React.Component {
  constructor(props) {
    super(props);
    this.state = this._buildState(props);
  }

  _buildState({ work }) {
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

  _setSource = source => {
    let options = {};
    switch (source) {
      case ImageSources.ANN:
        options.annId = '';
        break;
      case ImageSources.URL:
        options.url = '';
        break;
      default:
        break;
    }
    this.setState({ source, options });
  };
}

export default ImageUploadForm;
