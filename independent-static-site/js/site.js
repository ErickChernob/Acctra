/*!
 * ACCTRA site.js
 * Plain, dependency-free JavaScript replacing Webflow's runtime (webflow.js) for:
 *  - touch/js feature-detection classes on <html>
 *  - mobile navigation open/close (reuses Webflow's own CSS hooks: [data-nav-menu-open] / .w--open)
 *  - scroll-reveal animations (fade / slide-up / grow), replacing Webflow's IX2 "Scroll into View" effects
 *
 * Progressive enhancement: every element this script animates is real, visible content in the HTML.
 * If this script fails to load or run, a <noscript> rule (in each page's <head>) and the safety net
 * below force full visibility, so nothing is ever permanently hidden without JavaScript.
 */
(function () {
  "use strict";

  /* Note: the tiny "w-mod-js" / "w-mod-touch" feature-detection snippet still runs
     inline in each page's <head> (kept as-is - it's plain vanilla JS with no Webflow
     dependency, and running it before first paint avoids a flash for the CSS that
     reads html.w-mod-touch). It is not duplicated here. */

  /* 1. Mobile navigation toggle
     Webflow's CSS (css/webflow.css) already contains all the show/hide rules keyed off:
       - the navbar's [data-collapse] attribute (responsive breakpoint)
       - [data-nav-menu-open] on the menu element
       - .w--open on the toggle button
     so we only need to toggle those same hooks; no new CSS is required. */
  function initNav(navbar) {
    var menu = navbar.querySelector(".w-nav-menu");
    var button = navbar.querySelector(".w-nav-button");
    if (!menu || !button) return;

    function isOpen() {
      return menu.hasAttribute("data-nav-menu-open");
    }

    function openMenu() {
      menu.setAttribute("data-nav-menu-open", "");
      button.classList.add("w--open");
      button.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      menu.removeAttribute("data-nav-menu-open");
      button.classList.remove("w--open");
      button.setAttribute("aria-expanded", "false");
    }

    button.setAttribute("role", "button");
    button.setAttribute("tabindex", "0");
    button.setAttribute("aria-label", "Menu");
    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", function () {
      isOpen() ? closeMenu() : openMenu();
    });
    button.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        isOpen() ? closeMenu() : openMenu();
      }
    });

    /* Close the menu after a link inside it is followed, on outside click, and on Escape */
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("click", function (e) {
      if (isOpen() && !navbar.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) closeMenu();
    });

    /* Reset state when resizing back to desktop */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 991) closeMenu();
    });
  }

  document.querySelectorAll(".w-nav").forEach(initNav);

  /* 2. Scroll-reveal animations
     Configuration below was extracted directly from the site's original Webflow IX2
     interaction data (js/webflow.js -> Webflow.require("ix2").init(...)), keyed by the
     same data-w-id values already present in the markup. Effects/durations/easings match
     Webflow's "fadeIn", "slideInBottom" and "growIn" presets (opacity 0->1 over 1000ms,
     outQuart easing; slide adds a 100px upward translate; grow adds a 0.75->1 scale). */
  var REVEAL_CONFIG = {
    "019c3a89-cccb-fddd-b8b5-6fd43b8e9dc8": { effect: "slide", delay: 550 },
    "05af6405-763c-da21-d1d0-a3dc2fef0e40": { effect: "slide", delay: 250 },
    "05af6405-763c-da21-d1d0-a3dc2fef0e42": { effect: "slide", delay: 350 },
    "05af6405-763c-da21-d1d0-a3dc2fef0e44": { effect: "slide", delay: 450 },
    "05af6405-763c-da21-d1d0-a3dc2fef0e46": { effect: "slide", delay: 550 },
    "66d8afd782991ca9e4fcf24800000000000b": { effect: "slide", delay: 250 },
    "09973273-c8a4-e412-bd7e-c098a9c2faa7": { effect: "slide", delay: 350 },
    "0a0b49af-23b0-5822-d319-3cf64f7103f3": { effect: "slide", delay: 250 },
    "0a0b49af-23b0-5822-d319-3cf64f7103fc": { effect: "slide", delay: 350 },
    "0a0b49af-23b0-5822-d319-3cf64f710405": { effect: "slide", delay: 450 },
    "0c5faa6b-a3f7-3d99-b40b-106013b84d28": { effect: "slide", delay: 350 },
    "16b69460-66f0-c83d-2c5f-5e56a35c1391": { effect: "fade", delay: 250 },
    "16b69460-66f0-c83d-2c5f-5e56a35c1393": { effect: "slide", delay: 250, tinyOnly: true },
    "16b69460-66f0-c83d-2c5f-5e56a35c1395": { effect: "slide", delay: 250, tinyOnly: true },
    "16b69460-66f0-c83d-2c5f-5e56a35c1397": { effect: "slide", delay: 250, tinyOnly: true },
    "1d54e20a-0da0-ac1a-f5ca-165ac2479408": { effect: "fade", delay: 550 },
    "42145e56-9b92-02a8-ebd6-60c5940ebe30": { effect: "fade", delay: 100 },
    "42145e56-9b92-02a8-ebd6-60c5940ebe31": { effect: "fade", delay: 0 },
    "649b6887-9a86-5f5b-3f37-3b28e12819bf": { effect: "fade", delay: 450 },
    "7a261098-6246-4cf2-8810-66308b5aa9d2": { effect: "slide", delay: 550 },
    "7dbe3024-2534-9a7c-b857-a1cff92264f9": { effect: "slide", delay: 350 },
    "87eb6bc4-11f4-c138-41ab-f278fcfa9472": { effect: "slide", delay: 250 },
    "9e763bc9-30bb-9a88-ed16-b136e8f7b8ba": { effect: "slide", delay: 350 },
    "87eb6bc4-11f4-c138-41ab-f278fcfa947c": { effect: "slide", delay: 300 },
    "87eb6bc4-11f4-c138-41ab-f278fcfa9487": { effect: "slide", delay: 250 },
    "87eb6bc4-11f4-c138-41ab-f278fcfa9491": { effect: "slide", delay: 300 },
    "93f4457d-ec22-3c66-b213-0b7ef6a67132": { effect: "grow", delay: 450 },
    "93f4457d-ec22-3c66-b213-0b7ef6a67134": { effect: "slide", delay: 250 },
    "93f4457d-ec22-3c66-b213-0b7ef6a6715f": { effect: "slide", delay: 250 },
    "93f4457d-ec22-3c66-b213-0b7ef6a67168": { effect: "slide", delay: 250 },
    "aa42755f-aac4-abbd-e604-8f2924a89a23": { effect: "slide", delay: 350 },
    "aa42755f-aac4-abbd-e604-8f2924a89a26": { effect: "slide", delay: 450 },
    "ae73a4fa-4647-403b-a6f8-ac6ec692aaf8": { effect: "slide", delay: 250 },
    "ae73a4fa-4647-403b-a6f8-ac6ec692aafa": { effect: "slide", delay: 350 },
    "ae73a4fa-4647-403b-a6f8-ac6ec692aafc": { effect: "slide", delay: 450 },
    "ae73a4fa-4647-403b-a6f8-ac6ec692aafe": { effect: "slide", delay: 550 },
    "ae73a4fa-4647-403b-a6f8-ac6ec692ab00": { effect: "slide", delay: 650 },
    "b063efcf-b404-c1ec-7d87-e726ec74cfb1": { effect: "fade", delay: 150 }
  };

  var EASE_OUT_QUART = "cubic-bezier(0.25, 1, 0.5, 1)";
  var DURATION = 1000;

  function forceVisible(el) {
    el.style.transition = "none";
    el.style.opacity = "1";
    el.style.transform = "none";
  }

  function revealElement(el) {
    requestAnimationFrame(function () {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  function initReveal() {
    var elements = document.querySelectorAll("[data-w-id]");
    var animated = [];

    elements.forEach(function (el) {
      var id = el.getAttribute("data-w-id");
      var cfg = REVEAL_CONFIG[id];
      if (!cfg) return;
      if (cfg.tinyOnly && window.innerWidth > 479) return; // this effect only ran at the "tiny" Webflow breakpoint

      el.style.transitionProperty = "opacity, transform";
      el.style.transitionDuration = DURATION + "ms, " + DURATION + "ms";
      el.style.transitionTimingFunction = EASE_OUT_QUART;
      el.style.transitionDelay = cfg.delay + "ms, " + cfg.delay + "ms";

      if (cfg.effect === "slide") el.style.transform = "translateY(100px)";
      if (cfg.effect === "grow") el.style.transform = "scale(0.75)";
      /* opacity: 0 is already set inline in the HTML for these elements */

      animated.push(el);
    });

    if (!animated.length) return;

    if (!("IntersectionObserver" in window)) {
      animated.forEach(forceVisible);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );

    animated.forEach(function (el) {
      observer.observe(el);
    });

    /* Safety net: anything still hidden a few seconds after load (e.g. inside a
       display:none ancestor at load time) is force-revealed rather than left blank. */
    window.setTimeout(function () {
      animated.forEach(function (el) {
        if (parseFloat(getComputedStyle(el).opacity) === 0) revealElement(el);
      });
    }, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReveal);
  } else {
    initReveal();
  }
})();
