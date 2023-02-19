declare var gtag: Function | undefined;

export interface ITrackingEvent {
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
}

export function trackPageView() {
  // do nothing for GA4
}

export function trackEvent(event: ITrackingEvent) {
  if (gtag) {
    gtag("event", event.eventAction, {
      event_category: event.eventCategory,
      event_label: event.eventLabel,
      value: event.eventValue,
    });
  }
}
