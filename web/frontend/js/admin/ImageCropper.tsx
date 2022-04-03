import React from 'react';
import { Button } from 'react-bootstrap';

const defaultPosition = 0;

type Props = {
  url: string;
  position: number;
  onSave: (position: number) => void;
}

function ImageCropper(props: Props) {
  return <ImageCropperInternal key={props.url} {...props} />
}

class ImageCropperInternal extends React.Component<Props, {
  position: number;
  height: number;
}> {
  _el = React.createRef<HTMLDivElement>()
  _startY: number
  _startPosition: number

  constructor(props: Props) {
    super(props);
    this.state = {
      position: props.position || defaultPosition,
      height: 180,
    };
  }

  render() {
    const percent = Math.min(1, Math.max(0, this.state.position)) * 100;
    return (
      <div>
        <div
          ref={this._el}
          style={{
            backgroundImage: `url("${this.props.url}")`,
            backgroundSize: 'cover',
            backgroundPosition: `0 ${percent}%`,
            width: '320px',
            height: `${this.state.height}px`,
            border: '1px solid #000',
            cursor: 'ns-resize',
          }}
          onMouseDown={this._beginMove}
        />
        <div>
          <button onClick={() => this.setState({ height: 160 })}>2:1</button>
          <button onClick={() => this.setState({ height: 180 })}>16:9</button>
          <button onClick={() => this.setState({ height: 240 })}>4:3</button>
          y: {percent.toString().substring(0, 4)}%
          <Button onClick={() => this.props.onSave(this.state.position)}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  getLocalY(event: MouseEvent) {
    const rect = this._el.current!.getBoundingClientRect();
    const localY = event.clientY - rect.top;
    return localY / rect.height;
  }

  _beginMove = (event: React.MouseEvent) => {
    event.preventDefault(); // prevent text selection

    this._startY = this.getLocalY(event.nativeEvent);
    this._startPosition = this.state.position;
    document.addEventListener('mouseup', this._endMove, false);
    document.addEventListener('mousemove', this._move, false);
  };

  _move = (event: MouseEvent) => {
    event.preventDefault(); // prevent text selection

    const dy = this.getLocalY(event) - this._startY;
    this.setState({ position: this._startPosition - dy });
  };

  _endMove = (event: MouseEvent) => {
    event.preventDefault(); // prevent text selection

    document.removeEventListener('mouseup', this._endMove);
    document.removeEventListener('mousemove', this._move);
  };
}

export default ImageCropper;
