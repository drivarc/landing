(function () {
  'use strict';

  var track = document.getElementById('testimonialsTrack');
  var wrapper = document.getElementById('testimonialsWrapper');
  var swiper = document.getElementById('testimonialsSwiper');
  var section = document.getElementById('testimonials');
  if (!track || !wrapper || !swiper) return;

  var diagnostics = window.drivarcDiagnostics && typeof window.drivarcDiagnostics.log === 'function'
    ? window.drivarcDiagnostics.log
    : function (scope, details) {
        var payload = { scope: scope, timestamp: new Date().toISOString() };
        if (details && typeof details === 'object') {
          Object.keys(details).forEach(function (key) {
            payload[key] = details[key];
          });
        }
        console.info('[Drivarc diagnostics][' + scope + ']', payload);
        return payload;
      };

  var featureMatrix = window.drivarcRuntimeFeatures || {
    prefersReducedMotion: window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
    supportsRequestAnimationFrame: typeof window.requestAnimationFrame === 'function',
    supportsTransform3d: !window.CSS || typeof window.CSS.supports !== 'function' ? true : window.CSS.supports('transform', 'translate3d(0, 0, 0)'),
    supportsMaskImage: !window.CSS || typeof window.CSS.supports !== 'function' ? true : window.CSS.supports('mask-image', 'linear-gradient(black, transparent)') || window.CSS.supports('-webkit-mask-image', 'linear-gradient(black, transparent)'),
    supportsPointerEvents: 'PointerEvent' in window
  };

  var cards = Array.from(track.children);
  if (cards.length < 2) {
    diagnostics('testimonials', {
      phase: 'static',
      reason: 'insufficient-cards',
      cardCount: cards.length,
      forceLog: true
    });
    return;
  }

  diagnostics('testimonials', {
    phase: 'feature-matrix',
    cardCount: cards.length,
    prefersReducedMotion: featureMatrix.prefersReducedMotion,
    supportsRequestAnimationFrame: featureMatrix.supportsRequestAnimationFrame,
    supportsTransform3d: featureMatrix.supportsTransform3d,
    supportsMaskImage: featureMatrix.supportsMaskImage,
    supportsPointerEvents: featureMatrix.supportsPointerEvents,
    wrapperWidth: Math.round(wrapper.getBoundingClientRect().width),
    trackWidth: Math.round(track.getBoundingClientRect().width),
    forceLog: true
  });

  var fallbackApplied = false;
  var cloneMarker = '[data-testimonial-clone="true"]';
  var pos = 0;
  var speed = 0.7;
  var cycleDistance = 0;
  var paused = false;
  var running = false;

  function requestFrame(callback) {
    try {
      if (typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame(callback);
      }
    } catch (error) {
      console.error('[Drivarc diagnostics][testimonials] requestAnimationFrame failed', error);
    }

    return window.setTimeout(function () {
      callback(window.performance && typeof window.performance.now === 'function' ? window.performance.now() : Date.now());
    }, 16);
  }

  function normalizePosition(value) {
    if (cycleDistance <= 0) return value;

    while (value < -cycleDistance * 2) {
      value += cycleDistance;
    }

    while (value > -cycleDistance) {
      value -= cycleDistance;
    }

    return value;
  }

  function setTrackPosition(value) {
    pos = normalizePosition(value);
    track.style.transform = 'translate3d(' + pos + 'px, 0, 0)';
  }

  function activateStaticFallback(reason, error) {
    if (fallbackApplied) return;
    fallbackApplied = true;
    running = false;

    Array.prototype.slice.call(track.querySelectorAll(cloneMarker)).forEach(function (node) {
      node.remove();
    });

    track.style.transform = '';
    swiper.style.transform = '';
    track.style.removeProperty('display');
    track.style.removeProperty('grid-template-columns');
    track.style.removeProperty('gap');
    track.style.removeProperty('justify-content');
    wrapper.classList.add('testimonials-static');
    if (section) section.classList.add('testimonials-static');

    diagnostics('testimonials', {
      phase: 'static-fallback',
      reason: reason,
      error: error ? error.message : undefined,
      cardCount: cards.length,
      forceLog: true
    });

    console.warn('[Drivarc diagnostics][testimonials] static fallback', {
      reason: reason,
      error: error ? error.message : undefined
    });
  }

  if (featureMatrix.prefersReducedMotion || !featureMatrix.supportsRequestAnimationFrame || !featureMatrix.supportsTransform3d) {
    activateStaticFallback(
      featureMatrix.prefersReducedMotion
        ? 'prefers-reduced-motion'
        : (!featureMatrix.supportsRequestAnimationFrame ? 'requestAnimationFrame-missing' : 'transform-3d-unsupported')
    );
    return;
  }

  if (!featureMatrix.supportsMaskImage) {
    diagnostics('testimonials', {
      phase: 'feature-warning',
      reason: 'mask-image-unsupported',
      cardCount: cards.length,
      forceLog: true
    });
  }

  // Prepend clone set (for right-swipe / previous cards)
  for (var i = cards.length - 1; i >= 0; i--) {
    var c = cards[i].cloneNode(true);
    c.removeAttribute('id');
    c.setAttribute('data-testimonial-clone', 'true');
    track.insertBefore(c, track.firstChild);
  }

  // Append clone set (for left-swipe / next cards and loop)
  cards.forEach(function (c) {
    var clone = c.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('data-testimonial-clone', 'true');
    track.appendChild(clone);
  });

  function measure() {
    try {
      var n = cards.length;
      var firstOriginal = track.children[n].getBoundingClientRect();
      var firstClone = track.children[n * 2].getBoundingClientRect();
      cycleDistance = firstClone.left - firstOriginal.left;

      if (!cycleDistance || cycleDistance < 1) {
        throw new Error('Invalid slide distance: ' + cycleDistance);
      }

      setTrackPosition(-cycleDistance);
      diagnostics('testimonials', {
        phase: 'measured',
        maxDist: Math.round(cycleDistance),
        cardCount: cards.length
      });
    } catch (error) {
      activateStaticFallback('measure-error', error);
    }
  }

  function animate() {
    if (!running || fallbackApplied) return;

    try {
      if (!paused) {
        setTrackPosition(pos - speed);
      }

      requestFrame(animate);
    } catch (error) {
      activateStaticFallback('animate-error', error);
    }
  }

  function start() {
    try {
      measure();
      if (fallbackApplied) return;

      setTrackPosition(pos);
      running = true;

      diagnostics('testimonials', {
        phase: 'started',
        maxDist: Math.round(cycleDistance),
        speed: speed,
        cardCount: cards.length,
        forceLog: true
      });

      animate();
    } catch (error) {
      activateStaticFallback('start-error', error);
    }
  }

  requestFrame(start);

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

  if ('PointerEvent' in window) {
    wrapper.addEventListener('pointerenter', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      paused = true;
    });

    wrapper.addEventListener('pointerleave', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      paused = false;
    });
  }

  function onDragStart(clientX) {
    dragging = true;
    startX = clientX;
    currentX = clientX;
    paused = true;
    clearTimeout(hoverTimer);
  }

  function onDragMove(clientX) {
    if (!dragging || fallbackApplied) return;
    currentX = clientX;
    var dx = currentX - startX;
    swiper.style.transform = 'translate3d(' + dx + 'px, 0, 0)';
  }

  function onDragEnd() {
    if (fallbackApplied) return;
    dragging = false;
    var dx = currentX - startX;
    setTrackPosition(pos + dx);
    swiper.style.transform = '';
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function () {
      paused = false;
    }, 50);
  }

  wrapper.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    onDragStart(e.clientX);
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    onDragMove(e.clientX);
    e.preventDefault();
  });

  document.addEventListener('mouseup', function (e) {
    if (!dragging) return;
    onDragEnd();
  });

  wrapper.addEventListener('touchstart', function (e) {
    try {
      onDragStart(e.touches[0].clientX);
      diagnostics('testimonials', {
        phase: 'touchstart',
        cardCount: cards.length
      });
    } catch (error) {
      activateStaticFallback('touchstart-error', error);
    }
  });

  wrapper.addEventListener('touchmove', function (e) {
    if (!dragging || fallbackApplied) return;
    try {
      e.preventDefault();
      onDragMove(e.touches[0].clientX);
    } catch (error) {
      activateStaticFallback('touchmove-error', error);
    }
  }, { passive: false });

  wrapper.addEventListener('touchend', function () {
    if (fallbackApplied) return;
    try {
      onDragEnd();
    } catch (error) {
      activateStaticFallback('touchend-error', error);
    }
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
      try {
        measure();
        if (fallbackApplied) return;
        diagnostics('testimonials', {
          phase: 'resize-measured',
          maxDist: Math.round(cycleDistance),
          cardCount: cards.length
        });
      } catch (error) {
        activateStaticFallback('resize-error', error);
      }
    }, 300);
  });
})();
