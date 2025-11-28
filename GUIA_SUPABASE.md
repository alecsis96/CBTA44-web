# 🚀 Guía Rápida de Integración Supabase - CBTA #44

## ✅ PASO 1: Ejecutar Schema SQL (Database)

### En Supabase Dashboard:

1. Ve a **SQL Editor** en el menú lateral
2. Clic en **"New query"**
3. Copia TODO el contenido de `database/schema.sql`
4. Pégalo en el editor
5. Clic en **"RUN"** (botón verde arriba a la derecha)
6. Espera ~5 segundos
7. Deberías ver: ✅ "Esquema de base de datos creado correctamente"

**Si hay errores:**
- Verifica que el proyecto esté completamente inicializado
- Revisa que no haya tablas duplicadas (puedes borrarlas desde Table Editor)

---

## ✅ PASO 2: Crear Usuarios de Prueba

### En Supabase Dashboard:

1. Ve a **Authentication** → **Users** en el menú lateral
2. Clic en **"Add user"** → **"Create new user"**
3. Crea estos 4 usuarios uno por uno:

| Email | Password | Role |
|-------|----------|------|
| admin@cbta44.edu.mx | Admin123! | admin |
| docente@cbta44.edu.mx | Docente123! | docente |
| alumno@cbta44.edu.mx | Alumno123! | alumno |
| padre@cbta44.edu.mx | Padre123! | padre |

4. **MUY IMPORTANTE**: Después de crear cada usuario, **copia su UUID**
   - Aparece en la columna "ID" de la lista de usuarios
   - Ejemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

5. **Guarda los UUIDs en este formato:**
```
UUID_ADMIN: a1b2c3d4-e5f6-7890-abcd-ef1234567890
UUID_DOCENTE: b2c3d4e5-f6a7-8901-bcde-f12345678901
UUID_ALUMNO: c3d4e5f6-a7b8-9012-cdef-123456789012
UUID_PADRE: d4e5f6a7-b8c9-0123-def1-234567890123
```

---

## ✅ PASO 3: Ejecutar Seed Data

1. Abre `database/seed.sql`
2. **Busca y reemplaza** (Ctrl+H):
   - `UUID_ADMIN_AQUI` → pegar el UUID real del admin
   - `UUID_DOCENTE_AQUI` → pegar el UUID real del docente
   - `UUID_ALUMNO_AQUI` → pegar el UUID real del alumno
   - `UUID_PADRE_AQUI` → pegar el UUID real del padre

3. Ve a **SQL Editor** en Supabase
4. **Nueva query** y pega el contenido modificado
5. Clic en **"RUN"**
6. Deberías ver la tabla de resumen con conteos

---

## ✅ PASO 4: Incluir Scripts de Supabase en HTML

### En TODAS las páginas del portal, antes de `</body>`:

```html
<!-- SDK de Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Configuración -->
<script src="../js/supabase-config.js"></script>

<!-- Scripts de la app -->
<script src="../js/main.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/portal.js"></script>
```

### Archivos a modificar:
- ✅ `pages/login.html` 
- ✅ `portal/admin/dashboard.html`
- ✅ `portal/docente/dashboard.html`
- ✅ `portal/alumno/dashboard.html`
- ✅ `portal/padre/dashboard.html`

---

## ✅ PASO 5: Probar el Login

1. Abre `pages/login.html` en el navegador
2. Haz clic en uno de los botones de acceso rápido (ej: Alumno)
3. Deberías ser redirigido al dashboard correspondiente
4. Los datos se cargarán desde Supabase en tiempo real

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Verifica que la `SUPABASE_ANON_KEY` en `supabase-config.js` sea correcta
- Debe empezar con `eyJhbGc...`

### Error: "RLS policy violation"
- Las políticas RLS están activas
- Asegúrate de estar autenticado
- Verifica que el usuario tenga el rol correcto

### Los datos no aparecen
- Abre la consola del navegador (F12)
- Busca mensajes de error
- Verifica que se ejecutó el seed.sql correctamente

### Login no funciona
- Verifica que los usuarios existan en Authentication
- Contraseñas deben tener mínimo 6 caracteres
- Revisa la consola para ver errores específicos

---

## 📚 Recursos Útiles

- [Documentación Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✨ ¡Siguiente Nivel!

Una vez que todo funcione:
- Explora el Table Editor para ver los datos
- Prueba las políticas RLS
- Agrega más funcionalidades
- Sube a producción con un dominio custom
