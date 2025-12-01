/**
 * CBTA #44 - Lógica de Admisiones (ES Module)
 */

import { supabaseClient } from './supabase-config.js';
import { showNotification } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('registroModal');
    const closeBtn = document.querySelector('.modal-close');
    const form = document.getElementById('registroForm');

    // Funciones del Modal
    window.openRegistroModal = () => {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeRegistroModal = () => {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            if (form) form.reset();
        }
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', window.closeRegistroModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) window.closeRegistroModal();
        });
    }

    // Manejo del Formulario
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';

                const formData = {
                    nombre_completo: document.getElementById('nombre').value,
                    curp: document.getElementById('curp').value.toUpperCase(),
                    email: document.getElementById('email').value,
                    telefono: document.getElementById('telefono').value,
                    escuela_procedencia: document.getElementById('escuela').value,
                    promedio: parseFloat(document.getElementById('promedio').value),
                    carrera_interes: document.getElementById('carrera').value,
                    estatus: 'pendiente'
                };

                // Validar CURP (básico)
                if (formData.curp.length < 18) {
                    throw new Error('La CURP debe tener 18 caracteres');
                }

                // Enviar a Supabase
                const { data, error } = await supabaseClient
                    .from('admisiones')
                    .insert([formData])
                    .select();

                if (error) throw error;

                // Éxito
                showNotification('¡Pre-registro exitoso! Guarda tu folio.', 'success');

                // Mostrar folio
                setTimeout(() => {
                    alert(`Pre-registro completado.\nTu ID de seguimiento es: ${data[0].id.slice(0, 8).toUpperCase()}`);
                    window.closeRegistroModal();
                }, 1000);

            } catch (error) {
                console.error('Error:', error);
                showNotification(error.message || 'Error al enviar el registro', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});
