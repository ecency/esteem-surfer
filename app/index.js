import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { setCacheSize } from '@esteemapp/esteem-render-helpers/src';

import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';

import './style/app.style.scss';

// set render helpers cache size
setCacheSize(200);

require('./context-menu');
require('./spell-checker');

// Themes
window.dayTheme = require('./style/antd/day.tcss');
window.nightTheme = require('./style/antd/night.tcss');

// Prevent dropped file from opening in window
document.addEventListener(
  'dragover',
  event => {
    event.preventDefault();
    return false;
  },
  false
);

document.addEventListener(
  'drop',
  event => {
    event.preventDefault();
    return false;
  },
  false
);

const store = configureStore({});

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
