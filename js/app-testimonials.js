(function () {
  'use strict';

  var track = document.getElementById('testimonialsTrack');
  var wrapper = document.getElementById('testimonialsWrapper');
  if (!track || !wrapper) return;

  var cards = Array.from(track.children);
  if (cards.length < 2) return;

  cards.forEach(function (c) {
    var clone = c.cloneNode(true);
    clone.removeAttribute('id');
    track.appendChild(clone);
  });

  wrapper.classList.add('paused');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function measure() {
    var n = track.children.length / 2;
    var first = track.children[0].getBoundingClientRect();
    var last = track.children[n - 1].getBoundingClientRect();
    return Math.round(last.right - first.left);
  }

  function setDist() {
    track.style.setProperty('--scroll-dist', '-' + measure() + 'px');
  }

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      setDist();
      wrapper.classList.remove('paused');
    });
  });

  var hoverTimer = null;
  var resizeTimer = null;
  var baseX = 0;
  var startX = 0;
  var dragging = false;

  function matrixToX(str) {
    if (!str || str === 'none') return 0;
    var m = str.match(/matrix(?:3d)?\(([^)]+)\)/);
    if (!m) return 0;
    var vals = m[1].split(', ').map(parseFloat);
    return vals.length === 16 ? vals[12] : (vals[4] || 0);
  }

  wrapper.addEventListener('mouseenter', function () {
    wrapper.classList.add('paused');
  });

  wrapper.addEventListener('mouseleave', function () {
    wrapper.classList.remove('paused');
  });

  wrapper.addEventListener('touchstart', function (e) {
    dragging = true;
    startX = e.touches[0].clientX;
    wrapper.classList.add('paused');
    clearTimeout(hoverTimer);
    baseX = matrixToX(getComputedStyle(track).transform);
    track.style.transform = '';
  });

  wrapper.addEventListener('touchmove', function (e) {
    if (!dragging) return;
    var dx = e.touches[0].clientX - startX;
    track.style.transform = 'translateX(' + (baseX + dx) + 'px)';
  });

  wrapper.addEventListener('touchend', function () {
    dragging = false;
    track.style.transform = '';
    hoverTimer = setTimeout(function () {
      wrapper.classList.remove('paused');
    }, 300);
  });

  wrapper.addEventListener('touchcancel', function () {
    dragging = false;
    track.style.transform = '';
    wrapper.classList.remove('paused');
    clearTimeout(hoverTimer);
  });

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      requestAnimationFrame(setDist);
    }, 300);
  });
})();
