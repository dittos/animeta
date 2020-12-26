import React from 'react';
import { Modal } from 'react-overlays';
import { formatPeriod } from '../util';
import ModalStyles from './Modal.less';
import { Switch, SwitchItem } from './Switch';
import Styles from './TableShareDialog.less';

interface Props {
  period: string;
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
  private isClipboardAvailable = navigator && (navigator as any).clipboard && (navigator as any).clipboard.writeText

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
              <i className="fa fa-lg fa-times-circle" />
            </button>
            <h2 className={ModalStyles.title}>{formatPeriod(this.props.period)} 신작 공유</h2>
          </div>
          {this.props.showAdded && (
            <div className={Styles.contentSelector}>
              <Switch value={this.state.shareContent} onChange={(value: ShareContent) => this.setState({ shareContent: value })} flex>
                <SwitchItem value="all">전체 작품 리스트</SwitchItem>
                <SwitchItem value="added">추가한 작품 리스트</SwitchItem>
              </Switch>
            </div>
          )}
          <input type="text" className={Styles.urlInput} readOnly value={this.getShareUrl()} />

          <div className={Styles.shareButtonContainer}>
            {this.isClipboardAvailable && (
              <a href="#" onClick={this.copy} className={Styles.copyButton}>
                {this.state.showCopied ? <><i className="fa fa-check" />복사 완료!</> : <><i className="fa fa-link" />링크 복사</>}
              </a>
            )}

            <a href={`https://twitter.com/intent/tweet?url=${this.getShareUrl()}`} target="_blank" className={Styles.tweetButton}>
              <i className="fa fa-twitter" />
              트윗
            </a>
          </div>
        </div>
      </Modal>
    );
  }

  private getShareUrl() {
    if (this.state.shareContent === 'all') {
      return `https://animeta.net/table/${this.props.period}/`;
    } else if (this.state.shareContent === 'added') {
      return `https://animeta.net/users/${this.props.username}/table/${this.props.period}/`;
    }
  }

  private copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    await (navigator as any).clipboard.writeText(this.getShareUrl());
    this.setState({ showCopied: true });
    setTimeout(() => this.setState({ showCopied: false }), 1000);
  };
}
