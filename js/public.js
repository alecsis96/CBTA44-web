/**
 * CBTA #44 - Funcionalidad Sección Pública (ES Module)
 */

import {
    validateEmail,
    validatePhone,
    showNotification,
    getFromStorage,
    saveToStorage,
    animateCounter
} from './utils.js';

// ===== NAVEGACIÓN =====
const header = document.getElementById('header');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Scroll effect en header
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Menu mobile toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer click en un enlace
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

// ===== HERO CAROUSEL =====
export class HeroCarousel {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.indicators = document.querySelectorAll('.hero-indicator');
        this.prevBtn = document.getElementById('heroPrev');
        this.nextBtn = document.getElementById('heroNext');
        this.currentSlide = 0;
        this.autoplayInterval = null;
        this.autoplayDelay = 5000;

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        // Event listeners para controles
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Event listeners para indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Iniciar autoplay
        this.startAutoplay();

        // Pausar autoplay al hover
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => this.stopAutoplay());
            heroSection.addEventListener('mouseleave', () => this.startAutoplay());
        }
    }

    goToSlide(index) {
        // Remover clase active de slide e indicador actual
        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide].classList.remove('active');

        // Actualizar índice
        this.currentSlide = index;

        // Agregar clase active al nuevo slide e indicador
        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.nextSlide(), this.autoplayDelay);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
}

// Inicializar carousel
let heroCarousel;
if (document.querySelector('.hero-carousel')) {
    heroCarousel = new HeroCarousel();
}

// ===== ESTADÍSTICAS ANIMADAS =====
const statsSection = document.querySelector('.stats-section');

if (statsSection) {
    let statsAnimated = false;

    const animateStats = () => {
        if (statsAnimated) return;

        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            animateCounter(stat, target, 2000);
        });

        statsAnimated = true;
    };

    // Observar cuando la sección entra en viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

// ===== ANIMACIONES SCROLL =====
const observeElements = () => {
    const elementsToAnimate = document.querySelectorAll('.animate-fade-in, .animate-slide-in-left, .animate-slide-in-right');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
};

// Inicializar animaciones
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeElements);
} else {
    observeElements();
}

// ===== FORMULARIO DE CONTACTO =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener datos del formulario
        const formData = {
            nombre: contactForm.querySelector('[name="nombre"]').value,
            email: contactForm.querySelector('[name="email"]').value,
            telefono: contactForm.querySelector('[name="telefono"]').value,
            mensaje: contactForm.querySelector('[name="mensaje"]').value,
            fecha: new Date().toISOString()
        };

        // Validaciones
        if (!validateEmail(formData.email)) {
            showNotification('Email inválido', 'error');
            return;
        }

        if (formData.telefono && !validatePhone(formData.telefono)) {
            showNotification('Teléfono inválido', 'error');
            return;
        }

        // Simular envío (en producción, enviar a API)
        try {
            // Guardar en localStorage como demo
            const mensajes = getFromStorage('contactMessages', []);
            mensajes.push(formData);
            saveToStorage('contactMessages', mensajes);

            // Mostrar mensaje de éxito
            showNotification('Mensaje enviado correctamente. Te contactaremos pronto.', 'success');

            // Limpiar formulario
            contactForm.reset();
        } catch (error) {
            showNotification('Error al enviar el mensaje. Intenta nuevamente.', 'error');
        }
    });
}

