import React from 'react';
import {Route, IndexRoute, IndexRedirect} from 'react-router';
import LoginDialog from './ui/LoginDialog';

export default (
    <Route component={require('./routes/App')} path="/">
        <IndexRoute component={require('./routes/Index')} />
        <Route component={() => <LoginDialog next="/" />} path="/login/" />
        <Route component={require('./routes/Signup')} path="/signup/" />
        <Route component={require('./routes/Chart')} path="/charts/:type/:range/" />
        <Route component={require('./routes/Post')} path="/-:id" />
        <Route component={require('./routes/Work')}>
            <Route component={require('./routes/WorkPosts')} path="/works/**/ep/:episode/" />
            <Route component={require('./routes/WorkPosts')} path="/works/**/" />
        </Route>
        <Route path="/table/">
            <IndexRedirect to="2015Q4/" />
            <Route component={require('./routes/TablePeriod')} path=":period/" />
        </Route>
    </Route>
);
