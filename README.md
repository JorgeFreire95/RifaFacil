# App de Rifas (Híbrida)

Esta aplicación permite crear, gestionar y jugar rifas. Está construida para funcionar tanto como aplicación web moderna como aplicación nativa móvil en Android e iOS.

## 🛠️ Stack Tecnológico

El desarrollo de esta aplicación se ha realizado utilizando las siguientes tecnologías de vanguardia:

### Core & Frameworks
- **React.js (v19)**: Biblioteca principal para la construcción de la interfaz de usuario basada en componentes.
- **Vite**: Herramienta de compilación ultrarrápida para el entorno de desarrollo y empaquetado.
- **Javascript (ES6+)**: Lenguaje de programación base.

### Móvil & Híbrido
- **Capacitor (v8)**: Runtime nativo que puentea la aplicación web con las APIs del dispositivo móvil.
  - `@capacitor/core`: Núcleo del puente nativo.
  - `@capacitor/android`: Plataforma nativa para Android.
  - `@capacitor/ios`: Plataforma nativa para iOS.
  - `@capacitor/app`: Gestión del ciclo de vida de la App y navegación nativa (Botón Atrás).

### Estilos & UI
- **Vanilla CSS3**: Estilizado personalizado para máximo control y rendimiento.
- **Glassmorphism Design**: Estética visual moderna con efectos de desenfoque, transparencias y gradientes.
- **Lucide React**: Biblioteca de iconos vectoriales ligeros y consistentes.
- **Font**: 'Outfit' (Google Fonts) para una tipografía moderna y legible.

### Gestión de Estado & Datos
- **React Context API**: Manejo global del estado para Autenticación (`AuthContext`) y Datos de Rifas (`RaffleContext`).
- **LocalStorage**: Persistencia de datos local simulando una base de datos documental.
- **React Router DOM**: Enrutamiento para la navegación entre pantallas (SPA).
- **UUID**: Generación de identificadores únicos universales para usuarios y rifas.

## 📱 Funcionalidades Principales

1. **Sistema de Usuarios**: 
   - Registro e Inicio de sesión local con validación.
   - **Sesión Efímera**: Por seguridad, la sesión se cierra automáticamente si la aplicación se cierra completamente (`sessionStorage` strategy).
2. **Gestión de Rifas**: 
   - Creación y **Edición** completa de rifas (Títulos, premios, configuración).
   - Cantidad de números flexible (25, 50, 100 o personalizado).
3. **Diseño de Cartones**: 
   - Plantillas aleatorias con gradientes.
   - **Carga de Imagen Personalizada**: Permite subir una imagen que se adapta al fondo del cartón.
4. **Interactividad**: 
   - Control visual de números disponibles/vendidos.
   - Registro de datos del comprador (Nombre, Teléfono) al tocar un número.
5. **Navegación Nativa**: Integración con el botón "Atrás" físico de Android.

## ✅ Última Actualización: Edición y Seguridad

Se han añadido mejoras críticas solicitadas para la gestión y usabilidad:

- **Modo Edición Habilitado**:
  - Ahora es posible **Editar** rifas ya creadas.
  - Se pueden modificar: Título, lista de premios, diseño (imagen/color) y la cantidad de tickets.
  - *Nota: Al reducir tickets, se eliminan los sobrantes del final. Al aumentar, se agregan nuevos disponibles.*
  
- **Modo Sorteo (Gameplay)**:
  - Animación en tiempo real tipo "ruleta".
  - Pantalla de ganador con confeti y datos del cliente ganador (si existe).

- **Seguridad Mejorada**:
  - Implementación de **Cierre de Sesión Automático** en eventos de cierre forzoso o limpieza de memoria del dispositivo.

## �🚀 Cómo Ejecutar (Web / Desarrollo)

```bash
npm install
npm run dev
```

## 🤖 Compilar para Android

1. Construir el proyecto web:
   ```bash
   npm run build
   ```

2. Sincronizar cambios:
   ```bash
   npx cap sync
   ```

3. Abrir Android Studio:
   ```bash
   npx cap open android
   ```
