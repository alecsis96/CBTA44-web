import { supabaseClient } from './supabase-config.js';
import { Lightbox } from './public.js';

document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
});

async function loadGallery() {
    const container = document.querySelector('.gallery-grid');
    if (!container) return;

    // Check filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    let currentFilter = 'all';

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;

            // Reload gallery with filter
            fetchImages(currentFilter);
        });
    });

    // Initial load
    fetchImages('all');
}

async function fetchImages(category) {
    const container = document.querySelector('.gallery-grid');
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Cargando...</p>';

    try {
        let query = supabaseClient
            .from('galeria')
            .select('*')
            .order('fecha_publicacion', { ascending: false });

        if (category !== 'all') {
            query = query.eq('categoria', category);
        }

        const { data: images, error } = await query;

        if (error) throw error;

        if (!images || images.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No hay imágenes en esta categoría.</p>';
            return;
        }

        container.innerHTML = images.map(img => `
            <div class="gallery-item">
                <img src="${img.imagen_url}" alt="${img.titulo}" class="gallery-image">
                <div class="gallery-overlay">
                    <h4>${img.titulo}</h4>
                    <p>${img.descripcion || ''}</p>
                </div>
            </div>
        `).join('');

        // Re-initialize Lightbox for new images
        new Lightbox();

    } catch (error) {
        console.error('Error loading gallery:', error);
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Error al cargar la galería.</p>';
    }
}
