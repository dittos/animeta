import React from 'react';
import { createApp } from 'nuri';
import * as NuriApp from 'nuri/app';
import IndexRoute from './routes/Index';
import LoginRoute from './routes/Login';
import SignupRoute from './routes/Signup';
import PostRoute from './routes/Post';
import WorkRoute from './routes/Work';
import WorkEpisodeRoute from './routes/WorkEpisode';
import TableRoute from './routes/Table';
import TablePeriodRoute from './routes/TablePeriod';
import SettingsRoute from './routes/Settings';
import UserRoute from './routes/User';
import UserHistoryRoute from './routes/UserHistory';
import UserTableRoute from './routes/UserTable';
import RecordRoute from './routes/Record';
import AddRecordRoute from './routes/AddRecord';
// import NewAddRecordRoute from './routes/NewAddRecord';
import ManageCategoryRoute from './routes/ManageCategory';
import ManageRatingRoute from './routes/ManageRating';
import { Loader } from '../../shared/loader';

export type RouteHandler<D> = NuriApp.RouteHandler<D, Loader>;
export type RouteComponent<D> = NuriApp.RouteComponent<D, Loader>;
export type RouteComponentProps<D> = NuriApp.RouteComponentProps<D, Loader>;

var app = createApp<Loader>();

app.route('/', IndexRoute);
app.route('/login/', LoginRoute);
app.route('/signup/', SignupRoute);
app.route('/-:id', PostRoute);
app.route('/works/:title+/ep/:episode/', WorkEpisodeRoute);
app.route('/works/:title+/', WorkRoute);
app.route('/table/', TableRoute);
app.route('/table/:period/', TablePeriodRoute);
app.route('/settings/', SettingsRoute);
app.route('/users/:username/', UserRoute);
app.route('/users/:username/history/', UserHistoryRoute);
app.route('/users/:username/table/:period/', UserTableRoute);
// app.route('/records/add-new/', NewAddRecordRoute);
app.route('/records/add/', AddRecordRoute);
app.route('/records/add/:title+/', AddRecordRoute);
app.route('/records/category/', ManageCategoryRoute);
app.route('/records/rating/', ManageRatingRoute);
app.route('/records/:recordId/', RecordRoute);

export default app;
