# RifaFacil - App de Rifas (Híbrida & Nativa)

Esta aplicación permite crear, gestionar y jugar rifas de manera sencilla y profesional. Está construida para funcionar como una **aplicación nativa de alto rendimiento** en Android e iOS, sincronizando todos los datos en tiempo real mediante Firebase.

## 🛠️ Stack Tecnológico

El proyecto utiliza un conjunto moderno de tecnologías para garantizar rendimiento, seguridad y escalabilidad:

### Core & Frameworks
- **React.js (v19)**: Motor principal de la interfaz, utilizando las últimas características como Hooks avanzados.
- **Vite**: Bundler de última generación para una compilación ultrarrápida.
- **Javascript (ES6+)**: Lógica robusta y moderna.

### Móvil & Híbrido (Capacitor v8)
- **@capacitor/core**: Núcleo del runtime nativo.
- **@capacitor-firebase/authentication**: **Google Sign-In Nativo** para una autenticación fluida sin redirecciones web.
- @capacitor/dialog: Alertas y confirmaciones nativas del sistema operativo.
- @capacitor/local-notifications: **Recordatorios Inteligentes** para notificar sorteos antes de que ocurran.
- @capacitor/app: Gestión del ciclo de vida de la aplicación.

### Backend & Servicios (Firebase)
- **Firebase Authentication**:
  - Login con Google (Nativo en Android/iOS, Popup en Web).
  - Registro por Email/Password.
  - **Seguridad de Sesión**: Configurado con `browserSessionPersistence` para cerrar sesión automáticamente al cerrar la app (seguridad bancaria).
- **Cloud Firestore**:
  - Base de datos NoSQL en tiempo real.
  - **Sincronización Optimista**: La interfaz se actualiza instantáneamente mientras los datos se guardan en segundo plano.
  - **Estado de Red**: Detección automática de conexión (Indicadores: "Datos en la nube" vs "Pendiente").
  
### Estilos & UI
- **Glassmorphism Custom CSS**: Diseño premium con efectos de cristal, gradientes y animaciones fluidas.
- **Lucide React**: Iconografía vectorial ligera y moderna.
- **Fuentes**: 'Outfit' (Google Fonts) para una tipografía limpia.

## 📱 Funcionalidades Principales

1. **Gestión de Usuarios Avanzada**:
   - Inicio de sesión nativo con Google (One-tap).
   - Protección de rutas y redirección inteligente.
   - **Auto-Logout**: La sesión se destruye al forzar el cierre de la app para máxima privacidad.

2. **Gestión de Rifas (CRUD Optimista)**:
   - Crear, Editar y Eliminar rifas con **feedback instantáneo**.
   - **Fechas de Sorteo**: Programación de la fecha del evento con visualización clara.
   - Soporte para imágenes personalizadas o colores aleatorios en los cartones.
   - Control de estados: Cartones Aleatorios vs Imágenes.

3. **Notificaciones & Recordatorios**:
   - Programación automática de alertas 24 horas antes del sorteo.
   - Notificaciones nativas que funcionan en segundo plano.

4. **Venta y Control de Tickets**:
   - Selección interactiva de números en un tablero dinámico.
   - Registro de compradores con nombre y teléfono.
   - Estado visual en tiempo real de tickets (Disponibles / Vendidos).

5. **Sorteos Interactivos**:
   - Animación de ruleta digital con física de desaceleración.
   - Detección de ganadores y celebración visual.

## 🚀 Cómo Ejecutar (Desarrollo)

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Firebase**:
   - Asegúrate de tener los archivos:
     - `src/firebaseConfig.js` (Web SDK)
     - `android/app/google-services.json` (Android Nativo)

3. **Ejecutar en Navegador**:
   ```bash
   npm run dev
   ```

## 🤖 Compilar para Android (Producción)

1. **Generar build optimizada**:
   ```bash
   npm run build
   ```

2. **Sincronizar código nativo**:
   ```bash
   npx cap sync
   ```
   *Esto copia los assets y actualiza los plugins nativos.*

3. **Abrir en Android Studio**:
   ```bash
   npx cap open android
   ```
   *Desde aquí puedes ejecutar el emulador o instalar en dispositivo físico.*
## 🛡️ Cumplimiento de Google Play

- Esta app incluye un aviso de privacidad en la ruta `/privacy-policy` y un archivo estático en `public/privacy-policy.html`.
- Si publicas en Google Play, completa el formulario de Data Safety con los datos usados en la app:
  - Autenticación de usuario (email, nombre, teléfono opcional).
  - Notificaciones locales.
  - Firebase como servicio de backend.
- Asegúrate de usar un `applicationId` consistente (`com.jorge.rifafacil`) y declarar los permisos necesarios en `android/app/src/main/AndroidManifest.xml`, incluyendo `POST_NOTIFICATIONS`.
