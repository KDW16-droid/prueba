# Melius Time

POC responsive para control de asistencia multiempresa. Permite demostrar el
flujo de entrada, pausas, salida provisional, salida final, solicitudes de
cambio, autorizaciones operativas, alertas por cambio de ciudad y reportes para
Excel.

## Estado de la POC

La interfaz y los flujos navegables están listos para demostración. El proyecto
incluye el modelo relacional y las migraciones para PostgreSQL. La conexión a
la base, el proveedor de correo y la geolocalización de IP deben configurarse
antes de utilizar el sistema en producción.

## Funcionalidad incluida

- Login por correo y contraseña con cuentas de demostración.
- Recuperación de contraseña preparada para integrar un proveedor SMTP.
- Entrada, pausa, reanudación, salida provisional y salida final.
- Peticiones de reingreso, correcciones y horas extra.
- Aprobación por Recursos Humanos o Dirección de Operaciones.
- Panel global de consultores por empresa y localidad.
- Retardos con tolerancia parametrizable de 15 minutos.
- Registro y alerta no bloqueante cuando cambia la ciudad detectada por IP.
- Exportación de reportes compatibles con Excel.
- Históricos y tablas de auditoría contemplados en PostgreSQL.
- Diseño responsive basado en el manual de identidad de Melius.

## Cuentas de demostración

| Perfil | Correo |
| --- | --- |
| Empleado | `diego.ramirez@melius.demo` |
| Recursos Humanos | `rh@melius.demo` |
| Dirección de Operaciones | `operaciones@melius.demo` |

Configura `SESSION_SECRET` y `DEMO_PASSWORD` en `.env.local` antes de iniciar
la POC. No uses cuentas de demostración en un entorno público.

## Requisitos

- Node.js 22 o posterior.
- npm 10 o posterior.
- PostgreSQL para conectar la persistencia real.

## Ejecución local

```bash
npm ci
npm run dev
```

La aplicación se abre en `http://localhost:3000`.

## Verificación

```bash
npm run build
npm test
```

## Base de datos

El esquema está en `db/schema.ts` y las migraciones versionadas están en
`drizzle/`.

```bash
npm run db:generate
```

La base contempla empresas, localidades, asignaciones múltiples, políticas por
cliente y país, horarios, jornadas, eventos de tiempo, solicitudes,
autorizaciones, alertas, sesiones, recuperación de contraseña y auditoría.

## Variables de entorno

Copia `.env.example` como `.env.local` y completa los valores en el ambiente de
despliegue. Nunca subas secretos al repositorio.

## Contenedor para AWS Lightsail

Se incluye un `Dockerfile` multi-etapa. La configuración de DNS, HTTPS,
PostgreSQL, copias de seguridad y secretos se realiza en la instancia de
Lightsail.

```bash
docker build -t melius-time .
docker run --env-file .env.local -p 3000:3000 melius-time
```

## Decisiones pendientes

- Confirmar si Dirección y Dirección de Operaciones son un solo rol.
- Definir si las horas extra requieren una o dos aprobaciones.
- Definir si las alertas de ciudad también se envían por correo.
- Conectar el proveedor SMTP y el servicio de geolocalización por IP.
- Conectar las acciones de la interfaz a PostgreSQL.
