import React from 'react';
import {Route, IndexRoute, IndexRedirect} from 'react-router';
import LoginDialog from './ui/LoginDialog';
import Periods from './Periods';
import AppRoute from './routes/App';
import AppIndexRoute from './routes/Index';
import SignupRoute from './routes/Signup';
import ChartRoute from './routes/Chart';
import PostRoute from './routes/Post';
import WorkRoute from './routes/Work';
import WorkPostsRoute from './routes/WorkPosts';
import TablePeriodRoute from './routes/TablePeriod';

export default (
    <Route component={AppRoute} path="/">
        <IndexRoute component={AppIndexRoute} />
        <Route component={() => <LoginDialog next="/" />} path="/login/" />
        <Route component={SignupRoute} path="/signup/" />
        <Route component={ChartRoute} path="/charts/:type/:range/" />
        <Route component={PostRoute} path="/-:id" />
        <Route component={WorkRoute}>
            <Route component={WorkPostsRoute} path="/works/**/ep/:episode/" />
            <Route component={WorkPostsRoute} path="/works/**/" />
        </Route>
        <Route path="/table/">
            <IndexRedirect to={Periods.current + '/'} />
            <Route component={TablePeriodRoute} path=":period/" />
        </Route>
    </Route>
);
