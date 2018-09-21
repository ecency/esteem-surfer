/* eslint-disable */

/**
 * Components using the react-intl module require access to the intl context.
 * This is not available when mounting single components in Enzyme.
 * These helper functions aim to address that and wrap a valid,
 * English-locale intl context around them.
 */

import React from 'react';
import { IntlProvider, intlShape } from 'react-intl';
import { mount, shallow } from 'enzyme';
import { flattenMessages } from '../utils';
import messages from '../locales';

const locale = 'en-US';
const intlProvider = new IntlProvider(
  { locale: locale, messages: flattenMessages(messages[locale]) },
  {}
);
const { intl } = intlProvider.getChildContext();

/**
 * When using React-Intl `injectIntl` on components, props.intl is required.
 */
function nodeWithIntlProp(node) {
  return React.cloneElement(node, { intl });
}

export default {
  shallowWithIntl(node) {
    return shallow(nodeWithIntlProp(node), { context: { intl } });
  },

  mountWithIntl(node) {
    return mount(nodeWithIntlProp(node), {
      context: { intl },
      childContextTypes: { intl: intlShape }
    });
  }
};
