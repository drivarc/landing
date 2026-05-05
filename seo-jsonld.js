(function() {
  const pathname = window.location.pathname || '/';

  if (/\/(privacy|terms|404)\.html$/.test(pathname)) {
    return;
  }

  if (!/(?:\/|index\.html)$/.test(pathname)) {
    return;
  }

  const locale = (document.documentElement.lang || 'tr').slice(0, 2);
  const siteUrlByLocale = {
    tr: 'https://drivarc.com/',
    en: 'https://drivarc.com/en/',
    de: 'https://drivarc.com/de/',
    ru: 'https://drivarc.com/ru/',
    ar: 'https://drivarc.com/ar/'
  };

  const configByLocale = {
    tr: {
      alternateName: 'Drivarc - Araç Takip ve Yönetim',
      description: 'Drivarc ile tüm araçlarınızı tek uygulamadan yönetin. Yakıt takibi, bakım hatırlatıcıları, maliyet analizleri ve çok daha fazlası.',
      websiteDescription: 'Araç takip ve yönetim uygulaması',
      websiteLanguages: ['tr', 'en', 'de', 'ru', 'ar'],
      includeDownloadAction: true
    },
    en: {
      alternateName: 'Drivarc - Vehicle Tracking & Management',
      description: 'Manage all your vehicles from a single app with Drivarc. Fuel tracking, maintenance reminders, cost analysis and much more.',
      websiteDescription: 'Vehicle tracking and management application',
      websiteLanguages: ['en'],
      includeDownloadAction: false
    },
    de: {
      alternateName: 'Drivarc - Fahrzeugverfolgung & Verwaltung',
      description: 'Verwalten Sie alle Ihre Fahrzeuge aus einer einzigen App mit Drivarc. Kraftstoffverfolgung, Wartungserinnerungen, Kostenanalyse und vieles mehr.',
      websiteDescription: 'Fahrzeugverfolgung und Verwaltungsanwendung',
      websiteLanguages: ['de'],
      includeDownloadAction: false
    },
    ru: {
      alternateName: 'Drivarc - Отслеживание и управление автомобилями',
      description: 'Управляйте всеми вашими автомобилями из одного приложения с Drivarc. Отслеживание топлива, напоминания о техобслуживании, анализ затрат и многое другое.',
      websiteDescription: 'Приложение для отслеживания и управления автомобилями',
      websiteLanguages: ['ru'],
      includeDownloadAction: false
    },
    ar: {
      alternateName: 'Drivarc - تتبع وإدارة المركبات',
      description: 'إدارة جميع مركباتك من تطبيق واحد مع Drivarc. تتبع الوقود، تذكير بالصيانة، تحليل التكاليف وأكثر.',
      websiteDescription: 'تطبيق تتبع وإدارة المركبات',
      websiteLanguages: ['ar'],
      includeDownloadAction: false
    }
  };

  const localeConfig = configByLocale[locale] || configByLocale.tr;
  const siteUrl = siteUrlByLocale[locale] || siteUrlByLocale.tr;

  function appendJsonLd(id, payload) {
    if (document.getElementById(id)) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(payload);
    document.head.appendChild(script);
  }

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Drivarc',
    alternateName: localeConfig.alternateName,
    description: localeConfig.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Android',
    url: siteUrl,
    image: 'https://drivarc.com/images/Harflogo.png',
    softwareVersion: '1.0.0',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
      description: 'Free to download with optional Premium subscription'
    },
    author: {
      '@type': 'Organization',
      name: 'Drivarc',
      url: 'https://drivarc.com/',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'contact@drivarc.com',
        contactType: 'customer support',
        availableLanguage: ['Turkish', 'English', 'German', 'Russian', 'Arabic']
      },
      sameAs: ['https://www.instagram.com/drivarc.app', 'https://x.com/drivarc_app', 'https://www.linkedin.com/company/drivarc/']
    }
  };

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Drivarc',
    url: siteUrl,
    description: localeConfig.websiteDescription,
    inLanguage: localeConfig.websiteLanguages
  };
  appendJsonLd('drivarc-softwareapp-jsonld', softwareApplication);
  appendJsonLd('drivarc-website-jsonld', webSite);

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Drivarc',
    legalName: 'Drivarc',
    url: 'https://drivarc.com/',
    logo: 'https://drivarc.com/images/Harflogo.png',
    sameAs: ['https://www.instagram.com/drivarc.app', 'https://x.com/drivarc_app', 'https://www.linkedin.com/company/drivarc/']
  };

    appendJsonLd('drivarc-organization-jsonld', organization);

    const navLinks = document.querySelectorAll('.nav a');
    if (navLinks.length > 0) {
      const breadcrumbList = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: Array.from(navLinks).map((link, index) => {
          const text = link.textContent || link.innerText;
          const href = link.getAttribute('href') || '';
          let url = siteUrl;
          if (href.startsWith('#')) {
            url = siteUrl + href;
          } else if (href.startsWith('./') || href.startsWith('/')) {
            url = new URL(href, siteUrl).href;
          }
          return {
            '@type': 'ListItem',
            position: index + 1,
            name: text,
            item: url
          };
        })
      };
      breadcrumbList.itemListElement.unshift({
        '@type': 'ListItem',
        position: 0,
        name: document.querySelector('.logo-img')?.alt || 'Home',
        item: siteUrl
      });
      breadcrumbList.itemListElement.forEach((item, idx) => { item.position = idx + 1; });
      appendJsonLd('drivarc-breadcrumb-jsonld', breadcrumbList);
    }

   const faqItems = document.querySelectorAll('.faq-item');
   if (faqItems.length > 0) {
     const faqPage = {
       '@context': 'https://schema.org',
       '@type': 'FAQPage',
       mainEntity: Array.from(faqItems).map(item => {
         const question = item.querySelector('.faq-question span')?.textContent || '';
         const answer = item.querySelector('.faq-answer-inner')?.textContent || '';
         return {
           '@type': 'Question',
           name: question,
           acceptedAnswer: {
             '@type': 'Answer',
             text: answer
           }
         };
       }).filter(item => item.name && item.acceptedAnswer.text)
     };
     appendJsonLd('drivarc-faq-jsonld', faqPage);
   }
})();