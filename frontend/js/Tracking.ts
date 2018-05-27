declare var ga: Function | undefined;

export interface ITrackingEvent {
    eventCategory: string;
    eventAction: string;
    eventLabel?: string;
    eventValue?: number;
}

export function trackPageView() {
    if (ga) {
        ga('send', 'pageview');
    }
}

export function trackEvent(event: ITrackingEvent) {
    if (ga) {
        ga('send', 'event', event);
    }
}