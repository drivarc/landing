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

  var webVitalsLoaded = false;
  function initWebVitals() {
    if (webVitalsLoaded) return;
    webVitalsLoaded = true;

    if (!window.PerformanceObserver) return;

    var vitals = ['CLS', 'FID', 'LCP', 'FCP', 'TTFB'];
    var perfData = {};

    function getBrowserPerformanceEntryTypes() {
      var types = {};
      try {
        if (window.PerformanceObserver && PerformanceObserver.getEntries) {
          var entries = PerformanceObserver.getEntries();
          entries.forEach(function(e) { types[e.entryType] = true; });
        }
      } catch(e) {}
      return types;
    }

    function reportWebVital(name, value, id) {
      if (window.gtag && state.loaded) {
        window.gtag('event', name, {
          event_category: 'Web Vitals',
          event_label: id,
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          non_interaction: true
        });
      }
      if (window.console && window.console.log) {
        console.log('[Web Vitals] ' + name + ': ' + Math.round(value * 100) / 100 + ' (' + id + ')');
      }
    }

    try {
      var onCLS = new PerformanceObserver(function(entries) {
        entries.getEntries().forEach(function(entry) {
          if (!entry.hadRecentInput) {
            perfData.cls = entry.value;
            reportWebVital('CLS', entry.value, entry.id);
          }
        });
      });
      onCLS.observe({ type: 'layout-shift', buffered: true });

      var onLCP = new PerformanceObserver(function(entries) {
        var lastEntry = entries.getEntries()[entries.getEntries().length - 1];
        perfData.lcp = lastEntry.renderTime || lastEntry.startTime;
        reportWebVital('LCP', perfData.lcp, lastEntry.name);
      });
      onLCP.observe({ type: 'largest-contentful-paint', buffered: true });

      var onFCP = new PerformanceObserver(function(entries) {
        var fcpEntry = entries.getEntries().find(function(e) { return e.name === 'first-contentful-paint'; });
        if (fcpEntry) {
          perfData.fcp = fcpEntry.renderTime || fcpEntry.startTime;
          reportWebVital('FCP', perfData.fcp, fcpEntry.name);
        }
      });
      onFCP.observe({ type: 'paint', buffered: true });

      var onFID = new PerformanceObserver(function(entries) {
        var firstEntry = entries.getEntries()[0];
        if (firstEntry) {
          perfData.fid = firstEntry.processingStart - firstEntry.startTime;
          reportWebVital('FID', perfData.fid, firstEntry.name);
        }
      });
      onFID.observe({ type: 'first-input', buffered: true });

      var onTTFB = new PerformanceObserver(function(entries) {
        var ttfbEntry = entries.getEntries()[0];
        if (ttfbEntry) {
          perfData.ttfb = ttfbEntry.responseStart - ttfbEntry.requestStart;
          reportWebVital('TTFB', perfData.ttfb, ttfbEntry.name);
        }
      });
      onTTFB.observe({ type: 'navigation', buffered: true });

      window.__drivarcPerfData = perfData;
    } catch(e) {
      if (window.console && window.console.warn) {
        console.warn('[Web Vitals] Init failed:', e.message);
      }
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initWebVitals();
  } else {
    window.addEventListener('load', initWebVitals);
  }

  window.__drivarcInitWebVitals = initWebVitals;
})();