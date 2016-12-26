import React from 'react';
import Styles from './SpecialWorkStatus.less';

class SpecialWorkStatus extends React.Component {
    render() {
        return (
            <div>
                <div className={Styles.interestedButton}
                    onClick={this.props.onInterestedClick}>
                    <i className="fa fa-star" />
                    관심 작품 등록
                </div>
                {/*
                    <div className={Styles.buttonSeparator} />
                    <div className={Styles.watchedButton}
                        onClick={this.props.onWatchedClick}>
                        <i className="fa fa-check" />
                        이미 봤습니다
                    </div>
                */}
            </div>
        );
    }
}

export default SpecialWorkStatus;
