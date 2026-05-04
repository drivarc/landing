// Auto-mark active language option based on <html lang="">
document.addEventListener('DOMContentLoaded', function() {
   try {
       var htmlLang = (document.documentElement.lang || '').toLowerCase().substring(0, 2);
       if (!htmlLang) return;

       document.querySelectorAll('.lang-option').forEach(function(opt) {
           var hreflangVal = opt.getAttribute('hreflang') ? String(opt.getAttribute('hreflang')).toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 2) : '';
           var isActive = hreflangVal === htmlLang;

           opt.setAttribute('data-hreflang-safe', hreflangVal);
           opt.addEventListener('click', function(e) {
               if (this.getAttribute('aria-disabled') === 'true') {
                   e.preventDefault();
                   e.stopPropagation();
               }
           });

           if (isActive) {
               opt.classList.add('active');
               opt.setAttribute('aria-current', 'page');
               opt.setAttribute('aria-disabled', 'true');
               opt.setAttribute('tabindex', '-1');
           } else {
               opt.classList.remove('active');
               opt.removeAttribute('aria-current');
               opt.removeAttribute('aria-disabled');
               opt.removeAttribute('tabindex');
           }
       });

       var currentOpt = document.querySelector('.lang-option[hreflang="' + htmlLang + '"]');
       var toggleFlag = document.querySelector('.lang-toggle .lang-flag-icon');
       var toggleCode = document.querySelector('.lang-toggle .lang-code-text');
       if (currentOpt && toggleFlag) {
           var flag = currentOpt.querySelector('.lang-flag');
           if (flag) toggleFlag.innerHTML = flag.innerHTML.trim();
           if (toggleCode) toggleCode.textContent = htmlLang.toUpperCase();
       }


       // Fix Windows flag emojis
       if (/Win|Windows/.test(navigator.platform || navigator.userAgent) && !/Firefox/.test(navigator.userAgent)) {
           var flagMap = {
               '🇹🇷': '1f1f9-1f1f7',
               '🇬🇧': '1f1e6-1f1e7',
               '🇩🇪': '1f1e9-1f1ea',
               '🇷🇺': '1f1f7-1f1fa',
               '🇸🇦': '1f1f8-1f1e6',
               '🇨🇳': '1f1e8-1f1f3'
           };
           document.querySelectorAll('.lang-flag, .lang-flag-icon').forEach(function(el) {
               var t = el.textContent.trim();
               if (flagMap[t]) {
                   el.innerHTML = '<img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/' + flagMap[t] + '.svg" style="width:1.2em; height:1.2em; vertical-align:-0.15em; margin:0 4px;" alt="' + t + '">';
               }
           });
       }

   } catch (e) { /* ignore */ }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('[SW] Registered with scope:', registration.scope);
    }).catch(err => {
      console.log('[SW] Registration failed:', err);
    });
  });
}
