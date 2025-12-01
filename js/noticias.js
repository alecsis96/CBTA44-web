import { supabaseClient } from './supabase-config.js';
import { showNotification } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    loadEvents();
});

async function loadNews() {
    const container = document.getElementById('newsContainer');
    if (!container) return;

    try {
        const { data: news, error } = await supabaseClient
            .from('noticias')
            .select('*')

            .order('fecha_publicacion', { ascending: false });

        if (error) throw error;

        if (!news || news.length === 0) {
            container.innerHTML = '<p class="text-center text-gray">No hay noticias recientes.</p>';
            return;
        }

        container.innerHTML = news.map(item => `
            <div class="news-card card mb-lg">
                ${item.imagen_url ? `<img src="${item.imagen_url}" alt="${item.titulo}" class="news-image">` : ''}
                <div class="card-body">
                    <div class="news-meta">
                        <span class="news-date">${new Date(item.fecha_publicacion).toLocaleDateString()}</span>
                        <span class="badge badge-primary">${item.categoria || 'General'}</span>
                    </div>
                    <h3 class="news-title">${item.titulo}</h3>
                    <p class="news-excerpt">${item.contenido.substring(0, 150)}...</p>
                    <a href="#" class="btn btn-outline btn-sm mt-md">Leer más</a>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = '<p class="text-center text-error">Error al cargar las noticias.</p>';
    }
}

async function loadEvents() {
    // This function could also fetch from Supabase if you have an events table
    // For now, it might just rely on the static one in public.js or we can move the logic here
    // Since public.js has EventCalendar class, we can use it if we want to fetch dynamic events
    // But for now, let's leave the static events in public.js or implement fetch here if needed.
    // Given the user request was about "noticias" and "galeria", I'll focus on news first.
}
