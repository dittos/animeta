import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Redirect, hashHistory } from 'react-router';
import App from './admin/App';
import WorkList from './admin/WorkList';
import WorkDetail from './admin/WorkDetail';
import PersonList from './admin/PersonList';
import PersonDetail from './admin/PersonDetail';
import 'bootstrap/dist/css/bootstrap.css';

ReactDOM.render(
  <Router history={hashHistory}>
    <Route component={App}>
      <Redirect from="/" to="/works" />
      <Route path="/works" component={WorkList} />
      <Route path="/works/:id" component={WorkDetail} />
      <Route path="/people" component={PersonList} />
      <Route path="/people/:id" component={PersonDetail} />
    </Route>
  </Router>,
  document.getElementById('app')
);
