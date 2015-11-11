import React from 'react';

var _client;
var _progressListener;

export function injectClient(client) {
    _client = client;
}

export function injectProgressListener(listener) {
    _progressListener = listener;
}

export function isContainer(Component) {
    return Component._isContainer;
}

export function createContainer(Component, options) {
    const { fetchData, getPreloadKey, getTitle } = options;
    class Container extends React.Component {
        constructor(initialProps, b, c) {
            super(initialProps, b, c);
            this._fetchID = 0;
            const id = getPreloadKey(initialProps);
            if (initialProps.preloadData[id]) {
                this.state = {
                    data: initialProps.preloadData[id],
                    hasPreloadData: true,
                    isLoading: false,
                };
            } else {
                this.state = {
                    isLoading: true,
                };
            }
        }

        componentDidMount() {
            if (this.state.hasPreloadData) {
                this._updateTitle();
            } else {
                this._load(this.props);
            }
        }

        componentWillReceiveProps(props) {
            this._load(props);
        }

        componentWillUnmount() {
            if (_progressListener) {
                _progressListener.cancelFetch(this._fetchID);
            }
        }

        _load(props) {
            this.setState({isLoading: true});
            const prevFetchID = this._fetchID;
            const fetchID = ++this._fetchID;
            if (_progressListener) {
                _progressListener.cancelFetch(prevFetchID);
                _progressListener.startFetch(fetchID);
            }
            fetchData(_client, props).then(data => {
                if (fetchID === this._fetchID) {
                    this.setState({
                        data,
                        hasPreloadData: false,
                        isLoading: false,
                    }, () => this._updateTitle());
                }
                if (_progressListener) {
                    _progressListener.endFetch(fetchID);
                }
            }, () => {
                if (_progressListener) {
                    _progressListener.endFetch(fetchID);
                }
            });
        }

        _updateTitle() {
            if (getTitle) {
                // TODO: suffix
                document.title = getTitle(this.props, this.state.data) + ' - 애니메타';
            }
        }

        render() {
            if (this.state.isLoading) {
                return null;
            }

            return <Component {...this.props} {...this.state.data} />;
        }
    }
    Container._options = options;
    Container._isContainer = true;
    return Container;
}
