import React from 'react';
import {createApp} from 'nuri';
import Periods from './Periods';
import * as layouts from './layouts';
import LoginDialog from './ui/LoginDialog';
import IndexRoute from './routes/Index';
import SignupRoute from './routes/Signup';
import ChartRoute from './routes/Chart';
import PostRoute from './routes/Post';
import WorkRoute from './routes/Work';
import TableRoute from './routes/Table';
import SettingsRoute from './routes/Settings';
import UserRoute from './routes/User';
import UserHistoryRoute from './routes/UserHistory';
import RecordRoute from './routes/Record';
import AddRecordRoute from './routes/AddRecord';
import ManageCategoryRoute from './routes/ManageCategory';

var app = createApp();

app.title = (routeTitle) => {
    return routeTitle + (routeTitle ? ' - ' : '') + '애니메타';
};

app.route('/', IndexRoute);
app.route('/login/', {
    component: layouts.App(() => <LoginDialog next="/" />),
    renderTitle: () => '로그인',
});
app.route('/signup/', SignupRoute);
app.route('/charts/:type/:range/', ChartRoute);
app.route('/-:id', PostRoute);
app.route('/works/:title+/ep/:episode/', WorkRoute);
app.route('/works/:title+/', WorkRoute);
app.route('/table/', {
    load: ({ redirect }) => redirect(`/table/${Periods.current}/`)
});
app.route('/table/:period/', TableRoute);
app.route('/settings/', SettingsRoute);
app.route('/users/:username/', UserRoute);
app.route('/users/:username/history/', UserHistoryRoute);
app.route('/records/add/', AddRecordRoute);
app.route('/records/add/:title+/', AddRecordRoute);
app.route('/records/category/', ManageCategoryRoute);
app.route('/records/:recordId/', RecordRoute);

export default app;
