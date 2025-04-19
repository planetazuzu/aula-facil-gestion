
# Instrucciones para Despliegue del Sistema Aula Fácil

Este documento proporciona instrucciones para desplegar la aplicación Aula Fácil en un servidor propio con Supabase autohospedado.

## Requisitos previos

- Un servidor Linux (Ubuntu/Debian recomendado)
- Docker y Docker Compose instalados
- Nginx configurado con SSL (se recomienda Certbot para certificados gratuitos)
- Node.js y npm para compilar la aplicación frontend

## 1. Instalación de Supabase en tu servidor

Supabase se puede autohospedar utilizando Docker Compose. Sigue estos pasos:

1. Clona el repositorio de Supabase:

```bash
git clone https://github.com/supabase/supabase
cd supabase/docker
```

2. Copia el archivo de ejemplo de variables de entorno y configúralo:

```bash
cp .env.example .env
```

3. Edita el archivo .env para configurar las contraseñas y otras opciones:

```
# Archivo .env - Personaliza estos valores
POSTGRES_PASSWORD=contraseña_segura
JWT_SECRET=jwt_secret_muy_seguro
ANON_KEY=clave_anonima_para_cliente
SERVICE_ROLE_KEY=clave_rol_servicio_segura
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=contraseña_admin_segura
```

4. Inicia Supabase:

```bash
docker-compose up -d
```

Supabase estará disponible en http://tu-servidor:8000 (o el puerto que hayas configurado).

## 2. Configuración de las notificaciones push

Para que las notificaciones push funcionen correctamente, debes configurar:

1. Generar claves VAPID (Voluntary Application Server Identification):

```bash
npx web-push generate-vapid-keys
```

2. Configura las claves VAPID como secrets en tu instancia de Supabase:

```bash
cd supabase/docker
docker compose exec supabase-functions-serve \
  supabase secrets set VAPID_PUBLIC_KEY=tu_clave_publica_generada
docker compose exec supabase-functions-serve \
  supabase secrets set VAPID_PRIVATE_KEY=tu_clave_privada_generada
docker compose exec supabase-functions-serve \
  supabase secrets set VAPID_SUBJECT=mailto:notificaciones@tudominio.com
```

3. Asegúrate de que el archivo service-worker.js esté en la carpeta pública:

```bash
cp /ruta/a/tu/app/public/service-worker.js /ruta/a/tu/servidor/web/public/
```

4. Para la función push-notifications, configura Supabase para que la verifique JWT:

```bash
# En supabase/config.toml
[functions.push-notifications]
verify_jwt = true
```

## 3. Configuración de la base de datos

Una vez que Supabase esté en funcionamiento, necesitas crear las tablas y configuraciones necesarias:

1. Accede al panel de administración de Supabase (http://tu-servidor:3000) con las credenciales configuradas.

2. Crea las siguientes tablas desde el editor SQL o la interfaz de usuario:

```sql
-- Tabla de usuarios (extendiendo la tabla auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  notification_preference TEXT NOT NULL DEFAULT 'EMAIL',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabla de cursos
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  topic TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER NOT NULL,
  enrolled INTEGER NOT NULL DEFAULT 0,
  waitlist INTEGER NOT NULL DEFAULT 0,
  teacher_id UUID REFERENCES public.user_profiles(id),
  status TEXT NOT NULL DEFAULT 'UPCOMING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de inscripciones
CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ENROLLED',
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  rating INTEGER,
  feedback TEXT
);

-- Tabla de mensajes
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para almacenar suscripciones a notificaciones push
CREATE TABLE public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

3. Configura las políticas de seguridad RLS (Row Level Security):

```sql
-- Activar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para push_subscriptions
CREATE POLICY "Usuarios pueden ver sus propias suscripciones push"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias suscripciones push"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias suscripciones push"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propias suscripciones push"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para user_profiles
CREATE POLICY "Usuarios pueden ver sus propios perfiles"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Añadir más políticas similares para las demás tablas según necesidad
```

## 4. Configuración del frontend

1. Clona el repositorio de la aplicación frontend:

```bash
git clone [tu-repositorio]
cd [tu-directorio]
```

2. Crea un archivo .env.production con la configuración de Supabase:

```
VITE_SUPABASE_URL=https://tu-dominio-supabase.com
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

3. Compila la aplicación:

```bash
npm install
npm run build
```

4. El resultado de la compilación estará en el directorio `dist/`.

## 5. Configuración de Nginx

Crea una configuración de Nginx para servir la aplicación frontend y hacer proxy a Supabase:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com;
    
    # Configuración SSL
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
    
    # Servir el frontend
    location / {
        root /ruta/a/tu/app/dist;
        try_files $uri $uri/ /index.html;
        
        # Configuraciones para Service Worker
        add_header Service-Worker-Allowed "/";
    }
    
    # Permitir acceso al service-worker.js en la raíz
    location = /service-worker.js {
        root /ruta/a/tu/app/dist;
        add_header Cache-Control "no-cache";
        expires -1;
    }
    
    # Proxy para Supabase API
    location /rest/v1/ {
        proxy_pass http://localhost:8000/rest/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Proxy para Supabase Auth
    location /auth/v1/ {
        proxy_pass http://localhost:8000/auth/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Proxy para Supabase Functions
    location /functions/v1/ {
        proxy_pass http://localhost:8000/functions/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 6. Consideraciones para notificaciones push en producción

Para un entorno de producción, recomendamos las siguientes mejoras:

1. **Persistencia de suscripciones**: Modifica la función `push-notifications` para almacenar las suscripciones en la tabla `push_subscriptions` en lugar de usar un Map en memoria:

```typescript
// Ejemplo pseudocódigo para la función push-notifications
if (action === 'subscribe' && userId) {
  // Guardar suscripción en base de datos
  const { error } = await supabaseAdmin
    .from('push_subscriptions')
    .upsert({ 
      user_id: userId, 
      subscription: subscription 
    });
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ success: true, message: 'Subscription saved' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

2. **Sistema de colas**: Para envíos masivos de notificaciones, implementa un sistema de colas para evitar sobrecargar el servidor.

3. **Monitorización**: Configura un sistema de monitorización para seguir el rendimiento y el éxito de las notificaciones push.

## 7. Scripts de mantenimiento y respaldo

Configura respaldos regulares de la base de datos y monitorización del sistema:

```bash
#!/bin/bash
# /opt/aula-facil/backup.sh

DATE=$(date +%Y-%m-%d)
docker exec -t postgres pg_dump -U postgres -d postgres > /backups/aula_facil_$DATE.sql
```

Añade el script a cron para ejecutarlo diariamente:

```
0 2 * * * /opt/aula-facil/backup.sh
```

## 8. Seguridad y mantenimiento

- Implementa un firewall (ufw recomendado)
- Configura actualizaciones automáticas de seguridad
- Establece una política regular de actualización para Supabase y dependencias
- Monitoriza logs y alertas

Para más detalles sobre la administración de Supabase autohospedado, consulta la [documentación oficial](https://supabase.com/docs/guides/self-hosting).
