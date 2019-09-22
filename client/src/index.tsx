import * as React from 'react';
import ReactDOM from 'react-dom';

import 'typeface-berkshire-swash';
import { MainRouter } from './router';

import { setupFrontendListener } from 'eiphop';

const { ipcRenderer } = window as any;
setupFrontendListener({ ipcRenderer } as any);

if (process.env.NODE_ENV !== 'production') {
    /*  
    const { whyDidYouUpdate } = require('why-did-you-update');
    whyDidYouUpdate(React, {
        groupByComponent: true,
        collapseComponentGroups: true,
    }); */
}

ReactDOM.render(<MainRouter />, document.getElementById('root') as HTMLElement);
