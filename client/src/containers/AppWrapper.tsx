import * as React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import * as en from 'react-intl/locale-data/en';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import { getMessages } from '../utils/localeUtils';
import Theme from '../components/Theme/Theme';
import { appHistory } from '../history';
import AppLayout from './AppLayout';
import Routes from './Routes';

addLocaleData([...en]);

const CustomProvider = ({ children, store }: { children: any; store?: any }) =>
    store ? (
        <Provider store={store}>{children}</Provider>
    ) : (
        <span>{children}</span>
    );

const AppWrapper = ({
    store,
    locale
}: {
    store?: any;
    locale: TSupportedLangs;
}) => (
    <IntlProvider locale={locale} messages={getMessages(locale)}>
        <CustomProvider store={store}>
            <Theme>
                <ConnectedRouter history={appHistory}>
                    <AppLayout>
                        <Routes />
                    </AppLayout>
                </ConnectedRouter>
            </Theme>
        </CustomProvider>
    </IntlProvider>
);

export default AppWrapper;
