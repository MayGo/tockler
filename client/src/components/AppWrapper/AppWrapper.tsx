import * as React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import * as en from 'react-intl/locale-data/en';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { getMessages } from '../../utils/localeUtils';
import Theme from '../Theme/Theme';

addLocaleData([...en]);

const CustomProvider = ({ children, store }: { children: any; store?: any }) =>
  store ? (
    <Provider store={store}>{children}</Provider>
  ) : (
    <span>{children}</span>
  );

const AppWrapper = ({
  store,
  children,
  locale,
}: {
  store?: any;
  children: any;
  locale: TSupportedLangs;
}) => (
  <IntlProvider locale={locale} messages={getMessages(locale)}>
    <CustomProvider store={store}>
      <Theme>
        <BrowserRouter>{children}</BrowserRouter>
      </Theme>
    </CustomProvider>
  </IntlProvider>
);

export default AppWrapper;
