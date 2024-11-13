require('dotenv').config();
const { notarize } = require('@electron/notarize');
const { join } = require('path');
const { existsSync } = require('fs');

exports.default = async function notarizing(params) {
    const { electronPlatformName } = params;
    const { appId } = params.packager.appInfo;

    // Skip notarization for pull requests and non-macOS builds
    if (process.env.GITHUB_EVENT_NAME === 'pull_request' || electronPlatformName !== 'darwin') {
        return;
    }

    // Skip for local builds
    if (params.packager.config.extraMetadata?.irccloud?.local_build) {
        return;
    }

    const appPath = join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
    console.log('App Path:', appPath);
    console.log('appId', appId);
    if (!existsSync(appPath)) {
        throw new Error(`Cannot find application at: ${appPath}`);
    }

    console.info('Notarizing application...', {
        appBundleId: appId,
        appPath: appPath,
        teamId: process.env.APPLE_TEAM_ID,
    });

    try {
        await notarize({
            tool: 'notarytool',
            appPath,
            teamId: process.env.APPLE_TEAM_ID,
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_ID_PASSWORD,
        });

        console.info('Notarization completed successfully');
    } catch (error) {
        console.error('Notarization failed:', error);
        throw error;
    }
};
