import { faCheck, faLink, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Modal } from 'react-overlays';
import { formatPeriod } from '../util';
import ModalStyles from './Modal.less';
import { Switch, SwitchItem } from './Switch';
import Styles from './TableShareDialog.less';

interface Props {
  period: {
    period: string;
    year: number;
    month: number;
  };
  username?: string;
  showAdded: boolean;
  onClose: () => any;
}

type ShareContent = 'all' | 'added';

type State = {
  shareContent: ShareContent;
  showCopied: boolean;
};

export function TableShareDialog(props: Props) {
  const key = props.showAdded.toString();
  return <TableShareDialogInternal key={key} {...props} />;
}

class TableShareDialogInternal extends React.Component<Props, State> {
  private isClipboardAvailable = Boolean(navigator?.clipboard?.writeText)

  state: State = {
    shareContent: this.props.showAdded ? 'added' : 'all',
    showCopied: false,
  };

  render() {
    return (
      <Modal
        show={true}
        className={ModalStyles.container}
        renderBackdrop={(props: any) => <div className={ModalStyles.backdrop} {...props} />}
        onHide={this.props.onClose}
      >
        <div className={ModalStyles.mobileBottomSheet}>
          <div className={ModalStyles.header}>
            <button
              className={ModalStyles.closeButton}
              onClick={this.props.onClose}
            >
              <FontAwesomeIcon icon={faTimesCircle} size="lg" />
            </button>
            <h2 className={ModalStyles.title}>{formatPeriod(this.props.period)} 신작 공유</h2>
          </div>
          {this.props.showAdded && (
            <div className={Styles.contentSelector}>
              <Switch value={this.state.shareContent} onChange={value => this.setState({ shareContent: value })} flex>
                <SwitchItem value="all">전체 작품 리스트</SwitchItem>
                <SwitchItem value="added">추가한 작품 리스트</SwitchItem>
              </Switch>
            </div>
          )}
          <input type="text" className={Styles.urlInput} readOnly value={this.getShareUrl()} />

          <div className={Styles.shareButtonContainer}>
            {this.isClipboardAvailable && (
              <a href="#" onClick={this.copy} className={Styles.copyButton}>
                {this.state.showCopied ? <><FontAwesomeIcon icon={faCheck} />복사 완료!</> : <><FontAwesomeIcon icon={faLink} />링크 복사</>}
              </a>
            )}

            <a href={`https://twitter.com/intent/tweet?url=${this.getShareUrl()}`} target="_blank" className={Styles.tweetButton}>
              <svg style={{ height: '1em', verticalAlign: '-0.125em' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/></svg>
              트윗
            </a>
          </div>
        </div>
      </Modal>
    );
  }

  private getShareUrl() {
    if (this.state.shareContent === 'all') {
      return `https://animeta.net/table/${this.props.period.period}/`;
    } else if (this.state.shareContent === 'added') {
      return `https://animeta.net/users/${this.props.username}/table/${this.props.period.period}/`;
    }
    throw new Error('unreachable');
  }

  private copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText(this.getShareUrl());
    this.setState({ showCopied: true });
    setTimeout(() => this.setState({ showCopied: false }), 1000);
  };
}
