import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import { logManager } from '../utils/log-manager';

let logger = logManager.getLogger('ExtensionsManager');

export async function initExtensions() {
    logger.debug('Init extensions.');

    return installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], {
        loadExtensionOptions: {
            allowFileAccess: true,
        },
    })
        .then((extensionNames) => logger.info(`Added Extensions: ${extensionNames}`))
        .catch((err: Error) => logger.error('An error occurred loading extensions: ', err));
}
