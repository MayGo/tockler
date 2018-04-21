import * as React from 'react';
import { Iterable } from 'immutable';

export const toJS = WrappedComponent => (wrappedComponentProps: any) => {
    const KEY = 0;
    const VALUE = 1;

    const propsJS = Object.entries(wrappedComponentProps).reduce(
        (newProps, wrappedComponentProp: any) => {
            newProps[wrappedComponentProp[KEY]] = Iterable.isIterable(wrappedComponentProp[VALUE])
                ? wrappedComponentProp[VALUE].toJS()
                : wrappedComponentProp[VALUE];
            return newProps;
        },
        {},
    );

    return <WrappedComponent {...propsJS} />;
};
