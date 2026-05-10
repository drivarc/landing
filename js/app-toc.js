(function () {
  'use strict';

  function initLegalToc() {
    var container = document.querySelector('.terms-container');
    if (!container) return;

    var sections = container.querySelectorAll('.legal-section');
    if (sections.length < 2) return;

    var items = [];
    sections.forEach(function (section, index) {
      var title = section.querySelector('.legal-section-title');
      if (!title) return;
      var text = title.textContent.trim();
      var m = text.match(/^(\d+)(?:\.(\d+))?/);
      var level = (m && m[2]) ? 1 : 0;
      items.push({ text: text, level: level, index: index, id: 'section-' + index });
    });

    if (items.length < 2) return;

    function getLabel() {
      return window.__i18nData && window.__i18nData['legal.toc_title']
        ? window.__i18nData['legal.toc_title']
        : 'Sayfa \u0130\xE7indekiler';
    }

    function buildList(linkClass) {
      var ul = document.createElement('ul');
      ul.className = 'toc-list';
      ul.setAttribute('role', 'list');
      items.forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'toc-item';
        var a = document.createElement('a');
        a.className = (linkClass || 'toc-link') + ' level-' + item.level;
        a.href = '#' + item.id;
        a.textContent = item.text;
        a.setAttribute('data-index', item.index);
        li.appendChild(a);
        ul.appendChild(li);
      });
      return ul;
    }

    var sidebar = document.createElement('nav');
    sidebar.className = 'toc-sidebar';
    sidebar.setAttribute('aria-label', getLabel());

    var titleEl = document.createElement('div');
    titleEl.className = 'toc-title';
    titleEl.setAttribute('data-i18n', 'legal.toc_title');
    titleEl.textContent = getLabel();
    sidebar.appendChild(titleEl);
    sidebar.appendChild(buildList());

    var wrapper = document.createElement('div');
    wrapper.className = 'terms-page-layout';
    container.parentNode.insertBefore(wrapper, container);
    wrapper.appendChild(container);
    wrapper.appendChild(sidebar);

    var fab = document.createElement('button');
    fab.className = 'toc-fab';
    fab.setAttribute('data-i18n', 'legal.toc_title');
    fab.setAttribute('data-i18n-attr', 'aria-label');
    fab.setAttribute('aria-label', getLabel());
    fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/><path d="M3 11h18v2H3v-2z" opacity="0.6"/></svg>';
    document.body.appendChild(fab);

    var backdrop = document.createElement('div');
    backdrop.className = 'toc-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    var sheet = document.createElement('div');
    sheet.className = 'toc-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', getLabel());

    var sheetHeader = document.createElement('div');
    sheetHeader.className = 'toc-sheet-header';
    var sheetTitle = document.createElement('div');
    sheetTitle.className = 'toc-sheet-title';
    sheetTitle.setAttribute('data-i18n', 'legal.toc_title');
    sheetTitle.textContent = getLabel();
    var closeBtn = document.createElement('button');
    closeBtn.className = 'toc-sheet-close';
    closeBtn.setAttribute('data-i18n', 'legal.toc_close');
    closeBtn.setAttribute('data-i18n-attr', 'aria-label');
    closeBtn.setAttribute('aria-label', 'Kapat');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    sheetHeader.appendChild(sheetTitle);
    sheetHeader.appendChild(closeBtn);
    sheet.appendChild(sheetHeader);

    var sheetBody = document.createElement('div');
    sheetBody.className = 'toc-sheet-body';
    sheetBody.appendChild(buildList());
    sheet.appendChild(sheetBody);
    document.body.appendChild(sheet);

    var links = sidebar.querySelectorAll('.toc-link');
    var sheetLinks = sheetBody.querySelectorAll('.toc-link');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = Array.prototype.indexOf.call(sections, entry.target);
          [].forEach.call(links, function (lnk) {
            lnk.classList.toggle('active', parseInt(lnk.getAttribute('data-index')) === idx);
          });
          [].forEach.call(sheetLinks, function (lnk) {
            lnk.classList.toggle('active', parseInt(lnk.getAttribute('data-index')) === idx);
          });
        }
      });
    }, { rootMargin: '-80px 0px -50% 0px' });

    sections.forEach(function (s) { observer.observe(s); });

    function onLinkClick(e) {
      var a = e.target.closest('.toc-link');
      if (!a) return;
      e.preventDefault();
      var target = document.getElementById(a.getAttribute('href').substring(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeSheet();
    }

    var allLists = sidebar.querySelector('.toc-list');
    if (allLists) allLists.addEventListener('click', onLinkClick);
    sheetBody.addEventListener('click', onLinkClick);

    function openSheet() {
      sheet.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      var first = sheetBody.querySelector('.toc-link');
      if (first) first.focus();
    }

    function closeSheet() {
      sheet.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
      fab.focus();
    }

    fab.addEventListener('click', openSheet);
    closeBtn.addEventListener('click', closeSheet);
    backdrop.addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('open')) {
        closeSheet();
        fab.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLegalToc);
  } else {
    initLegalToc();
  }
})();
