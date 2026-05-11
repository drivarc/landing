(function () {
  'use strict';

  var track = document.getElementById('testimonialsTrack');
  var wrapper = document.getElementById('testimonialsWrapper');
  var swiper = document.getElementById('testimonialsSwiper');
  if (!track || !wrapper || !swiper) return;

  var cards = Array.from(track.children);
  if (cards.length < 2) return;

  cards.forEach(function (c) {
    var clone = c.cloneNode(true);
    clone.removeAttribute('id');
    track.appendChild(clone);
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var pos = 0;
  var speed = 0.7;
  var maxDist = 0;
  var paused = false;
  var running = false;

  function measure() {
    var n = track.children.length / 2;
    var first = track.children[0].getBoundingClientRect();
    var last = track.children[n - 1].getBoundingClientRect();
    maxDist = Math.round(last.right - first.left);
  }

  function animate() {
    if (!running) return;
    if (!paused) {
      pos -= speed;
      if (pos <= -maxDist) pos = pos + maxDist;
      track.style.transform = 'translateX(' + pos + 'px)';
    }
    requestAnimationFrame(animate);
  }

  function start() {
    measure();
    running = true;
    animate();
  }

  requestAnimationFrame(start);

  var hoverTimer = null;
  var resizeTimer = null;
  var startX = 0;
  var currentX = 0;
  var dragging = false;

  wrapper.addEventListener('mouseenter', function () {
    paused = true;
  });

  wrapper.addEventListener('mouseleave', function () {
    paused = false;
  });

  wrapper.addEventListener('touchstart', function (e) {
    dragging = true;
    startX = e.touches[0].clientX;
    currentX = startX;
    paused = true;
    clearTimeout(hoverTimer);
  });

  wrapper.addEventListener('touchmove', function (e) {
    if (!dragging) return;
    currentX = e.touches[0].clientX;
    var dx = currentX - startX;
    e.preventDefault();
    swiper.style.transform = 'translateX(' + dx + 'px)';
  }, { passive: false });

  wrapper.addEventListener('touchend', function () {
    dragging = false;
    var dx = currentX - startX;
    pos = pos + dx;
    if (pos > 0) pos = 0;
    if (pos < -maxDist) pos = -maxDist;
    track.style.transform = 'translateX(' + pos + 'px)';
    swiper.style.transform = '';
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function () {
      paused = false;
    }, 50);
  });

  wrapper.addEventListener('touchcancel', function () {
    dragging = false;
    swiper.style.transform = '';
    paused = false;
    clearTimeout(hoverTimer);
  });

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      measure();
    }, 300);
  });
})();
