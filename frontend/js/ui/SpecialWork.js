import React from 'react';
import Styles from './SpecialWork.less';

class SpecialWork extends React.Component {
    render() {
        return (
            <div className={Styles.container}>
                <h2 className="section-title">
                    <i className="fa fa-calendar" />
                    {' '}
                    국내 개봉 정보
                </h2>

                <div className={Styles.section}>
                    <div className={Styles.sectionTitle}>
                        정식 개봉일
                    </div>
                    <div className={Styles.sectionContent}>
                        2017. 1. 4. (수)
                    </div>
                </div>

                <div className={Styles.section}>
                    <div className={Styles.sectionTitle}>
                        유료 선행시사회
                    </div>
                    <div className={Styles.sectionContent}>
                        2016. 12. 31. (토) - 2017. 1. 1. (일)<br />
                        메가박스, 롯데시네마, CGV 일부 지점<br />
                        특전: 신카이 마코토 감독 친필 사인 삽입 한정판 포스터 (극장 체인별 3종)
                        <div className={Styles.source}>
                            출처: <a href="https://www.facebook.com/playmovie/photos/a.508971722511374.1073741828.506072679467945/1298893870185818/?type=3" target="_blank">플레이무비 페이스북 페이지</a>{' '}(2016-12-26 기준)
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SpecialWork;
