import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import App from './admin/App';
import Dashboard from './admin/Dashboard';
import WorkDetail from './admin/WorkDetail';
import 'bootstrap/dist/css/bootstrap.css';

ReactDOM.render(
    <Router history={hashHistory}>
        <Route component={App}>
            <Route path="/" component={Dashboard} />
            <Route path="/works/:id" component={WorkDetail} />
        </Route>
    </Router>,
    document.getElementById('app')
);
