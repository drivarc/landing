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

  var anim = null;

  function measure() {
    var n = track.children.length / 2;
    var first = track.children[0].getBoundingClientRect();
    var last = track.children[n - 1].getBoundingClientRect();
    return last.right - first.left;
  }

  function start() {
    if (anim) anim.cancel();
    var dist = measure();
    anim = track.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-' + dist + 'px)' }
    ], {
      duration: 45000,
      iterations: Infinity,
      easing: 'linear'
    });
  }

  requestAnimationFrame(function () {
    requestAnimationFrame(start);
  });

  var hoverTimer = null;

  wrapper.addEventListener('mouseenter', function () {
    if (anim) anim.pause();
  });

  wrapper.addEventListener('mouseleave', function () {
    if (anim) anim.play();
  });

  wrapper.addEventListener('touchstart', function () {
    if (anim) anim.pause();
    clearTimeout(hoverTimer);
  });

  wrapper.addEventListener('touchend', function () {
    hoverTimer = setTimeout(function () {
      if (anim) anim.play();
    }, 2000);
  });

  wrapper.addEventListener('touchcancel', function () {
    if (anim) anim.play();
    clearTimeout(hoverTimer);
  });

  window.addEventListener('resize', function () {
    requestAnimationFrame(start);
  });
})();
