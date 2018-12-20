/* eslint flowtype-errors/show-errors: 0 */

import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import IndexPage from './containers/IndexPage';
import EntryIndexPage from './containers/EntryIndexPage';
import AccountPage from './containers/AccountPage';
import ComposePage from './containers/ComposePage';
import EntryPage from './containers/EntryPage';
import SearchPage from './containers/SearchPage';
import WitnessesPage from './containers/WitnessesPage';
import TransferPage from './containers/TransferPage';

export default () => (
  <App>
    <Switch>
      <Route
        exact
        path="/@:username/transfer/:asset"
        component={props => (
          <TransferPage
            timestamp={new Date().toString()}
            {...props}
            mode="transfer"
          />
        )}
      />
      <Route
        exact
        path="/@:username/transfer-saving/:asset"
        component={props => (
          <TransferPage timestamp={new Date().toString()} {...props} />
        )}
      />
      <Route
        exact
        path="/@:username/power-up"
        component={props => (
          <TransferPage timestamp={new Date().toString()} {...props} />
        )}
      />
      <Route
        exact
        path="/witnesses"
        component={props => (
          <WitnessesPage timestamp={new Date().toString()} {...props} />
        )}
      />
      <Route
        exact
        path="/search"
        component={props => (
          <SearchPage timestamp={new Date().toString()} {...props} />
        )}
      />
      <Route
        exact
        path="/new"
        component={props => (
          <ComposePage timestamp={new Date().toString()} {...props} />
        )}
      />
      <Route
        exact
        path="/draft/:id"
        component={props => (
          <ComposePage timestamp={new Date().toString()} {...props} />
        )}
      />
      <Route
        exact
        path="/edit/@:username/:permlink"
        component={props => (
          <ComposePage timestamp={new Date().toString()} {...props} />
        )}
      />
      <Route exact path="/@:username/feed" component={EntryIndexPage} />
      <Route exact path="/@:username" component={AccountPage} />
      <Route exact path="/@:username/:section" component={AccountPage} />
      <Route exact path="/:filter" component={EntryIndexPage} />
      <Route exact path="/:filter/:tag" component={EntryIndexPage} />
      <Route
        exact
        path="/:category/@:username/:permlink"
        component={props => (
          <EntryPage timestamp={new Date().toString()} {...props} />
        )}
      />
      <Route path="/" component={IndexPage} />
    </Switch>
  </App>
);
