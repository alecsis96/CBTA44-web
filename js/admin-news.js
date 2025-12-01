/**
 * Lógica para gestión de noticias en el panel de administrador
 */

import { supabaseClient } from './supabase-config.js';

// Cargar noticias al iniciar
export async function loadNews() {
    console.log('🔄 Cargando noticias...');
    const tableBody = document.getElementById('newsTableBody');

    try {
        const { data: noticias, error } = await supabaseClient
            .from('noticias')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!noticias || noticias.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay noticias registradas.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        noticias.forEach(news => {
            const date = new Date(news.fecha_publicacion).toLocaleDateString();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${news.imagen_url ? `<img src="${news.imagen_url}" class="news-image-preview" alt="Preview">` : '<span>Sin imagen</span>'}
                </td>
                <td>${news.titulo}</td>
                <td><span class="badge badge-info">${news.categoria}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="window.editNews(${news.id})">✏️</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.deleteNews(${news.id})" style="color: var(--color-danger);">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('❌ Error cargando noticias:', error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar noticias.</td></tr>';
    }
}

// Guardar noticia (Crear o Editar)
const newsForm = document.getElementById('newsForm');
if (newsForm) {
    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('newsId').value;
        const title = document.getElementById('newsTitle').value;
        const category = document.getElementById('newsCategory').value;
        const summary = document.getElementById('newsSummary').value;
        const content = document.getElementById('newsContent').value;
        const image = document.getElementById('newsImage').value;

        const newsData = {
            titulo: title,
            categoria: category,
            resumen: summary,
            contenido: content,
            imagen_url: image,
            fecha_publicacion: new Date().toISOString()
        };

        try {
            let error;
            if (id) {
                // Actualizar
                const { error: updateError } = await supabaseClient
                    .from('noticias')
                    .update(newsData)
                    .eq('id', id);
                error = updateError;
            } else {
                // Crear
                const { error: insertError } = await supabaseClient
                    .from('noticias')
                    .insert([newsData]);
                error = insertError;
            }

            if (error) throw error;

            alert('✅ Noticia guardada correctamente');
            if (window.closeModal) window.closeModal();
            loadNews();

        } catch (error) {
            console.error('❌ Error guardando noticia:', error);
            alert('Error al guardar la noticia: ' + error.message);
        }
    });
}

// Editar noticia
async function editNews(id) {
    try {
        const { data: news, error } = await supabaseClient
            .from('noticias')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        document.getElementById('newsId').value = news.id;
        document.getElementById('newsTitle').value = news.titulo;
        document.getElementById('newsCategory').value = news.categoria;
        document.getElementById('newsSummary').value = news.resumen;
        document.getElementById('newsContent').value = news.contenido;
        document.getElementById('newsImage').value = news.imagen_url || '';

        if (window.openModal) window.openModal(id);

    } catch (error) {
        console.error('❌ Error cargando noticia para editar:', error);
        alert('Error al cargar la noticia.');
    }
}

// Eliminar noticia
async function deleteNews(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta noticia?')) return;

    try {
        const { error } = await supabaseClient
            .from('noticias')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert('🗑️ Noticia eliminada');
        loadNews();

    } catch (error) {
        console.error('❌ Error eliminando noticia:', error);
        alert('Error al eliminar la noticia.');
    }
}

// Expose functions to window
window.loadNews = loadNews;
window.editNews = editNews;
window.deleteNews = deleteNews;
