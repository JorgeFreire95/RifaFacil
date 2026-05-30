# RifaFacil - App de Rifas (Híbrida & Nativa)

**[Descargar en Google Play](https://play.google.com/store/apps/details?id=com.jorge.rifafacil)**

Esta aplicación permite crear, gestionar y jugar rifas de manera sencilla y profesional. Está construida para funcionar como una **aplicación nativa de alto rendimiento** en Android e iOS.

---

## 🛠️ Stack Tecnológico y Base de Datos

- **Frontend / Interfaz**: React.js (v19), Vite, CSS Custom (Glassmorphism), Lucide React.
- **Framework Híbrido / Nativo**: Capacitor v8 (permite acceso a APIs nativas y compilación para Android/iOS).
- **Lenguaje Principal**: JavaScript (ES6+).
- **Base de Datos**: Supabase (Base de datos relacional PostgreSQL con suscripciones en tiempo real).
- **Backend / Servicios**: Supabase Auth (para el registro, inicio de sesión y gestión de sesiones de usuarios) y almacenamiento en la nube.

---

## 🏗️ Arquitectura de 3 Capas (3-Tier Architecture)

El proyecto está diseñado siguiendo una arquitectura de tres capas para asegurar la separación de responsabilidades, mantenibilidad y escalabilidad.

### 1. Capa de Presentación (UI Layer)
Encargada de la interacción con el usuario y de mostrar la información de forma intuitiva y atractiva.
- **Frameworks**: React.js (v19) y Vite.
- **Estilos**: Glassmorphism Custom CSS, animaciones fluidas y Lucide React para iconografía.
- **Móvil/Híbrido**: Capacitor v8 para acceso a características nativas de la interfaz (alertas, diálogos).

### 2. Capa de Lógica de Negocio (Business Logic Layer)
Gestiona las reglas de la aplicación, el procesamiento de datos y la comunicación entre la interfaz de usuario y los datos.
- **Core Lógico**: Javascript (ES6+) estructurado a través de Hooks avanzados de React.
- **Manejo de Estados**: Sincronización optimista (la interfaz responde instantáneamente al usuario mientras se validan y actualizan los datos en segundo plano).
- **Servicios Nativos**: 
  - Gestión de ciclo de vida con `@capacitor/app`.
  - Notificaciones locales (programación de alertas 24hs antes del sorteo) usando `@capacitor/local-notifications`.

### 3. Capa de Datos (Data Layer)
Responsable del almacenamiento persistente, sincronización en la nube y autenticación segura de los usuarios.
- **Base de Datos**: Supabase / PostgreSQL con sincronización y suscripciones en tiempo real.
- **Autenticación**: Supabase Auth.
  - Inicio de sesión con correo y contraseña.
  - Gestión y persistencia segura de la sesión del usuario.
- **Red/Offline**: Detección automática del estado de conexión e indicadores ("Datos en la nube" vs "Pendiente").

---

## 🏃 Metodología Ágil (Scrum)

El desarrollo y evolución de RifaFacil se gestiona utilizando el marco de trabajo Scrum, iterando sobre el producto para entregar valor continuo.

### 👥 Roles
- **Product Owner**: Define la visión del producto y prioriza el Product Backlog (enfocado en maximizar el valor para los organizadores de rifas y compradores).
- **Scrum Master**: Facilitita el proceso de desarrollo, elimina impedimentos técnicos (ej. problemas de compilación nativa o de despliegue).
- **Development Team**: Desarrolla los incrementos de producto abarcando todo el stack (Frontend React, Backend Serverless con Supabase, Integración Nativa Capacitor).

### 🎯 Épicas y Product Backlog
Las funcionalidades principales del sistema están divididas en las siguientes Épicas de desarrollo:

1. **Épica 1: Gestión Segura de Usuarios**
   - *User Story*: Como organizador, quiero iniciar sesión de forma segura y rápida con mi correo electrónico para acceder a mis rifas.
   - *User Story*: Como usuario, quiero poder recuperar mi contraseña si la he olvidado a través de mi correo.

2. **Épica 2: Gestión de Rifas (CRUD Optimista)**
   - *User Story*: Como organizador, quiero crear, editar y eliminar una rifa obteniendo feedback visual instantáneo.
   - *User Story*: Como organizador, quiero personalizar los cartones de mi rifa con imágenes específicas o colores aleatorios.

3. **Épica 3: Venta y Control de Tickets**
   - *User Story*: Como vendedor, quiero interactuar con un tablero dinámico para seleccionar y marcar tickets como vendidos.
   - *User Story*: Como vendedor, quiero registrar el nombre y teléfono del comprador para contactarlo si gana.
   - *User Story*: Como usuario, quiero ver el estado visual en tiempo real de los tickets (Disponibles / Vendidos).

4. **Épica 4: Experiencia de Sorteo y Recordatorios**
   - *User Story*: Como participante, quiero ver una animación de ruleta digital con física de desaceleración al realizar el sorteo para mayor emoción.
   - *User Story*: Como organizador, quiero que la app notifique automáticamente en segundo plano 24 horas antes del evento.

### 🔄 Sprint Workflow (Desarrollo Continuo)
Cada iteración (Sprint) sigue el ciclo de construcción, prueba e integración:
- **Planning**: Selección de Historias de Usuario prioritarias para la siguiente versión de la aplicación.
- **Daily Stand-up**: Sincronización del progreso diario (alineando esfuerzos entre la UI y la integración con Supabase).
- **Review**: Demostración del incremento de software funcionando (Builds de prueba para Android).
- **Retrospective**: Análisis para la mejora continua del código, la arquitectura y la experiencia de usuario.

---

## 🚀 Guía del Desarrollador (Sprint Execution)

### Configuración del Entorno de Desarrollo (Local)
1. **Instalar dependencias**:
   ```bash
   npm install
   ```
2. **Configurar Variables de Entorno**: Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   ```
3. **Ejecutar en Navegador (Testeo rápido de UI)**:
   ```bash
   npm run dev
   ```

### Despliegue y Producción (Release Increment)
1. **Generar build optimizada**:
   ```bash
   npm run build
   ```
2. **Sincronizar código nativo (Capacitor)**:
   ```bash
   npx cap sync
   ```
   *Esto copia los assets compilados y actualiza los plugins nativos necesarios.*
3. **Abrir en Android Studio**:
   ```bash
   npx cap open android
   ```
   *Desde aquí se ejecuta el emulador o se compila el APK/AAB para su distribución.*

## 🛡️ Cumplimiento de Google Play (Requisitos de Publicación)
- **Aviso de Privacidad**: El documento legal estático está disponible en la ruta `/privacy-policy` (`public/privacy-policy.html`).
- **Data Safety Form**: Se declara en la consola el uso de Autenticación de usuario (email, nombre, teléfono opcional), Notificaciones locales y base de datos en la nube.
- **Permisos y Configuración**: Uso consistente del `applicationId` (`com.jorge.rifafacil`) y declaración de permisos en el `AndroidManifest.xml`, incluyendo `POST_NOTIFICATIONS` para los recordatorios de los sorteos.
