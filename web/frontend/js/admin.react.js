import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import App from './admin/App';
import WorkList from './admin/WorkList';
import WorkDetail from './admin/WorkDetail';
import PersonList from './admin/PersonList';
import PersonDetail from './admin/PersonDetail';
import PersonListTransliterationCheck from './admin/PersonListTransliterationCheck';
import CompanyList from './admin/CompanyList';
import CompanyDetail from './admin/CompanyDetail';
import 'bootstrap/dist/css/bootstrap.css';

ReactDOM.render(
  <HashRouter>
    <App>
      <Switch>
        <Route exact path="/works/:id" component={WorkDetail} />
        <Route exact path="/works" component={WorkList} />
        <Route exact path="/people/:id" component={PersonDetail} />
        <Route exact path="/people" component={PersonList} />
        <Route exact path="/people/transliterationCheck/:period" component={PersonListTransliterationCheck} />
        <Route exact path="/companies/:id" component={CompanyDetail} />
        <Route exact path="/companies" component={CompanyList} />
        <Redirect exact from="/" to="/works" />
      </Switch>
    </App>
  </HashRouter>,
  document.getElementById('app')
);
