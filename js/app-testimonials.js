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

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var speed = 0.8;
  var pos = 0;
  var paused = false;
  var maxDist = 0;

  function measure() {
    var n = track.children.length / 2;
    var first = track.children[0].getBoundingClientRect();
    var last = track.children[n - 1].getBoundingClientRect();
    maxDist = last.right - first.left;
  }

  function animate() {
    if (paused) {
      requestAnimationFrame(animate);
      return;
    }
    pos -= speed;
    if (Math.abs(pos) >= maxDist) {
      pos = 0;
    }
    track.style.transform = 'translateX(' + pos + 'px)';
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(function () {
    measure();
    animate();
  });

  var hoverTimer = null;

  wrapper.addEventListener('mouseenter', function () {
    paused = true;
  });

  wrapper.addEventListener('mouseleave', function () {
    paused = false;
  });

  wrapper.addEventListener('touchstart', function () {
    paused = true;
    clearTimeout(hoverTimer);
  });

  wrapper.addEventListener('touchend', function () {
    hoverTimer = setTimeout(function () {
      paused = false;
    }, 2000);
  });

  wrapper.addEventListener('touchcancel', function () {
    paused = false;
    clearTimeout(hoverTimer);
  });

  window.addEventListener('resize', measure);
})();
