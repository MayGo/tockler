import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';

// https://www.npmjs.com/package/@analytics/google-analytics
const analytics = Analytics({
  app: 'tockler',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-73697939-1',
      anonymizeIp: true,
      customDimensions: {
        version: 'dimension1',
      },
      tasks: {
        // Set checkProtocolTask, checkStorageTask, & historyImportTask for electron apps
        checkProtocolTask: null,
        checkStorageTask: null,
        historyImportTask: null,
      },
    }),
  ],
});

export { analytics };
