/*!
 * ACCTRA scroll-progress.js
 * Recreates the two Webflow IX2 "scroll progress" (scrub) interactions found in the
 * original js/webflow.js config: the home page hero image collage ("Home Hero Scale")
 * and the services page hero image parallax ("Image Scroll"). Both are decorative,
 * continuous, scroll-position-driven effects (not scroll-into-view reveals).
 * No-ops safely if the relevant elements aren't present on the current page.
 */
(function () {
  "use strict";

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* Interpolates a numeric value across a keyframe list: [{ at: 0-100, value }, ...] */
  function valueAt(keyframes, progressPct) {
    if (progressPct <= keyframes[0].at) return keyframes[0].value;
    var last = keyframes[keyframes.length - 1];
    if (progressPct >= last.at) return last.value;
    for (var i = 0; i < keyframes.length - 1; i++) {
      var a = keyframes[i];
      var b = keyframes[i + 1];
      if (progressPct >= a.at && progressPct <= b.at) {
        var t = b.at === a.at ? 0 : (progressPct - a.at) / (b.at - a.at);
        return lerp(a.value, b.value, t);
      }
    }
    return last.value;
  }

  var rafPending = false;
  function onScrollFrame(fn) {
    window.addEventListener(
      "scroll",
      function () {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(function () {
          fn();
          rafPending = false;
        });
      },
      { passive: true }
    );
    window.addEventListener("resize", fn);
  }

  /* ---- 1. Home hero image collage (index.html, ".about-hero-interaction") ----
     A 200vh-tall wrapper holds a position:sticky component with 3 absolutely
     positioned image tiles (left/middle/right). As the wrapper scrolls through
     the viewport, the tiles grow from 3 separate 30vw squares into a single
     90vw/90vh composition, then the outer two slide apart to reveal the middle
     one full-width. Keyframes below are taken directly from the original IX2
     "Home Hero Scale" action list (keyframe = % scrolled through the wrapper). */
  function initHomeHero() {
    var wrapper = document.querySelector(".about-hero-interaction");
    if (!wrapper) return;
    var left = wrapper.querySelector(".sticky-images.left");
    var middle = wrapper.querySelector(".sticky-images.middle");
    var right = wrapper.querySelector(".sticky-images.right");
    if (!left || !middle || !right) return;

    var widthKF = [
      { at: 0, value: 30 },
      { at: 50, value: 90 }
    ];
    var sideHeightKF = [
      { at: 0, value: 50 },
      { at: 50, value: 90 }
    ];
    var middleHeightKF = [
      { at: 0, value: 50 },
      { at: 50, value: 90 }
    ];
    var sideXKF = [
      { at: 2, value: 0 },
      { at: 60, value: 40 }
    ];
    var sideYKF = [
      { at: 2, value: 0 },
      { at: 60, value: -5 }
    ];
    var middleYKF = [
      { at: 10, value: 0 },
      { at: 50, value: 0 }
    ];

    function update() {
      if (window.innerWidth <= 479) {
        /* This interaction only ran at "main/medium/small" breakpoints in Webflow;
           on the smallest ("tiny") breakpoint the layout is static (stacked, position:
           static, per CSS). Only clear the width/height *this* effect controls - the
           opacity/transform slide-in on these same elements at this breakpoint belongs
           to the separate scroll-reveal system (js/site.js) and must be left alone here,
           or the two scripts fight over the element's inline style. */
        [left, middle, right].forEach(function (el) {
          el.style.width = "";
          el.style.height = "";
        });
        return;
      }

      var rect = wrapper.getBoundingClientRect();
      var scrollable = rect.height - window.innerHeight;
      var progress = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) * 100 : 0;

      var w = valueAt(widthKF, progress);
      var sideH = valueAt(sideHeightKF, progress);
      var midH = valueAt(middleHeightKF, progress);
      var sideX = valueAt(sideXKF, progress);
      var sideY = valueAt(sideYKF, progress);
      var midY = valueAt(middleYKF, progress);

      left.style.width = w + "vw";
      left.style.height = sideH + "vh";
      left.style.transform = "translate(" + -sideX + "vw, " + sideY + "vh)";

      right.style.width = w + "vw";
      right.style.height = sideH + "vh";
      right.style.transform = "translate(" + sideX + "vw, " + sideY + "vh)";

      middle.style.width = w + "vw";
      middle.style.height = midH + "vh";
      middle.style.transform = "translate(0, " + midY + "px)";
    }

    update();
    onScrollFrame(update);
  }

  /* ---- 2. Services page hero image parallax (servicios.html, ".features-hero-image") ----
     A single hero photo scales down slightly and settles into place as it scrolls
     through the viewport, from the original IX2 "Image Scroll" action list. */
  function initServicesHero() {
    var wrapper = document.querySelector(".features-hero-image");
    if (!wrapper) return;
    var img = wrapper.querySelector(".image");
    if (!img) return;

    var scaleKF = [
      { at: 0, value: 1.3 },
      { at: 100, value: 1 }
    ];
    var yKF = [
      { at: 0, value: -5 },
      { at: 100, value: 0 }
    ];

    function update() {
      var rect = wrapper.getBoundingClientRect();
      var total = window.innerHeight + rect.height;
      var progress = clamp((window.innerHeight - rect.top) / total, 0, 1) * 100;

      var scale = valueAt(scaleKF, progress);
      var y = valueAt(yKF, progress);

      img.style.transform = "scale(" + scale + ") translateY(" + y + "vw)";
    }

    update();
    onScrollFrame(update);
  }

  function init() {
    initHomeHero();
    initServicesHero();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
