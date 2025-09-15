import { analytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Analytics
analytics.track('page_view');

// Initialize Vercel Speed Insights
injectSpeedInsights();

// Custom event tracking functions
export const trackEvent = (eventName, properties = {}) => {
  analytics.track(eventName, properties);
};

// Track specific game editor events
export const trackSaveFileLoad = () => {
  trackEvent('save_file_loaded');
};

export const trackSaveFileExport = () => {
  trackEvent('save_file_exported');
};

export const trackItemEdit = (itemType) => {
  trackEvent('item_edited', { item_type: itemType });
};

export const trackStatEdit = (statType) => {
  trackEvent('stat_edited', { stat_type: statType });
};

export const trackSealReforge = () => {
  trackEvent('seal_reforged');
};