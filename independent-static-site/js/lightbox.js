/*!
 * ACCTRA lightbox.js
 * Small, dependency-free replacement for Webflow's lightbox component, used only on
 * proyectos.html. The original markup pulled full-resolution gallery images from
 * Webflow's CDN (cdn.prod.website-files.com) via inline "w-json" data; those images
 * already exist locally in /images at equal or better resolution, so this script
 * uses local paths only - no external image host is required any more.
 *
 * Groups/images below were derived from the original w-json blocks in proyectos.html,
 * matched to their local /images equivalents.
 */
(function () {
  "use strict";

  var GALLERIES = {
    "1": [
      "Foto-1-Transformador-130-MVA-230-KV.jpeg",
      "Foto-3-Izaje-de-transformador-tipo-horno.jpg",
      "Foto-3-Maniobras-de-desplazamiento-transformador-Horno.jpg",
      "Foto-3.-Maniobras-de-carga-de-Transformador-tipo-Horno.jpg",
      "f3.png",
      "Foto-2.-Transformador-tipo-Horno.jpg",
      "Foto-3.-Permuta-transformadores-tipo-Horno.jpg"
    ],
    "2": [
      "Foto-1.-Cambio-de-boquilla-clase-400-KV.JPG",
      "f1_2.jpg",
      "Foto-1.-Pruebas-electricas-a-transformador-clase-400-KV.jpg",
      "Foto-2-Mantenimiento-preventivo-a-transformafor-de-potencia-en-Parque-fotovoltaico.jpg",
      "Foto-2.-Cambio-de-Boquilla-clase-230-KVA-en-Parque-Eolico-p-1080.jpg",
      "f3_2.jpg",
      "Foto-2.-Inspeccion-final-a-transformador-GSU-clase-230-KV.jpg",
      "f4_2.jpg"
    ],
    "3": [
      "Foto-1.-Mantenimiento-a-conjunto-interno-transformador-rectificador-20-MVA.jpg",
      "Foto-1.-Modernizacion-de-transformador-rectificador-de-20-MVA.jpg",
      "Foto-2.-Maniobras-hombre-de-transformador-rectificador.jpg",
      "Foto-2.--Pruebas-de-diagnostico-TR-rectificador.jpg",
      "Foto-3.--Mantenimiento-correctivo-a-transformador-tipo-Horno.jpg",
      "Foto-2-Retiro-de-conjunto-interno.jpg",
      "Foto-2.-Retiro-de-conjunto-interno-transformador-rectificador.jpg",
      "Foto-2.-Mantenimiento-correctivo-a-transformador-rectificador.jpg"
    ],
    "4": ["Foto1.-Puesta-en-servicio-2-transformadores-de-potencia.jpg", "4-2.jpeg"]
  };

  var IMAGE_BASE = "images/";

  var modal, imgEl, counterEl, closeBtn, prevBtn, nextBtn;
  var currentGroup = null;
  var currentIndex = 0;
  var lastFocused = null;

  function buildModal() {
    modal = document.createElement("div");
    modal.className = "acctra-lightbox";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Visor de imágenes");
    modal.hidden = true;
    modal.innerHTML =
      '<div class="acctra-lightbox__backdrop"></div>' +
      '<button type="button" class="acctra-lightbox__close" aria-label="Cerrar">&times;</button>' +
      '<button type="button" class="acctra-lightbox__prev" aria-label="Anterior">&#10094;</button>' +
      '<figure class="acctra-lightbox__figure">' +
      '<img class="acctra-lightbox__img" alt="">' +
      '<figcaption class="acctra-lightbox__counter"></figcaption>' +
      "</figure>" +
      '<button type="button" class="acctra-lightbox__next" aria-label="Siguiente">&#10095;</button>';
    document.body.appendChild(modal);

    imgEl = modal.querySelector(".acctra-lightbox__img");
    counterEl = modal.querySelector(".acctra-lightbox__counter");
    closeBtn = modal.querySelector(".acctra-lightbox__close");
    prevBtn = modal.querySelector(".acctra-lightbox__prev");
    nextBtn = modal.querySelector(".acctra-lightbox__next");

    closeBtn.addEventListener("click", close);
    modal.querySelector(".acctra-lightbox__backdrop").addEventListener("click", close);
    prevBtn.addEventListener("click", function () {
      show(currentIndex - 1);
    });
    nextBtn.addEventListener("click", function () {
      show(currentIndex + 1);
    });
    document.addEventListener("keydown", function (e) {
      if (modal.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(currentIndex - 1);
      if (e.key === "ArrowRight") show(currentIndex + 1);
    });
  }

  function show(index) {
    var list = GALLERIES[currentGroup];
    currentIndex = (index + list.length) % list.length;
    var file = list[currentIndex];
    imgEl.src = IMAGE_BASE + file;
    imgEl.alt = "";
    counterEl.textContent = currentIndex + 1 + " / " + list.length;
    var multiple = list.length > 1;
    prevBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
  }

  function open(group, startFile) {
    if (!GALLERIES[group]) return;
    if (!modal) buildModal();
    currentGroup = group;
    lastFocused = document.activeElement;
    var startIndex = GALLERIES[group].indexOf(startFile);
    show(startIndex === -1 ? 0 : startIndex);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function init() {
    var links = document.querySelectorAll(".lightbox-link[data-lightbox-group]");
    if (!links.length) return;

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var group = link.getAttribute("data-lightbox-group");
        var startFile = link.getAttribute("data-lightbox-start");
        open(group, startFile);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
