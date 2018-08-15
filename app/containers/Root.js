// @flow
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import Routes from '../Routes';

import {addLocaleData, IntlProvider} from 'react-intl';
import {flattenMessages} from '../utils'
import messages from '../locales';


import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';

addLocaleData([...en, ...tr]);

type Props = {
    store: {},
    history: {}
};

export default class Root extends Component<Props> {
    render() {
        const {store, history} = this.props;

        let locale = 'en-US';

        return (
            <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <Routes/>
                    </ConnectedRouter>
                </Provider>
            </IntlProvider>
        );
    }
}
