import * as React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import * as en from 'react-intl/locale-data/en';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import { getMessages } from '../utils/localeUtils';
import Theme from '../components/Theme/Theme';
import AppLayout from './AppLayout';
import Routes from './Routes';
import { appHistory } from '../store/store';

addLocaleData([...en]);

const AppWrapper = ({
    store,
    locale
}: {
    store?: any;
    locale: TSupportedLangs;
}) => (
    <IntlProvider locale={locale} messages={getMessages(locale)}>
        <Provider store={store}>
            <Theme>
                <ConnectedRouter history={appHistory}>
                    <AppLayout>
                        <Routes />
                    </AppLayout>
                </ConnectedRouter>
            </Theme>
        </Provider>
    </IntlProvider>
);

export default AppWrapper;
