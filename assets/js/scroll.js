/**
 * Nithinlabs scroll engine — pure helpers + rAF --p writer.
 * Loaded before main.js. Exports for Node tests via module.exports.
 */
(function (root) {
  'use strict';

  /**
   * Map an element's position to 0..1 scroll progress.
   * 0 = still below the viewport, 1 = fully above / past, ~0.5 when centered.
   * @param {{ top: number, height: number }} rect
   * @param {number} viewportH
   * @returns {number}
   */
  function progressFor(rect, viewportH) {
    var h = Math.max(1, viewportH || 1);
    var top = Number(rect && rect.top);
    var height = Math.max(0, Number(rect && rect.height) || 0);
    if (!Number.isFinite(top)) return 0;
    var bottom = top + height;
    if (top >= h) return 0;
    if (bottom <= 0) return 1;
    // Progress as the element's mid-point travels from viewport bottom to top
    var mid = top + height / 2;
    var start = h;
    var end = 0;
    var p = (start - mid) / (start - end);
    if (p < 0) return 0;
    if (p > 1) return 1;
    return p;
  }

  /**
   * Map 0..1 progress to a discrete step index in [0, count-1].
   * @param {number} progress
   * @param {number} count
   * @returns {number}
   */
  function stepFor(progress, count) {
    var n = Number(count);
    if (!n || n < 1 || !Number.isFinite(n)) return 0;
    var p = Number(progress);
    if (!Number.isFinite(p)) p = 0;
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    var idx = Math.floor(p * n);
    if (idx >= n) idx = n - 1;
    if (idx < 0) idx = 0;
    return idx;
  }

  var api = { progressFor: progressFor, stepFor: stepFor };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    root.NLScroll = api;
    return;
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = [];
  var visible = new Set();
  var ticking = false;
  var started = false;

  function measureAndWrite() {
    ticking = false;
    if (reduceMotion) return;
    var vh = window.innerHeight || document.documentElement.clientHeight || 1;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!visible.has(el)) continue;
      var r = el.getBoundingClientRect();
      var p = progressFor({ top: r.top, height: r.height }, vh);
      el.style.setProperty('--p', String(p));
      el.dispatchEvent(
        new CustomEvent('nl:scroll', {
          bubbles: false,
          detail: { progress: p, step: stepFor(p, Number(el.getAttribute('data-scroll-steps')) || 0) },
        })
      );
    }
  }

  function requestTick() {
    if (ticking || reduceMotion) return;
    ticking = true;
    requestAnimationFrame(measureAndWrite);
  }

  function start() {
    if (started) return;
    started = true;
    els = Array.prototype.slice.call(document.querySelectorAll('[data-scroll]'));
    if (!els.length || reduceMotion) {
      els.forEach(function (el) {
        el.style.setProperty('--p', '0');
      });
      return;
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) visible.add(entry.target);
            else visible.delete(entry.target);
          });
          requestTick();
        },
        { rootMargin: '20% 0px 20% 0px', threshold: [0, 0.01, 0.25, 0.5, 0.75, 1] }
      );
      els.forEach(function (el) {
        io.observe(el);
      });
    } else {
      els.forEach(function (el) {
        visible.add(el);
      });
    }

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });
    requestTick();
  }

  api.start = start;
  api.progressFor = progressFor;
  api.stepFor = stepFor;
  root.NLScroll = api;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
