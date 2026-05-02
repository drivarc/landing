(function() {
  var pathname = window.location.pathname || '/';
  var localeMatch = pathname.match(/^\/(en|de|ru|ar|zh)(?:\/|$)/i);
  var locale = localeMatch ? localeMatch[1].toLowerCase() : 'tr';

  var localeConfig = {
    tr: {
      lang: 'tr',
      dir: 'ltr',
      title: '404 - Sayfa Bulunamadı | Drivarc',
      metaDescription: 'Aradığınız sayfa bulunamadı. Drivarc ana sayfasına dönün.',
      heading: 'Sayfa Bulunamadı',
      description: 'Aradığınız sayfa mevcut değil veya taşınmış olabilir. Ana sayfaya dönerek devam edebilirsiniz.',
      buttonLabel: 'Ana Sayfaya Dön',
      homeUrl: '/'
    },
    en: {
      lang: 'en',
      dir: 'ltr',
      title: '404 - Page Not Found | Drivarc',
      metaDescription: 'The page you were looking for was not found. Return to Drivarc home.',
      heading: 'Page Not Found',
      description: 'The page you were looking for may have been removed or moved. You can return to the home page to continue.',
      buttonLabel: 'Back to Home',
      homeUrl: '/en/'
    },
    de: {
      lang: 'de',
      dir: 'ltr',
      title: '404 - Seite nicht gefunden | Drivarc',
      metaDescription: 'Die gesuchte Seite wurde nicht gefunden. Zur Drivarc-Startseite zurückkehren.',
      heading: 'Seite nicht gefunden',
      description: 'Die gesuchte Seite wurde möglicherweise entfernt oder verschoben. Sie können zur Startseite zurückkehren.',
      buttonLabel: 'Zur Startseite',
      homeUrl: '/de/'
    },
    ru: {
      lang: 'ru',
      dir: 'ltr',
      title: '404 - Страница не найдена | Drivarc',
      metaDescription: 'Страница, которую вы ищете, не найдена. Вернитесь на главную Drivarc.',
      heading: 'Страница не найдена',
      description: 'Возможно, страница была удалена или перемещена. Вы можете вернуться на главную страницу.',
      buttonLabel: 'На главную',
      homeUrl: '/ru/'
    },
    ar: {
      lang: 'ar',
      dir: 'rtl',
      title: '404 - الصفحة غير موجودة | Drivarc',
      metaDescription: 'الصفحة التي تبحث عنها غير موجودة. عد إلى الصفحة الرئيسية لـ Drivarc.',
      heading: 'الصفحة غير موجودة',
      description: 'قد تكون الصفحة التي تبحث عنها حُذفت أو نُقلت. يمكنك العودة إلى الصفحة الرئيسية للمتابعة.',
      buttonLabel: 'العودة إلى الرئيسية',
      homeUrl: '/ar/'
    },
    zh: {
      lang: 'zh',
      dir: 'ltr',
      title: '404 - 页面未找到 | Drivarc',
      metaDescription: '您查找的页面未找到。返回 Drivarc 首页。',
      heading: '页面未找到',
      description: '您查找的页面可能已被删除或移动。您可以返回首页继续浏览。',
      buttonLabel: '返回首页',
      homeUrl: '/zh/'
    }
  };

  var config = localeConfig[locale] || localeConfig.tr;

  document.documentElement.lang = config.lang;
  document.documentElement.dir = config.dir;
  document.title = config.title;

  var descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', config.metaDescription);
  }

  var heading = document.getElementById('error-title');
  if (heading) {
    heading.textContent = config.heading;
  }

  var description = document.getElementById('error-description');
  if (description) {
    description.textContent = config.description;
  }

  var homeLink = document.getElementById('home-link');
  if (homeLink) {
    homeLink.setAttribute('href', config.homeUrl);
  }

  var homeLabel = document.getElementById('home-link-label');
  if (homeLabel) {
    homeLabel.textContent = config.buttonLabel;
  }
})();