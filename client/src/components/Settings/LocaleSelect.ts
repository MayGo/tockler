import { Select } from 'antd';
import React from 'react';
import moment from 'moment';
import { useAppDataState } from '../../routes/AppDataProvider';
import etEe from 'antd/es/locale/et_EE';
import { Logger } from '../../logger';

const { Option } = Select;

export const LocaleSelect = () => {
    const localeList = moment.locales();
    const defaultLocale = moment.locale();

    const state: any = useAppDataState();

    function handleChange(value) {
        Logger.debug(`Setting locale ${value}`);
        moment.locale(value);
        state.setLocale(etEe);
    }

    return (
        <Select defaultValue={defaultLocale} style={{ width: 120 }} onChange={handleChange}>
            {localeList.map(locale => (
                <Option value={locale} key={locale}>
                    {locale}
                </Option>
            ))}
        </Select>
    );
};
