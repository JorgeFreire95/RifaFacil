# RifaFacil - App de Rifas (Híbrida)

Esta aplicación permite crear, gestionar y jugar rifas de manera sencilla y profesional. Está construida para funcionar tanto como aplicación web moderna como aplicación nativa móvil en Android e iOS, sincronizando todos los datos en la nube mediante Firebase.

## 🛠️ Stack Tecnológico

El desarrollo de esta aplicación se utiliza las siguientes tecnologías:

### Core & Frameworks
- **React.js (v19)**: Biblioteca principal para la construcción de la interfaz de usuario.
- **Vite**: Herramienta de compilación rápida para desarrollo y producción.
- **Javascript (ES6+)**: Lenguaje de programación base.

### Móvil & Híbrido
- **Capacitor (v8)**: Runtime nativo que permite ejecutar la app web en Android e iOS.
  - Sincronización completa con funciones nativas.

### Backend & Servicios (Nuevo)
- **Firebase Authentication**: Sistema de autenticación robusto para registro y login de usuarios.
- **Cloud Firestore**: Base de datos NoSQL en la nube para almacenar rifas, tickets y perfiles de usuario en tiempo real.
- **Context API**: Gestión de estado global conectada a los servicios de Firebase.

### Estilos & UI
- **Vanilla CSS3**: Estilos personalizados con enfoque en **Glassmorphism**.
- **Lucide React**: Iconografía moderna.
- **Font**: 'Outfit' (Google Fonts).

## 📱 Funcionalidades Principales

1. **Gestión de Usuarios (Auth)**:
   - Registro e Inicio de sesión integrados con Firebase.
   - Manejo de sesiones persistentes.

2. **Rifas Inteligentes**:
   - Creación, edición y eliminación de rifas.
   - **Sincronización en la Nube**: Tus datos están seguros y accesibles desde cualquier dispositivo logueado.
   - Personalización: Títulos, premios, cantidad de números (25/50/100/Custom) e imágenes de fondo.

3. **Venta y Control**:
   - Selección de números interactiva.
   - Registro de compradores (Nombre, Teléfono) por ticket.
   - Visualización clara de tickets vendidos vs. disponibles.

4. **Modo Sorteo**:
   - Animación de ruleta para seleccionar ganadores aleatorios.
   - Pantalla de celebración confeti.

## ✅ Últimas Actualizaciones

- **Integración de Firebase**: Se reemplazó el almacenamiento local (LocalStorage) por Firebase para garantizar que los datos no se pierdan y se puedan sincronizar.
- **Corrección de Autenticación**: Flujo de registro y login optimizado.
- **Sincronización Android**: Mejoras en la configuración de Capacitor para el despliegue en Android Studio.

## 🚀 Cómo Ejecutar (Web / Desarrollo)

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar Firebase:
   - Asegúrate de tener el archivo `src/firebaseConfig.js` correctamente configurado con las keys de tu proyecto.

3. Correr entorno local:
   ```bash
   npm run dev
   ```

## 🤖 Compilar para Android

1. Generar build de producción:
   ```bash
   npm run build
   ```

2. Sincronizar con la carpeta nativa android:
   ```bash
   npx cap sync
   ```

3. Abrir en Android Studio:
   ```bash
   npx cap open android
   ```
