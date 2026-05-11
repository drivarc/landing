(function () {
  'use strict';

  var track = document.getElementById('testimonialsTrack');
  var wrapper = document.getElementById('testimonialsWrapper');
  var swiper = document.getElementById('testimonialsSwiper');
  if (!track || !wrapper || !swiper) return;

  var cards = Array.from(track.children);
  if (cards.length < 2) return;

  // Prepend clone set (for right-swipe / previous cards)
  for (var i = cards.length - 1; i >= 0; i--) {
    var c = cards[i].cloneNode(true);
    c.removeAttribute('id');
    track.insertBefore(c, track.firstChild);
  }

  // Append clone set (for left-swipe / next cards and loop)
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
    var n = cards.length;
    var first = track.children[n].getBoundingClientRect();
    var last = track.children[n * 2 - 1].getBoundingClientRect();
    maxDist = Math.round(last.right - first.left);
    pos = -maxDist;
  }

  function animate() {
    if (!running) return;
    if (!paused) {
      pos -= speed;
      if (pos < -maxDist * 2) pos += maxDist;
      if (pos > 0) pos -= maxDist;
      track.style.transform = 'translateX(' + pos + 'px)';
    }
    requestAnimationFrame(animate);
  }

  function start() {
    measure();
    track.style.transform = 'translateX(' + pos + 'px)';
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
    if (pos < -maxDist * 2) pos = -maxDist * 2;
    if (pos > maxDist) pos = maxDist;
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
