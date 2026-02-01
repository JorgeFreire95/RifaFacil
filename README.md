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
- **@capacitor/dialog**: Alertas y confirmaciones nativas del sistema operativo.
- **@capacitor/app**: Gestión del ciclo de vida de la aplicación.

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
   - Crear, Editar y Eliminar rifas con **feedback instantáneo** (Zero-latency UI).
   - Soporte para imágenes personalizadas en los cartones.
   - Control de estados: Cartones Aleatorios vs Personalizados.

3. **Venta y Control de Tickets**:
   - Selección interactiva de números.
   - Registro de compradores con validación de datos.
   - Estado visual de tickets (Disponibles / Vendidos).

4. **Sorteos Interactivos**:
   - Ruleta virtual con animación de desaceleración física.
   - Celebración con efectos visuales para el ganador.

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
