import { stringify } from 'querystring';
import { getMachineId } from './services/settings.api';

const trackingId: string = process.env.REACT_APP_TRACKING_ID || '';
const secretKey: string = process.env.REACT_APP_SECRET_KEY || '';

const config = {
    measurementId: trackingId,
    measurementSecret: secretKey,

    measurementUrl: 'https://www.google-analytics.com/mp/collect',
    measurementUrlDebug: 'https://www.google-analytics.com/debug/mp/collect',
    clientId: null,
};

const getUrl = () =>
    new URL(
        `${config.measurementUrl}?${stringify({
            measurement_id: config.measurementId,
            api_secret: config.measurementSecret,
        })}`,
    );

/**
 * Tracks an analytics event via measurement protocol,
 * i.e. via API.
 *
 * @param name the event name.
 *
 * @param params the event parameters.
 *
 * @param clientId the clientId for this event. Generated if not supplied.
 */
export const sendEvent = async ({ name, params }: { name: string; params }) => {
    const url = getUrl();

    if (!config.clientId) {
        const machineId = await getMachineId();
        config.clientId = machineId;
    }

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            client_id: config.clientId,
            non_personalized_ads: true,

            events: [
                {
                    name,
                    params,
                },
            ],
        }),
    });
};

export const setUserProperty = async (name, value) => {
    const url = getUrl();

    if (!config.clientId) {
        const machineId = await getMachineId();
        config.clientId = machineId;
    }

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            client_id: config.clientId,
            user_properties: {
                [name]: {
                    value,
                },
            },
        }),
    });
};

export const pageView = ({ location, title }) => {
    return sendEvent({
        name: 'page_view',
        params: {
            page_title: title,
            page_location: location,
        },
    });
};
