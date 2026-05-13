(function () {
  'use strict';

  var track = document.getElementById('testimonialsTrack');
  var wrapper = document.getElementById('testimonialsWrapper');
  var swiper = document.getElementById('testimonialsSwiper');
  var section = document.getElementById('testimonials');
  if (!track || !wrapper || !swiper) return;

  var diagnostics = function (scope, data) {
    if (!window.__DRIVARC_DIAGNOSTICS__ && !(data && data.forceLog)) return;
    if (typeof console === 'undefined') return;
    var payload = data || {};
    if (typeof console.debug === 'function') {
      console.debug('[diagnostics:' + scope + ']', payload);
    } else if (typeof console.log === 'function') {
      console.log('[diagnostics:' + scope + ']', payload);
    }
  };

  var featureMatrix = window.drivarcRuntimeFeatures || {
    prefersReducedMotion: typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
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
    wrapperWidth: 0,
    trackWidth: 0,
    forceLog: true
  });

  var fallbackApplied = false;
  var autoScrollDisabled = featureMatrix.prefersReducedMotion;
  var cloneMarker = '[data-testimonial-clone="true"]';
  var pos = 0;
  var speed = 65;
  var cycleDistance = 0;
  var paused = autoScrollDisabled;
  var running = false;
  var lastAnimationTime = 0;

  function requestFrame(callback) {
    try {
      if (typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame(callback);
      }
    } catch (error) {
      diagnostics('testimonials', {
        phase: 'request-frame-fallback',
        reason: 'requestAnimationFrame-threw',
        errorName: error && error.name ? error.name : 'Error',
        errorMessage: error && error.message ? error.message : String(error),
        forceLog: true
      });
    }

    return window.setTimeout(function () {
      callback(window.performance && typeof window.performance.now === 'function' ? window.performance.now() : Date.now());
    }, 16);
  }

  function normalizePosition(value) {
    if (cycleDistance <= 0) return value;

    var range = -cycleDistance * 2;
    var normalized = (value - range) % cycleDistance;
    if (normalized < 0) normalized += cycleDistance;

    return range + normalized;
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

    if (section) section.setAttribute('data-testimonials-state', 'fallback-' + reason);

    diagnostics('testimonials', {
      phase: 'static-fallback',
      reason: reason,
      error: error ? error.message : undefined,
      cardCount: cards.length,
      forceLog: true
    });

  }

  if (autoScrollDisabled) {
    if (section) section.setAttribute('data-testimonials-state', 'reduced-motion');
    diagnostics('testimonials', {
      phase: 'reduced-motion-mode',
      reason: 'prefers-reduced-motion',
      cardCount: cards.length,
      forceLog: true
    });
  }

  if (!featureMatrix.supportsRequestAnimationFrame || !featureMatrix.supportsTransform3d) {
    activateStaticFallback(
      !featureMatrix.supportsRequestAnimationFrame ? 'requestAnimationFrame-missing' : 'transform-3d-unsupported'
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

  function updateCycleDistance() {
    var n = cards.length;
    var requiredCloneIndex = n * 2;

    if (n < 1 || track.children.length <= requiredCloneIndex) {
      throw new Error(
        'Insufficient testimonial children for measurement. children=' +
          track.children.length +
          ', cards=' +
          n
      );
    }

    var firstOriginalEl = track.children[n];
    var firstCloneEl = track.children[requiredCloneIndex];

    if (!firstOriginalEl || !firstCloneEl) {
      throw new Error('Missing testimonial elements required for measurement.');
    }

    var firstOriginal = firstOriginalEl.getBoundingClientRect();
    var firstClone = firstCloneEl.getBoundingClientRect();
    cycleDistance = firstClone.left - firstOriginal.left;

    if (!cycleDistance || cycleDistance < 1) {
      throw new Error('Invalid slide distance: ' + cycleDistance);
    }
  }

  function measure() {
    try {
      updateCycleDistance();
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

  function animate(timestamp) {
    if (!running || fallbackApplied) return;

    try {
      if (!paused) {
        if (lastAnimationTime === 0) lastAnimationTime = timestamp;
        var dt = Math.min(timestamp - lastAnimationTime, 50);
        lastAnimationTime = timestamp;
        setTrackPosition(pos - speed * (dt / 1000));
      } else {
        lastAnimationTime = 0;
      }

      requestFrame(animate);
    } catch (error) {
      activateStaticFallback('animate-error', error);
    }
  }

  function startAnimation(timestamp) {
    if (!autoScrollDisabled) {
      animate(timestamp || 0);
    }
  }

  // Apply initial position synchronously so no frame renders without the transform
  measure();
  if (!fallbackApplied) {
    setTrackPosition(pos);
    running = true;

    diagnostics('testimonials', {
      phase: autoScrollDisabled ? 'started-reduced-motion' : 'started',
      maxDist: Math.round(cycleDistance),
      speed: autoScrollDisabled ? 0 : speed,
      cardCount: cards.length,
      forceLog: true
    });

    if (section) section.setAttribute('data-testimonials-state', autoScrollDisabled ? 'reduced-motion' : 'running');

    requestFrame(startAnimation);
  }

  var hoverTimer = null;
  var resizeTimer = null;
  var startX = 0;
  var startY = 0;
  var currentX = 0;
  var currentY = 0;
  var dragging = false;
  var isDraggingHorizontally = null;
  var dragTouchId = null;

  if ('PointerEvent' in window) {
    wrapper.addEventListener('pointerenter', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      paused = true;
    });

    wrapper.addEventListener('pointerleave', function (event) {
      if (autoScrollDisabled) return;
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      paused = false;
    });
  } else {
    wrapper.addEventListener('mouseenter', function () {
      paused = true;
    });

    wrapper.addEventListener('mouseleave', function () {
      if (autoScrollDisabled) return;
      paused = false;
    });
  }

  function onDragStart(clientX, clientY) {
    dragging = true;
    startX = clientX;
    startY = clientY;
    currentX = clientX;
    currentY = clientY;
    isDraggingHorizontally = null;
    paused = true;
    clearTimeout(hoverTimer);
  }

  function onDragMove(clientX, clientY) {
    if (!dragging || fallbackApplied) return;
    currentX = clientX;
    currentY = clientY;
    
    if (isDraggingHorizontally === null) {
      var dx = Math.abs(currentX - startX);
      var dy = Math.abs(currentY - startY);
      if (dx > 5 || dy > 5) {
        isDraggingHorizontally = dx > dy;
      }
    }
    
    if (isDraggingHorizontally) {
      var dx = currentX - startX;
      swiper.style.transform = 'translate3d(' + dx + 'px, 0, 0)';
    }
  }

  function onDragEnd() {
    if (fallbackApplied) return;
    dragging = false;
    if (isDraggingHorizontally) {
      var dx = currentX - startX;
      setTrackPosition(pos + dx);
    }
    swiper.style.transform = '';
    isDraggingHorizontally = null;
    dragTouchId = null;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function () {
      if (autoScrollDisabled) return;
      paused = false;
    }, 50);
  }

  wrapper.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    onDragStart(e.clientX, e.clientY);
    e.preventDefault();
  });

  function onDocumentMouseMove(e) {
    if (!dragging) return;
    onDragMove(e.clientX, e.clientY);
    if (isDraggingHorizontally) {
      e.preventDefault();
    }
  }

  function onDocumentMouseUp() {
    if (!dragging) return;
    onDragEnd();
  }

  document.addEventListener('mousemove', onDocumentMouseMove);
  document.addEventListener('mouseup', onDocumentMouseUp);

  function cleanupDocumentListeners() {
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
  }

  window.addEventListener('pagehide', cleanupDocumentListeners);
  window.addEventListener('beforeunload', cleanupDocumentListeners);

  // Touch: scroll-safe swipe detection
  // Do NOT use passive:false — it blocks mobile scroll entirely.
  // Track touch on the wrapper only when horizontal swipe is likely.
  wrapper.addEventListener('touchstart', function (e) {
    try {
      if (dragTouchId !== null) return;
      dragTouchId = e.changedTouches[0].identifier;
      onDragStart(e.touches[0].clientX, e.touches[0].clientY);
    } catch (error) {
      activateStaticFallback('touchstart-error', error);
    }
  }, { passive: true });

  wrapper.addEventListener('touchmove', function (e) {
    if (!dragging || fallbackApplied) return;
    try {
      // Only handle the tracked touch
      var touch = null;
      for (var i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === dragTouchId) {
          touch = e.changedTouches[i];
          break;
        }
      }
      if (!touch) return;
      
      onDragMove(touch.clientX, touch.clientY);
      // Cannot preventDefault in passive mode — scroll is always preserved.
      // Horizontal swipe visual feedback still works.
    } catch (error) {
      activateStaticFallback('touchmove-error', error);
    }
  }, { passive: true });

  wrapper.addEventListener('touchend', function (e) {
    if (fallbackApplied) return;
    try {
      onDragEnd();
    } catch (error) {
      activateStaticFallback('touchend-error', error);
    }
  }, { passive: true });

  wrapper.addEventListener('touchcancel', function () {
    dragging = false;
    swiper.style.transform = '';
    if (!autoScrollDisabled) paused = false;
    clearTimeout(hoverTimer);
  });

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      try {
        updateCycleDistance();
        if (fallbackApplied) return;
        diagnostics('testimonials', {
          phase: 'resize-updated',
          maxDist: Math.round(cycleDistance),
          cardCount: cards.length
        });
      } catch (error) {
        activateStaticFallback('resize-error', error);
      }
    }, 300);
  });
})();
