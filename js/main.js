/**
 * CBTA #44 - Funciones Globales y Utilidades (ES Module)
 */

import { lazyLoadImages, smoothScrollTo } from './utils.js';

// ===== INICIALIZACIÓN =====
// ===== INICIALIZACIÓN =====
const init = () => {
  // Lazy loading de imágenes
  if ('IntersectionObserver' in window) {
    lazyLoadImages();
  }

  // Smooth scroll para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        smoothScrollTo(href);
      }
    });
  });

  // Mobile Menu Toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    // Remover listeners previos para evitar duplicados si se ejecuta múltiples veces
    const newNavToggle = navToggle.cloneNode(true);
    navToggle.parentNode.replaceChild(newNavToggle, navToggle);

    newNavToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show-menu');
    });
  }

  // Close menu when clicking a link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('show-menu');
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
