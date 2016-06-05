import React from 'react';
import {createApp} from './Isomorphic';
import LoginDialog from './ui/LoginDialog';
import Periods from './Periods';
import IndexRoute from './routes/Index';
import SignupRoute from './routes/Signup';
import ChartRoute from './routes/Chart';
import PostRoute from './routes/Post';
import WorkRoute from './routes/Work';
import TableRoute from './routes/Table';
import SettingsRoute from './routes/Settings';
import * as layouts from './layouts';

var app = createApp();
app.route('/', IndexRoute);
app.route('/login/', layouts.App(() => <LoginDialog next="/" />), () => ({pageTitle: '로그인'}));
app.route('/signup/', layouts.App(SignupRoute), () => ({pageTitle: '회원 가입'}));
app.route('/charts/:type/:range/', layouts.App(ChartRoute));
app.route('/-:id', PostRoute);
app.route('/works/:title+/ep/:episode/', layouts.App(WorkRoute));
app.route('/works/:title+/', layouts.App(WorkRoute));
app.route('/table/', null, () => ({redirect: `/table/${Periods.current}/`}));
app.route('/table/:period/', layouts.App(TableRoute));
app.route('/settings/', layouts.App(SettingsRoute));

export default app;
