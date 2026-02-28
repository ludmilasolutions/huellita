# Mi Huellita

> La historia de tu mascota, siempre contigo.

Una aplicación web progresiva (PWA) desarrollada por **AFM Solutions** que combina historial clínico digital para mascotas con una red solidaria para adopciones y refugios.

## Características

- **Historial Clínico Digital**: Controlado por el dueño, alimentado solo por veterinarias verificadas
- **Sistema PIN**: Seguridad mediante PIN temporal de 6 dígitos para acceso de veterinarias
- **Sección Solidaria**: Conecta con refugios, adopciones y voluntarios
- **Sin intermediarios en dinero**: Todo es directo entre usuarios

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Edge Functions**: TypeScript (Deno runtime)
- **Hosting**: Netlify, Vercel, o cualquier servidor de archivos estáticos

## Estructura del Proyecto

```
/
├── index.html              # Landing page
├── login.html              # Login
├── register.html           # Registro con selección de rol
├── dashboard.html          # Dashboard principal (dueño/vet/refugio)
├── solidary.html          # Página pública: refugios y voluntarios
├── adopt.html             # Página pública: mascotas en adopción
├── css/
│   └── styles.css         # Estilos personalizados
├── js/
│   ├── supabase-client.js # Inicialización de Supabase
│   ├── auth.js           # Manejo de autenticación
│   ├── owner.js          # Funcionalidades para dueños
│   ├── vet.js            # Funcionalidades para veterinarias
│   ├── public.js         # Páginas públicas
│   └── admin.js          # Funcionalidades de admin
├── supabase/
│   ├── schema.sql        # Esquema de base de datos
│   └── functions/        # Edge Functions
│       ├── generate-pin/
│       ├── validate-pin/
│       └── add-medical-record/
└── .env.example          # Variables de entorno ejemplo
```

## Configuración

### 1. Crear Proyecto en Supabase

1. Ve a https://supabase.com y crea un nuevo proyecto
2. Espera a que se aprovisione la base de datos

### 2. Ejecutar Esquema de Base de Datos

1. Ve a "SQL Editor" en el panel de Supabase
2. Copia el contenido de `supabase/schema.sql`
3. Ejecuta el script

### 3. Configurar Autenticación

1. Ve a Authentication > Providers
2. Habilita Google OAuth
3. Configura las credenciales de Google Cloud Console

### 4. Desplegar Edge Functions

Instala la CLI de Supabase:
```bash
npm install -g supabase
```

Inicia sesión:
```bash
supabase login
```

Despliega las funciones:
```bash
cd supabase/functions
supabase functions deploy generate-pin
supabase functions deploy validate-pin
supabase functions deploy add-medical-record
```

### 5. Configurar Frontend

Edita `js/supabase-client.js` y reemplaza las credenciales:

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key';
```

### 6. Desplegar Frontend

**Opción A: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

**Opción B: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Opción C: GitHub Pages**
```bash
# Sube el código a GitHub
# Activa GitHub Pages en settings
```

## Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `owner` | Dueño de mascota - puede agregar mascotas, generar PINs, ver historial |
| `vet` | Veterinaria - puede validar PINs y agregar registros médicos |
| `shelter` | Refugio - puede gestionar mascotas en adopción |
| `admin` | Administrador - acceso completo |

## Flujo del PIN

1. **Dueño**: Genera PIN desde el dashboard → Edge Function `generate-pin`
2. **Veterinaria**: Ingresa el PIN → Edge Function `validate-pin` → Acceso concedido por 30 min
3. **Veterinaria**: Agrega registro médico → Edge Function `add-medical-record`

## Seguridad

- Todas las Edge Functions verifican autenticación
- RLS (Row Level Security) en todas las tablas
- Los PINs expiran en 15 minutos
- El acceso a registros médicos se renueva cada 30 minutos

## Contribuir

1. Haz un fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

Desarrollado por **AFM Solutions** 🇦🇷
