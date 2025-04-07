import { app } from 'electron';
import { autoUpdater, UpdateCheckResult, UpdateInfo } from 'electron-updater';
import { config } from '../utils/config';
import { showNotification } from './notification';

import { getCurrentState } from '../background/watchStates/watchAndPropagateState';
import { State } from '../enums/state';
import { logManager } from '../utils/log-manager';
import WindowManager from './window-manager';

const logger = logManager.getLogger('AppUpdater');

const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export const CHECK_INTERVAL_MS = ONE_HOUR_MS * 8;

// Flag to track if update is in progress to prevent multiple checks/downloads
let updateInProgress = false;

function isAutoUpdatableBuild() {
    const platform = process.platform;

    // Only specific targets are auto-updatable:
    // - macOS: DMG
    // - Linux: AppImage
    // - Windows: NSIS

    // Check if we are running a packaged app (not in development)
    if (!app.isPackaged) {
        return false;
    }

    // For macOS, we can only auto-update DMG builds
    if (platform === 'darwin') {
        return true;
    }

    // For Linux, only AppImage is auto-updatable
    if (platform === 'linux') {
        if (process.env.APPIMAGE) {
            logger.debug('Running as AppImage, auto-updatable.');
            return true;
        }

        logger.debug('Not running as AppImage, not auto-updatable.');
        return false;
    }

    // For Windows, only NSIS installer builds are auto-updatable
    if (platform === 'win32') {
        return !process.env.PORTABLE_EXECUTABLE_DIR;
    }

    return false;
}

export default class AppUpdater {
    static dialogIsOpen = false;

    static init() {
        // Disable automatic downloads to prevent race conditions
        autoUpdater.autoDownload = false;
        autoUpdater.logger = logger;

        // Add additional configuration
        autoUpdater.allowDowngrade = false;
        autoUpdater.allowPrerelease = false;
        autoUpdater.forceDevUpdateConfig = false;

        // Increase timeout for slow connections
        autoUpdater.requestHeaders = {
            'Cache-Control': 'no-cache',
        };

        autoUpdater.on('checking-for-update', () => {
            logger.debug('Checking for update...');
        });

        autoUpdater.on('update-available', (info: UpdateInfo) => {
            logger.debug(`Update ${info.version} available, starting download...`);

            showNotification({
                body: `Downloading Tockler version ${info.version}`,
                title: 'Update available',
                silent: true,
            });

            if (!updateInProgress) {
                updateInProgress = true;
                logger.debug('Downloading update - initiating download process...');

                // Try to download with allowPrerelease option
                autoUpdater
                    .downloadUpdate()
                    .then(() => {
                        logger.debug('Download initiated successfully');
                    })
                    .catch((err) => {
                        updateInProgress = false;
                        logger.error('Error downloading update:', err);
                    });
            } else {
                logger.debug('Update already in progress, not starting new download.');
            }
        });

        autoUpdater.on('update-not-available', () => {
            logger.debug('No update available');
            updateInProgress = false;
        });

        autoUpdater.on('download-progress', (progressInfo) => {
            logger.debug(`Downloaded: ${Math.round(progressInfo.percent)}% `);
        });

        autoUpdater.on('update-downloaded', async (info: UpdateInfo) => {
            logger.debug(`Downloaded Tockler version ${info.version}`);
            updateInProgress = false;

            WindowManager.setTrayIconToUpdate();

            showNotification({
                body: `New version is downloaded and ready to install`,
                title: 'Update available',
                silent: true,
            });
        });

        autoUpdater.on('error', (e) => {
            updateInProgress = false;

            logger.error('AutoUpdater error:', e);
            showNotification({
                title: 'Tockler update error',
                body: e ? (e as Error).stack || '' : 'unknown',
            });
        });

        setInterval(() => AppUpdater.checkForNewVersions(), CHECK_INTERVAL_MS);
    }

    static checkForNewVersions() {
        let isAutoUpdateEnabled = config.persisted.get('isAutoUpdateEnabled');
        isAutoUpdateEnabled = typeof isAutoUpdateEnabled !== 'undefined' ? isAutoUpdateEnabled : true;

        const canAutoUpdate = isAutoUpdatableBuild();

        if (!canAutoUpdate) {
            logger.debug('Auto update not available for this build type.');
            return;
        }

        if (isAutoUpdateEnabled && getCurrentState() === State.Online) {
            logger.debug('Checking for updates.');
            autoUpdater.checkForUpdates().catch((err) => {
                logger.error('Error checking for updates:', err);
            });
        } else {
            logger.debug('Auto update disabled.');
        }
    }

    static async checkForUpdatesManual() {
        logger.debug('Checking for updates manually');

        const canAutoUpdate = isAutoUpdatableBuild();

        if (!canAutoUpdate) {
            showNotification({
                body: `Auto updates are not available for this build type. Please check for updates manually at https://github.com/MayGo/tockler/releases.`,
                title: 'Updates unavailable',
                silent: true,
            });
            return;
        }

        if (updateInProgress) {
            showNotification({
                body: `An update is already in progress.`,
                title: 'Update in progress',
                silent: true,
            });
            return;
        }

        showNotification({ body: `Checking for updates...`, silent: true });

        try {
            const result: UpdateCheckResult | null = await autoUpdater.checkForUpdates();

            if (result?.updateInfo?.version) {
                const latestVersion = result.updateInfo.version;
                logger.debug(`Update result ${latestVersion}`);
                const currentVersionString = app.getVersion();

                if (currentVersionString === latestVersion) {
                    showNotification({
                        body: `Up to date! You have version ${currentVersionString}`,
                        silent: true,
                    });
                }
                // If there's an update, the update-available event will handle it
            }
        } catch (e) {
            logger.error('Error checking updates', e);
            showNotification({
                title: 'Tockler error',
                body: e ? (e as Error).stack || '' : 'unknown',
            });
        }
    }
}
