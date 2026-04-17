(function() {
  var GA_ID = 'G-28CR3Y25R3';
  var GA_SRC = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  var state = window.__drivarcAnalyticsState || (window.__drivarcAnalyticsState = {
    loaded: false,
    loading: false,
    promise: null
  });

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  function activateDeferredStylesheet() {
    var siteStyles = document.getElementById('siteStyles');
    if (siteStyles && siteStyles.media !== 'all') {
      siteStyles.media = 'all';
    }
  }

  activateDeferredStylesheet();

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
    region: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'TR', 'GB', 'BR', 'KR']
  });

  function applyConfig() {
    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false
    });
    gtag('set', 'url_passthrough', true);
    gtag('set', 'ads_data_redaction', false);
  }

  function ensureLoaded() {
    if (state.loaded) return Promise.resolve(true);
    if (state.promise) return state.promise;

    state.loading = true;
    state.promise = new Promise(function(resolve) {
      applyConfig();

      var gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = GA_SRC;
      gaScript.onload = function() {
        state.loaded = true;
        state.loading = false;
        resolve(true);
      };
      gaScript.onerror = function() {
        state.loading = false;
        state.promise = null;
        resolve(false);
      };

      (document.head || document.documentElement).appendChild(gaScript);
    });

    return state.promise;
  }

  window.drivarcEnsureAnalyticsLoaded = ensureLoaded;
  window.drivarcTrack = function(eventName, params) {
    window.gtag('event', eventName, params || {});
  };
})();
