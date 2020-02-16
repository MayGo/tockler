import * as log from 'loglevel';

const level: any = process.env.LOG_LEVEL || 'info';

log.setLevel(level);

const { Sentry } = window as any;

const originalFactory = log.methodFactory;

const isError = function(e) {
    return e && e.stack && e.message;
};

(log as any).methodFactory = function(methodName, logLevel, loggerName) {
    var rawMethod = originalFactory(methodName, logLevel, loggerName);

    return function() {
        const [message, ...data] = arguments;

        Sentry.withScope(scope => {
            scope.setExtra('data', data);
            scope.setLevel(methodName);

            if(isError(message)){
                Sentry.captureException(message);
            }else if (methodName === 'debug') {
                // ignore debug for now
            } else {
                Sentry.captureMessage(message);
            }
        });

        return rawMethod(...arguments);
    };
});

log.setLevel(log.getLevel());

export const Logger: any = log;
