export const trackEvent = (eventName: string, data: any = {}) => {
  try {
    // Google Tag Manager / GA4 DataLayer
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...data,
      });
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      // Map standard GA4 e-commerce events to Facebook Standard Events
      let fbEventName = eventName;
      let fbData = { ...data };

      if (eventName === 'add_to_cart') {
        fbEventName = 'AddToCart';
        fbData = {
          content_name: data.items?.[0]?.item_name,
          value: data.value,
          currency: data.currency || 'USD',
        };
      } else if (eventName === 'begin_checkout') {
        fbEventName = 'InitiateCheckout';
        fbData = {
          value: data.value,
          currency: data.currency || 'USD',
          num_items: data.items?.length || 0,
        };
      } else if (eventName === 'purchase') {
        fbEventName = 'Purchase';
        fbData = {
          value: data.value,
          currency: data.currency || 'USD',
          transaction_id: data.transaction_id,
        };
      }

      (window as any).fbq('track', fbEventName, fbData);
    }
  } catch (error) {
    console.error('Tracking Error:', error);
  }
};
