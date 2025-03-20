import { app } from 'electron';
import { autoUpdater, UpdateCheckResult, UpdateInfo } from 'electron-updater';
import { config } from '../utils/config';
import { showNotification } from './notification';

import * as fs from 'fs';
import * as path from 'path';
import { getCurrentState } from '../background/watchStates/watchAndPropagateState';
import { State } from '../enums/state';
import { logManager } from '../utils/log-manager';
import WindowManager from './window-manager';

const logger = logManager.getLogger('AppUpdater');

const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export const CHECK_INTERVAL_MS = ONE_HOUR_MS * 8;

function isNetworkError(errorObject: any) {
    return errorObject.message.includes('net::ERR');
}

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

// Ensure update directories exist
function ensureUpdateDirectoriesExist() {
    try {
        const platform = process.platform;
        let cacheDir: string;

        if (platform === 'darwin') {
            cacheDir = path.join(app.getPath('userData'), '..', 'Caches', 'tockler-updater');
        } else if (platform === 'win32') {
            cacheDir = path.join(app.getPath('userData'), 'tockler-updater');
        } else {
            cacheDir = path.join(app.getPath('userData'), 'tockler-updater');
        }

        const pendingDir = path.join(cacheDir, 'pending');

        if (!fs.existsSync(cacheDir)) {
            logger.debug(`Creating update cache directory: ${cacheDir}`);
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        if (!fs.existsSync(pendingDir)) {
            logger.debug(`Creating pending updates directory: ${pendingDir}`);
            fs.mkdirSync(pendingDir, { recursive: true });
        }

        logger.debug(`Update directories ensured at: ${cacheDir}`);
        return true;
    } catch (error) {
        logger.error('Failed to create update directories:', error);
        return false;
    }
}

export default class AppUpdater {
    static dialogIsOpen = false;

    static init() {
        autoUpdater.logger = logger;

        // Ensure update directories exist before configuring the updater
        ensureUpdateDirectoriesExist();

        autoUpdater.on('download-progress', (progressInfo) => {
            logger.debug(`Downloaded: ${Math.round(progressInfo.percent)}% `);
        });

        autoUpdater.on('update-available', (info: UpdateInfo) => {
            showNotification({
                body: `Downloading Tockler version ${info.version}`,
                title: 'Update available',
                silent: true,
            });
        });

        autoUpdater.on('update-downloaded', async (info: UpdateInfo) => {
            logger.debug(`Downloaded Tockler version ${info.version}`);

            WindowManager.setTrayIconToUpdate();

            showNotification({
                body: `New version is downloaded and ready to install`,
                title: 'Update available',
                silent: true,
            });
        });

        autoUpdater.on('error', (e) => {
            if (isNetworkError(e)) {
                logger.debug('Network error:', e);
            } else {
                logger.error('AutoUpdater error:', e);
                showNotification({
                    title: 'Tockler update error',
                    body: e ? (e as Error).stack || '' : 'unknown',
                });
            }
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

        if (isAutoUpdateEnabled && getCurrentState() !== State.Offline) {
            // Ensure directories exist before checking for updates
            if (ensureUpdateDirectoriesExist()) {
                logger.debug('Checking for updates.');
                autoUpdater.checkForUpdates();
            } else {
                logger.error('Failed to ensure update directories exist, skipping update check.');
            }
        } else {
            logger.debug('Auto update disabled.');
        }
    }

    static async checkForUpdatesManual() {
        logger.debug('Checking for updates');

        const canAutoUpdate = isAutoUpdatableBuild();

        if (!canAutoUpdate) {
            showNotification({
                body: `Auto updates are not available for this build type. Please check for updates manually at https://github.com/MayGo/tockler/releases.`,
                title: 'Updates unavailable',
                silent: true,
            });
            return;
        }

        // Ensure directories exist before manual update check
        if (!ensureUpdateDirectoriesExist()) {
            showNotification({
                body: `Failed to create update directories. Please try again later.`,
                title: 'Update error',
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
