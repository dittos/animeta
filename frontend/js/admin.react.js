import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Redirect, Route } from 'react-router-dom';
import App from './admin/App';
import WorkList from './admin/WorkList';
import WorkDetail from './admin/WorkDetail';
import PersonList from './admin/PersonList';
import PersonDetail from './admin/PersonDetail';
import 'bootstrap/dist/css/bootstrap.css';

ReactDOM.render(
  <HashRouter>
    <App>
      <Redirect exact from="/" to="/works" />
      <Route exact path="/works" component={WorkList} />
      <Route exact path="/works/:id" component={WorkDetail} />
      <Route exact path="/people" component={PersonList} />
      <Route exact path="/people/:id" component={PersonDetail} />
    </App>
  </HashRouter>,
  document.getElementById('app')
);
