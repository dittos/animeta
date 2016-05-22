import React from 'react';
import {createApp} from './Isomorphic';
import GlobalHeader from './ui/GlobalHeader';
import LoginDialog from './ui/LoginDialog';
import Periods from './Periods';
import IndexRoute from './routes/Index';
import SignupRoute from './routes/Signup';
import ChartRoute from './routes/Chart';
import PostRoute from './routes/Post';
import WorkRoute from './routes/Work';
import TableRoute from './routes/Table';
import UserRoute from './routes/User';

function Layout(Component) {
    const Wrapped = (props) => <div>
        <GlobalHeader
            currentUser={props.currentUser}
            useRouterLink={true}
        />
        <Component {...props} />
    </div>;
    Wrapped.fetchData = Component.fetchData;
    return Wrapped;
}

var app = createApp();
app.route('/', Layout(IndexRoute));
app.route('/login/', Layout(() => <LoginDialog next="/" />), () => ({pageTitle: '로그인'}));
app.route('/signup/', Layout(SignupRoute), () => ({pageTitle: '회원 가입'}));
app.route('/charts/:type/:range/', Layout(ChartRoute));
app.route('/-:id', Layout(PostRoute));
app.route('/works/:title+/ep/:episode/', Layout(WorkRoute));
app.route('/works/:title+/', Layout(WorkRoute));
app.route('/table/', null, () => ({redirect: `/table/${Periods.current}/`}));
app.route('/table/:period/', Layout(TableRoute));
app.route('/users2/:username/', Layout(UserRoute));

export default app;
