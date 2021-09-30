const HAS_SUBSCRIPTION = 'HAS_SUBSCRIPTION';
const HAS_TRIAL = 'HAS_TRIAL';
const USER_EMAIL = 'USER_EMAIL';

export function getSubscriptionFromLocalStorage(): boolean {
    const hasSubscription = (window as any).localStorage.getItem(HAS_SUBSCRIPTION);
    return hasSubscription || false;
}

export function setSubscriptionToLocalStorage(subscribed) {
    (window as any).localStorage.setItem(HAS_SUBSCRIPTION, subscribed);
}

export function getTrialFromLocalStorage(): boolean {
    const hasTrial = (window as any).localStorage.getItem(HAS_TRIAL);
    return hasTrial || true;
}

export function setTrialToLocalStorage(trial) {
    (window as any).localStorage.setItem(HAS_TRIAL, trial);
}

export const APP_RETURN_URL = 'https://tockler-app.web.app/toapp';

export function getEmailFromLocalStorage(): string {
    const email = (window as any).localStorage.getItem(USER_EMAIL);

    return email;
}

export function setEmailToLocalStorage(email) {
    (window as any).localStorage.setItem(USER_EMAIL, email);
}
