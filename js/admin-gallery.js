/**
 * Lógica para gestión de galería en el panel de administrador
 */

// Cargar galería al iniciar
window.loadGallery = async function () {
    console.log('🔄 Cargando galería...');
    const tableBody = document.getElementById('galleryTableBody');

    try {
        const { data: items, error } = await window.supabaseClient
            .from('galeria')
            .select('*')
            .order('fecha_publicacion', { ascending: false });

        if (error) throw error;

        if (!items || items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay imágenes registradas.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        items.forEach(item => {
            const date = new Date(item.fecha_publicacion).toLocaleDateString();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${item.imagen_url}" class="news-image-preview" alt="Preview" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </td>
                <td>${item.titulo}</td>
                <td><span class="badge badge-info">${item.categoria}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="editGalleryItem(${item.id})">✏️</button>
                    <button class="btn btn-ghost btn-sm" onclick="deleteGalleryItem(${item.id})" style="color: var(--color-danger);">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('❌ Error cargando galería:', error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar galería.</td></tr>';
    }
};

// Guardar item (Crear o Editar)
document.addEventListener('DOMContentLoaded', () => {
    const galleryForm = document.getElementById('galleryForm');
    if (galleryForm) {
        galleryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const saveBtn = document.getElementById('saveBtn');
            const originalBtnText = saveBtn.textContent;
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando...';

            try {
                const id = document.getElementById('galleryId').value;
                const title = document.getElementById('galleryTitle').value;
                const category = document.getElementById('galleryCategory').value;
                const description = document.getElementById('galleryDescription').value;
                const fileInput = document.getElementById('galleryImageFile');
                const existingUrl = document.getElementById('galleryImageUrl').value;

                // Si es edición, solo permitimos una imagen (reemplazo)
                if (id) {
                    let imageUrl = existingUrl;

                    if (fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}.${fileExt}`;
                        const filePath = `${fileName}`;

                        const { error: uploadError } = await window.supabaseClient
                            .storage
                            .from('galeria')
                            .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = window.supabaseClient
                            .storage
                            .from('galeria')
                            .getPublicUrl(filePath);

                        imageUrl = publicUrl;
                    }

                    const itemData = {
                        titulo: title,
                        categoria: category,
                        descripcion: description,
                        imagen_url: imageUrl,
                        fecha_publicacion: new Date().toISOString()
                    };

                    const { error: updateError } = await window.supabaseClient
                        .from('galeria')
                        .update(itemData)
                        .eq('id', id);

                    if (updateError) throw updateError;

                } else {
                    // Si es nuevo, permitimos múltiples imágenes
                    if (fileInput.files.length === 0) {
                        throw new Error('Debes seleccionar al menos una imagen');
                    }

                    const uploadPromises = Array.from(fileInput.files).map(async (file) => {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                        const filePath = `${fileName}`;

                        const { error: uploadError } = await window.supabaseClient
                            .storage
                            .from('galeria')
                            .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = window.supabaseClient
                            .storage
                            .from('galeria')
                            .getPublicUrl(filePath);

                        return {
                            titulo: title,
                            categoria: category,
                            descripcion: description,
                            imagen_url: publicUrl,
                            fecha_publicacion: new Date().toISOString()
                        };
                    });

                    const itemsData = await Promise.all(uploadPromises);

                    const { error: insertError } = await window.supabaseClient
                        .from('galeria')
                        .insert(itemsData);

                    if (insertError) throw insertError;
                }

                alert('✅ Imagen(es) guardada(s) correctamente');
                window.closeModal();
                window.loadGallery();

            } catch (error) {
                console.error('❌ Error guardando imagen:', error);
                alert('Error al guardar la imagen: ' + error.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = originalBtnText;
            }
        });
    }
});

// Editar item
window.editGalleryItem = async function (id) {
    try {
        const { data: item, error } = await window.supabaseClient
            .from('galeria')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        document.getElementById('galleryId').value = item.id;
        document.getElementById('galleryTitle').value = item.titulo;
        document.getElementById('galleryCategory').value = item.categoria;
        document.getElementById('galleryDescription').value = item.descripcion || '';
        document.getElementById('galleryImageUrl').value = item.imagen_url;

        // Mostrar preview de la imagen existente
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = ''; // Limpiar previews anteriores
        imagePreview.style.display = 'flex';

        const img = document.createElement('img');
        img.src = item.imagen_url;
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        imagePreview.appendChild(img);

        window.openModal(id);

    } catch (error) {
        console.error('❌ Error cargando imagen para editar:', error);
        alert('Error al cargar la imagen.');
    }
};

// Eliminar item
window.deleteGalleryItem = async function (id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta imagen?')) return;

    try {
        const { error } = await window.supabaseClient
            .from('galeria')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert('🗑️ Imagen eliminada');
        window.loadGallery();

    } catch (error) {
        console.error('❌ Error eliminando imagen:', error);
        alert('Error al eliminar la imagen.');
    }
};