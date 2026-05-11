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

  wrapper.addEventListener('mouseenter', function () {
    wrapper.classList.add('paused');
  });

  wrapper.addEventListener('mouseleave', function () {
    wrapper.classList.remove('paused');
  });

  wrapper.addEventListener('touchstart', function () {
    wrapper.classList.add('paused');
    clearTimeout(hoverTimer);
  });

  wrapper.addEventListener('touchend', function () {
    hoverTimer = setTimeout(function () {
      wrapper.classList.remove('paused');
    }, 300);
  });

  wrapper.addEventListener('touchcancel', function () {
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
