# 🚀 PASOS FINALES - CBTA #44 Supabase Integration

## ✅ YA COMPLETADO (95% listo)

- ✅ Proyecto Supabase configurado
- ✅ Base de datos creada (9 tablas con RLS)
- ✅ Sistema de autenticación migrado
- ✅ Todas las páginas HTML actualizadas
- ✅ Scripts de configuración listos

---

## 📋 FALTA HACER (Últimos pasos)

### PASO 1: Crear 4 Usuarios en Supabase

**Ve a:** https://supabase.com/dashboard/project/uatqudtzuvkhxdtvrjsc/auth/users

1. Haz clic en el botón **"Add user"** (verde, arriba a la derecha)

2. **Crear Usuario 1 - Admin:**
   - Email: `admin@cbta44.edu.mx`
   - Password: `Admin123!`
   - Clic en "Create user"
   - **COPIAR EL ID/UUID** que aparece en la lista

3. **Crear Usuario 2 - Docente:**
   - Email: `docente@cbta44.edu.mx`
   - Password: `Docente123!`
   - Clic en "Create user"
   - **COPIAR EL ID/UUID**

4. **Crear Usuario 3 - Alumno:**
   - Email: `alumno@cbta44.edu.mx`
   - Password: `Alumno123!`
   - Clic en "Create user"
   - **COPIAR EL ID/UUID**

5. **Crear Usuario 4 - Padre:**
   - Email: `padre@cbta44.edu.mx`
   - Password: `Padre123!`
   - Clic en "Create user"
   - **COPIAR EL ID/UUID**

---

### PASO 2: Actualizar seed.sql

1. Abre el archivo: `database/seed.sql`

2. Busca y reemplaza (Ctrl+H):
   - `UUID_ADMIN_AQUI` → pegar UUID del admin
   - `UUID_DOCENTE_AQUI` → pegar UUID del docente
   - `UUID_ALUMNO_AQUI` → pegar UUID del alumno
   - `UUID_PADRE_AQUI` → pegar UUID del padre

3. Guarda el archivo

---

### PASO 3: Ejecutar seed.sql

1. Ve al SQL Editor: https://supabase.com/dashboard/project/uatqudtzuvkhxdtvrjsc/sql

2. Clic en **"New query"**

3. Copia TODO el contenido de `database/seed.sql` (ya modificado)

4. Pega en el editor

5. Clic en **"Run"** (botón verde)

6. Deberías ver una tabla con el conteo de registros:
   ```
   Perfiles: 4
   Especialidades: 6
   Materias: 8
   Alumnos: 1
   Docentes: 1
   Calificaciones: 12
   ```

---

### PASO 4: ¡PROBAR!

1. Abre en tu navegador: `pages/login.html`

2. Haz clic en cualquier botón de acceso rápido (ej: Alumno)

3. Deberías:
   - Ser redirigido al dashboard del alumno
   - Ver el nombre cargado desde Supabase
   - Ver las calificaciones en la tabla

4. Prueba con los otros roles también

---

## 🐛 Si algo no funciona:

### Error: "Invalid login credentials"
- Verifica que creaste el usuario con el email y password correctos
- Las contraseñas deben tener al menos 6 caracteres

### Error: "User not found"
- Asegúrate de haber ejecutado el seed.sql DESPUÉS de crear los usuarios
- Los UUIDs en seed.sql deben coincidir con los de Auth

### No se muestran datos:
- Abre la consola del navegador (F12)
- Busca errores related con Supabase
- Verifica que el seed.sql se ejecutó correctamente

---

## 📞 AYUDA

Si necesitas ayuda:
1. Copia el error que ves en la consola
2. Toma screenshot de la página
3. Comparte qué paso no funcionó

---

## 🎉 CUANDO TODO FUNCIONE:

¡Tendrás una plataforma completamente funcional con:
- Autenticación real con Supabase
- Base de datos PostgreSQL
- 4 usuarios con diferentes roles
- Datos de prueba listos
- RLS protegiendo la información

🚀 **¡Mucho éxito!**
