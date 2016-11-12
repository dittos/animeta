import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import App from './App';
import Dashboard from './Dashboard';
import WorkDetail from './WorkDetail';
import 'bootstrap/dist/css/bootstrap.css';

ReactDOM.render(
  <Router history={hashHistory}>
    <Route component={App}>
      <Route path="/" component={Dashboard} />
      <Route path="/works/:id" component={WorkDetail} />
    </Route>
  </Router>,
  document.getElementById('root')
);
