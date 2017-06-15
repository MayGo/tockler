'use strict';

const notifier = require('node-notifier');
const path = require('path');
const moment = require('moment');

const config = require('./config');

var LogManager = require("./log-manager.js");
var logger = LogManager.getLogger('AppUpdater');

var windowManager = require('./window-manager');


const { autoUpdater } = require("electron-updater");


class AppUpdater {

    static sendStatusToWindow(text) {
        logger.info(text);
        windowManager.mainWindow.webContents.send('message', text);
    }

    static checkForUpdates() {
        logger.info("Checking for updates.");
        if (config.isDev) {
            logger.info("Disabled in dev mode");
            return
        }

        autoUpdater.checkForUpdates();
    }

    static configure() {
        logger.info("Configuring AutoUpdater.");
        if (config.isDev) {
            logger.info("Disabled in dev mode");
            return
        }

        autoUpdater.logger = LogManager.getLogger('autoUpdater');

        autoUpdater.on('checking-for-update', () => {
            AppUpdater.sendStatusToWindow('Checking for update...');
        })
        autoUpdater.on('update-available', (ev, info) => {
            AppUpdater.sendStatusToWindow('Update available.');
        })
        autoUpdater.on('update-not-available', (ev, info) => {
            AppUpdater.sendStatusToWindow('Update not available.');
        })
        autoUpdater.on('error', (ev, err) => {
            AppUpdater.sendStatusToWindow('Error in auto-updater.');
        })
        autoUpdater.on('download-progress', (progressObj) => {
            let log_message = "Download speed: " + progressObj.bytesPerSecond;
            log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
            log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
            AppUpdater.sendStatusToWindow(log_message);
        })
        autoUpdater.on('update-downloaded', (ev, info) => {
            AppUpdater.sendStatusToWindow('Update downloaded; will install in 5 seconds');
        });

        autoUpdater.on('update-downloaded', (ev, info) => {
            // Wait 5 seconds, then quit and install
            // In your application, you don't need to wait 5 seconds.
            // You could call autoUpdater.quitAndInstall(); immediately
            setTimeout(function () {
                autoUpdater.quitAndInstall();
            }, 5000)
        });
    }
}

module.exports = AppUpdater;