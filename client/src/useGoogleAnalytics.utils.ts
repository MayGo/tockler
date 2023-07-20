import { pageView, sendEvent, setUserProperty } from './ga-measurement-protocol';

export function setAppParams() {
    setUserProperty('app_version', process.env.REACT_APP_VERSION || '1.0.0');
}

export function sendPageEvent(path, search) {
    setAppParams();
    pageView({ location: path, title: path });
}

export function sendOpenTrayEvent() {
    sendEvent({ name: 'open_tray', params: {} });
}

export function sendSupportLinkClickedEvent() {
    sendEvent({ name: 'support_store', params: {} });
}
