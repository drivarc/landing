(function () {
  'use strict';

  var cache = {};

  function applyTranslations(translations) {
    var els = document.querySelectorAll('[data-i18n], [data-i18n-html]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key, val;

      if (el.hasAttribute('data-i18n-attr')) {
        key = el.getAttribute('data-i18n');
        val = translations[key];
        if (val === undefined) continue;
        el.setAttribute(el.getAttribute('data-i18n-attr'), val);
      } else if (el.hasAttribute('data-i18n-html')) {
        key = el.getAttribute('data-i18n-html');
        val = translations[key];
        if (val === undefined) continue;
        el.innerHTML = val;
      } else if (el.hasAttribute('data-i18n')) {
        key = el.getAttribute('data-i18n');
        val = translations[key];
        if (val === undefined) continue;
        el.textContent = val;
      }
    }
  }

  function init() {
    var lang = document.documentElement.lang || 'tr';
    if (cache[lang]) {
      applyTranslations(cache[lang]);
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/i18n/' + lang + '.json', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          var translations = JSON.parse(xhr.responseText);
          cache[lang] = translations;
          applyTranslations(translations);
        } catch (e) {
          // invalid JSON, fallback to HTML text
        }
      }
    };
    xhr.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
