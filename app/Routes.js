/* eslint flowtype-errors/show-errors: 0 */

import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import IndexPage from './containers/IndexPage';
import EntryIndexPage from './containers/EntryIndexPage';

export default () => (
  <App>
    <Switch>
      <Route exact path="/:filter" component={EntryIndexPage} />
      <Route exact path="/:filter/:tag" component={EntryIndexPage} />
      <Route path="/" component={IndexPage} />
    </Switch>
  </App>
);
