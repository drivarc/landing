(function() {
  var rtlLocales = {
    ar: true,
    he: true
  };

  var supportedLocales = {
    tr: true,
    en: true,
    de: true,
    fr: true,
    es: true,
    pt: true,
    it: true,
    nl: true,
    pl: true,
    sv: true,
    no: true,
    da: true,
    fi: true,
    cs: true,
    ro: true,
    hu: true,
    el: true,
    uk: true,
    ru: true,
    ja: true,
    ko: true,
    zh: true,
    hi: true,
    bn: true,
    th: true,
    vi: true,
    id: true,
    ar: true,
    he: true
  };

  function detectLocale() {
    var currentLang = (document.documentElement.lang || '').toLowerCase();
    if (supportedLocales[currentLang]) {
      return currentLang;
    }

    var pathname = window.location.pathname || '/';
    var match = pathname.match(/^\/([a-z]{2})(?:\/|$)/i);
    if (match) {
      var locale = match[1].toLowerCase();
      if (supportedLocales[locale]) {
        return locale;
      }
    }

    return 'tr';
  }

  function getHomeUrl(locale) {
    return locale === 'tr' ? '/' : '/' + locale + '/index.html';
  }

  var locale = detectLocale();
  document.documentElement.lang = locale;
  document.documentElement.dir = rtlLocales[locale] ? 'rtl' : 'ltr';

  var homeLink = document.getElementById('home-link');
  if (homeLink) {
    homeLink.setAttribute('href', getHomeUrl(locale));
  }
})();