// ===== CALENDARIO DE EVENTOS =====
export class EventCalendar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.currentDate = new Date();
        this.events = this.loadEvents();
        this.render();
    }

    loadEvents() {
        // Eventos de ejemplo
        return getFromStorage('publicEvents', [
            {
                id: '1',
                title: 'Inicio de Inscripciones',
                date: '2024-02-01',
                type: 'admision'
            },
            {
                id: '2',
                title: 'Examen de Admisión',
                date: '2024-02-15',
                type: 'examen'
            },
            {
                id: '3',
                title: 'Inicio de Clases',
                date: '2024-02-26',
                type: 'academico'
            },
            {
                id: '4',
                title: 'Ceremonia de Bienvenida',
                date: '2024-02-26',
                type: 'evento'
            }
        ]);
    }

    render() {
        const upcomingEvents = this.events
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);

        if (upcomingEvents.length === 0) {
            this.container.innerHTML = '<p class="text-center text-gray">No hay eventos próximos</p>';
            return;
        }

        const html = upcomingEvents.map(event => `
      <div class="event-item card mb-md">
        <div class="card-body flex items-center gap-md">
          <div class="event-date">
            <div class="event-month">${this.getMonth(event.date)}</div>
            <div class="event-day">${this.getDay(event.date)}</div>
          </div>
          <div class="event-info">
            <h4 class="event-title">${event.title}</h4>
            <span class="badge badge-${this.getBadgeType(event.type)}">${event.type}</span>
          </div>
        </div>
      </div>
    `).join('');

        this.container.innerHTML = html;
    }

    getMonth(dateStr) {
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        return months[new Date(dateStr).getMonth()];
    }

    getDay(dateStr) {
        return new Date(dateStr).getDate();
    }

    getBadgeType(eventType) {
        const types = {
            'admision': 'primary',
            'examen': 'warning',
            'academico': 'success',
            'evento': 'info'
        };
        return types[eventType] || 'primary';
    }
}

// Inicializar calendario si existe
if (document.getElementById('eventCalendar')) {
    new EventCalendar('eventCalendar');
}

// ===== GALERÍA LIGHTBOX =====
export class Lightbox {
    constructor() {
        this.images = document.querySelectorAll('.gallery-image');
        this.currentIndex = 0;
        this.lightboxElement = null;

        this.init();
    }

    init() {
        if (this.images.length === 0) return;

        this.createLightbox();

        this.images.forEach((img, index) => {
            img.addEventListener('click', () => this.open(index));
        });
    }

    createLightbox() {
        this.lightboxElement = document.createElement('div');
        this.lightboxElement.className = 'lightbox';
        this.lightboxElement.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-prev">&lsaquo;</button>
        <img class="lightbox-image" src="" alt="">
        <button class="lightbox-next">&rsaquo;</button>
      </div>
    `;

        document.body.appendChild(this.lightboxElement);

        // Event listeners
        this.lightboxElement.querySelector('.lightbox-close').addEventListener('click', () => this.close());
        this.lightboxElement.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
        this.lightboxElement.querySelector('.lightbox-next').addEventListener('click', () => this.next());
        this.lightboxElement.addEventListener('click', (e) => {
            if (e.target === this.lightboxElement) this.close();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightboxElement.classList.contains('active')) return;

            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }

    open(index) {
        this.currentIndex = index;
        this.updateImage();
        this.lightboxElement.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.lightboxElement.classList.remove('active');
        document.body.style.overflow = '';
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }

    updateImage() {
        const img = this.lightboxElement.querySelector('.lightbox-image');
        img.src = this.images[this.currentIndex].src;
        img.alt = this.images[this.currentIndex].alt;
    }
}

// Inicializar lightbox si hay imágenes de galería
if (document.querySelectorAll('.gallery-image').length > 0) {
    new Lightbox();
}

// Añadir estilos del lightbox dinámicamente
const lightboxStyles = `
  .lightbox {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 10000;
  }
  
  .lightbox.active {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .lightbox-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  
  .lightbox-image {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
  }
  
  .lightbox-close,
  .lightbox-prev,
  .lightbox-next {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    font-size: 2rem;
    padding: 1rem;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .lightbox-close:hover,
  .lightbox-prev:hover,
  .lightbox-next:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .lightbox-close {
    top: 20px;
    right: 20px;
  }
  
  .lightbox-prev {
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .lightbox-next {
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = lightboxStyles;
document.head.appendChild(styleSheet);
