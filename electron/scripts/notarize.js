require('dotenv').config();
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    const { appId, productFilename } = context.packager.config;

    // Skip notarization for pull requests and non-macOS builds
    if (process.env.GITHUB_EVENT_NAME === 'pull_request' || electronPlatformName !== 'darwin') {
        return;
    }

    // Skip for local builds
    if (context.packager.config.extraMetadata?.irccloud?.local_build) {
        return;
    }

    const appPath = `${appOutDir}/${productFilename}.app`;

    console.info('Notarizing application...', {
        appBundleId: appId,
        appPath: appPath,
        teamId: process.env.TEAM_ID,
    });

    try {
        await notarize({
            tool: 'notarytool',
            appPath,
            teamId: process.env.TEAM_ID,
            appleId: process.env.APPLEID,
            appleIdPassword: process.env.APPLEIDPASS,
        });

        console.info('Notarization completed successfully');
    } catch (error) {
        console.error('Notarization failed:', error);
        throw error;
    }
};
