
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

## 2. Configuración de la base de datos

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
```

3. Configura las políticas de seguridad RLS (Row Level Security):

```sql
-- Activar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Usuarios pueden ver sus propios perfiles"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Administradores pueden ver todos los perfiles"
  ON public.user_profiles FOR SELECT
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'ADMIN');

-- Políticas similares para las demás tablas
-- (añade aquí tus políticas personalizadas)
```

## 3. Configuración del frontend

1. Clona el repositorio de la aplicación frontend:

```bash
git clone [tu-repositorio]
cd [tu-directorio]
```

2. Crea un archivo .env.production con la configuración de Supabase:

```
VITE_SUPABASE_URL=http://tu-servidor:8000
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

3. Compila la aplicación:

```bash
npm install
npm run build
```

4. El resultado de la compilación estará en el directorio `dist/`.

## 4. Configuración de Nginx

Crea una configuración de Nginx para servir la aplicación frontend y hacer proxy a Supabase:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name tudominio.com;
    
    # Configuración SSL
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
    
    # Servir el frontend
    location / {
        root /ruta/a/tu/app/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy para Supabase (API)
    location /supabase/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 5. Configuración de scripts de mantenimiento

Crea un script para respaldos diarios de la base de datos:

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

## 6. Monitorización y Logs

Para monitorizar el sistema, puedes utilizar herramientas como:

- Portainer para gestionar los contenedores Docker
- Prometheus + Grafana para métricas
- Loki para centralizar logs

## Notas importantes

- Asegúrate de implementar un firewall adecuado (como ufw) para proteger tu servidor.
- Configura actualizaciones automáticas de seguridad.
- Establece una política de respaldos y prueba regularmente la restauración.
- Documenta cualquier cambio específico en la configuración de tu servidor.

## Recomendaciones de seguridad

- Usa contraseñas fuertes para todas las cuentas.
- Minimiza los puertos expuestos.
- Mantén todos los sistemas actualizados.
- Implementa autenticación de dos factores cuando sea posible.
- Configura alertas para actividades inusuales.

Para más información sobre la administración de Supabase autohospedado, consulta la [documentación oficial](https://supabase.com/docs/guides/self-hosting).
