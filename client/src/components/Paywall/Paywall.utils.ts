const HAS_SUBSCRIPTION = 'HAS_SUBSCRIPTION';
const USER_EMAIL = 'USER_EMAIL';

export function getSubscriptionFromLocalStorage(): boolean {
    const hasSubscription = (window as any).localStorage.getItem(HAS_SUBSCRIPTION);

    return hasSubscription || false;
}

export function setSubscriptionToLocalStorage(subscribed) {
    (window as any).localStorage.setItem(HAS_SUBSCRIPTION, subscribed);
}

export const APP_RETURN_URL = 'https://tockler-app.web.app/toapp';

export function getEmailFromLocalStorage(): string {
    const email = (window as any).localStorage.getItem(USER_EMAIL);

    return email;
}

export function setEmailToLocalStorage(email) {
    (window as any).localStorage.setItem(USER_EMAIL, email);
}
