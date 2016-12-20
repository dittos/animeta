import React from 'react';
import {
  Button,
  Nav,
  NavItem,
} from 'react-bootstrap';

const ImageSources = {
  ANN: 'ann',
  URL: 'url',
};

class ImageUploadForm extends React.Component {
  constructor(props) {
    super(props);
    const metadata = this.props.work.metadata;
    this.state = {
      source: ImageSources.ANN,
      options: {
        annId: metadata && metadata.ann_id,
      }
    };
  }

  render() {
    const {source, options} = this.state;
    return (
      <div>
        <Nav bsStyle="tabs"
          activeKey={source}
          onSelect={this._setSource}>
          <NavItem eventKey={ImageSources.ANN}>ANN</NavItem>
          <NavItem eventKey={ImageSources.URL}>URL</NavItem>
        </Nav>
        {source === ImageSources.ANN && (
          <span>
            Download from ANN ID:
            <input
              value={options.annId}
              onChange={e => this.setState({ options: {
                annId: e.target.value
              } })}
            />
          </span>
        )}
        {source === ImageSources.URL && (
          <span>
            Download from URL:
            <input
              value={options.url}
              onChange={e => this.setState({ options: {
                url: e.target.value
              } })}
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
