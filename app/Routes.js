/* eslint flowtype-errors/show-errors: 0 */

import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import IndexPage from './containers/IndexPage';
import EntryIndexPage from './containers/EntryIndexPage';
import AccountPage from './containers/AccountPage';
import ComposePage from './containers/ComposePage';

export default () => (
  <App>
    <Switch>
      <Route
        new
        path="/new"
        component={props => (
          <ComposePage timestamp={new Date().toString()} {...props} />
        )}
      />
      <Route exact path="/@:username" component={AccountPage} />
      <Route exact path="/@:username/:section" component={AccountPage} />
      <Route exact path="/:filter" component={EntryIndexPage} />
      <Route exact path="/:filter/:tag" component={EntryIndexPage} />
      <Route path="/" component={IndexPage} />
    </Switch>
  </App>
);
