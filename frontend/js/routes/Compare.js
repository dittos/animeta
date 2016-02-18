import React from 'react';
import $ from 'jquery';
import {sortBy} from 'lodash';
import Layout from '../ui/Layout';

class InputForm extends React.Component {
    render() {
        return <form onSubmit={this._onSubmit.bind(this)}>
            비교할 아이디를 입력하세요.
            <input ref="user1" defaultValue={this.props.user1} />
            {' vs '}
            <input ref="user2" defaultValue={this.props.user2} />
            <button type="submit">Go!</button>
        </form>;
    }

    _onSubmit(event) {
        event.preventDefault();
        const user1 = this.refs.user1.value;
        const user2 = this.refs.user2.value;
        this.props.onSubmit(user1, user2);
    }
}

function getFirstTitle([a, b]) {
    if (a)
        return a.title;
    else
        return b.title;
}

function compare(a, b) {
    const aOnly = [];
    const bOnly = [];
    const commonButStatus = [];
    const common = [];

    const aWorks = {};
    const bWorks = {};
    a.forEach(aRecord => {
        aWorks[aRecord.work_id] = aRecord;
    });
    b.forEach(bRecord => {
        bWorks[bRecord.work_id] = bRecord;
        const aRecord = aWorks[bRecord.work_id];
        if (aRecord) {
            if (aRecord.status_type === bRecord.status_type)
                common.push([aRecord, bRecord]);
            else
                commonButStatus.push([aRecord, bRecord]);
        } else {
            bOnly.push([null, bRecord]);
        }
    });
    a.forEach(aRecord => {
        if (!bWorks[aRecord.work_id]) {
            aOnly.push([aRecord, null]);
        }
    });

    return sortBy(aOnly, getFirstTitle)
        .concat(sortBy(bOnly, getFirstTitle))
        .concat(sortBy(commonButStatus, getFirstTitle))
        .concat(sortBy(common, getFirstTitle));
}

export default class CompareRoute extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            status: 'loading'
        };
        this._load(props);
    }

    componentWillReceiveProps(nextProps) {
        const {user1, user2} = this.props.location.query;
        const {user1: nextUser1, user2: nextUser2} = nextProps.location.query;
        if (user1 !== nextUser1 || user2 !== nextUser2) {
            this._load(nextProps);
        }
    }

    render() {
        const {user1, user2} = this.props.location.query || {};
        return <Layout.CenteredFullWidth>
            <InputForm
                user1={user1}
                user2={user2}
                onSubmit={this._onSubmit.bind(this)}
            />
            {user1 && user2 && this._renderResult(user1, user2)}
        </Layout.CenteredFullWidth>;
    }

    _renderResult(user1, user2) {
        if (this.state.status === 'loading')
            return <span>Loading...</span>;

        if (this.state.status === 'failed')
            return <span>Failed</span>;

        return <table>
            <thead>
                <tr>
                    <th>제목</th>
                    <th>{user1}</th>
                    <th>{user2}</th>
                </tr>
            </thead>
            <tbody>
                {this.state.result.map(pair => {
                    const title = getFirstTitle(pair);
                    const [a, b] = pair;
                    return <tr key={title}>
                        <td>{title}</td>
                        <td>
                            {a && a.status_type}
                        </td>
                        <td>
                            {b && b.status_type}
                        </td>
                    </tr>;
                })}
            </tbody>
        </table>;
    }

    _onSubmit(user1, user2) {
        this.props.history.pushState(null, this.props.location.pathname, {user1, user2});
    }

    _load(props) {
        const {user1, user2} = props.location.query || {};
        if (!user1 || !user2) {
            return;
        }
        this.setState({status: 'loading'});
        $.when(
            $.get(`/api/v2/users/${user1}/records`),
            $.get(`/api/v2/users/${user2}/records`)
        ).done(([records1], [records2]) => {
            this.setState({
                status: 'success',
                result: compare(records1, records2)
            });
        }).fail(() => {
            this.setState({status: 'failed'});
        });
    }
}
