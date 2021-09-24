const HAS_SUBSCRIPTION = 'HAS_SUBSCRIPTION';

export function getSubscriptionFromLocalStorage(): boolean {
    const hasSubscription = (window as any).localStorage.getItem(HAS_SUBSCRIPTION);

    return hasSubscription || false;
}

export function setSubscriptionToLocalStorage(subscribed) {
    (window as any).localStorage.setItem(HAS_SUBSCRIPTION, subscribed);
}

export const APP_RETURN_URL = 'https://tockler-app.web.app/toapp';
