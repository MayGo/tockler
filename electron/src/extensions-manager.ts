import { logManager } from './log-manager';
let logger = logManager.getLogger('ExtensionsManager');

export class ExtensionsManager {
    async init() {
        logger.debug('Init extensions.');
        const installer = require('electron-devtools-installer');
        const forceDownload = !!process.env['UPGRADE_EXTENSIONS'];
        const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

        return Promise.all(extensions.map((name) => installer.default(installer[name], forceDownload))).catch(
            logger.error,
        );
    }
}

export const extensionsManager = new ExtensionsManager();
