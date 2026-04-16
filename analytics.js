(function() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);} 
  window.gtag = gtag;

  gtag('consent', 'default', {
    'analytics_storage': 'granted',
    'ad_storage': 'granted',
    'ad_user_data': 'granted',
    'ad_personalization': 'granted',
    'wait_for_update': 500
  });

  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500,
    'region': ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','TR','GB','BR','KR']
  });

  var gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-28CR3Y25R3';
  document.head.appendChild(gaScript);

  gtag('js', new Date());
  gtag('config', 'G-28CR3Y25R3', {
    'anonymize_ip': true,
    'allow_google_signals': false
  });

  gtag('set', 'url_passthrough', true);
  gtag('set', 'ads_data_redaction', false);
})();
