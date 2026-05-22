# Notas de versión

## Versión 2.2.0

### Mejoras y correcciones

- 🔧 Corrección del login con Google en Android.
  - Se ajustó el flujo nativo de autenticación para desactivar el `Credential Manager` cuando no hay credenciales almacenadas.
  - Se valida correctamente que se reciba al menos un token (`idToken` o `accessToken`) del proveedor de Google.
  - Se utiliza `GoogleAuthProvider.credential(...)` con los datos del login nativo para firmar al usuario en Firebase.

- 🧠 Mejora de la experiencia de inicio de sesión de Google.
  - Se fuerza el selector de cuenta de Google en Android para evitar el error "no credentials available".
  - Se reporta un mensaje más claro si falta el token de Google.

- ✅ Sincronización de usuario optimista.
  - El estado de usuario se actualiza inmediatamente tras el login para mejorar la respuesta de la UI.
  - Se sincroniza el perfil de usuario con Firestore en segundo plano.

### Archivos modificados

- `src/context/AuthContext.jsx`
- `src/pages/Login.jsx` (flujo de navegación y manejo de errores de Google)

### Nota

Para probar esta versión, reconstruye la app en Android y reinstala en el dispositivo. Si el error persiste, verifica la configuración de Firebase para el `webClientId`, el `applicationId` y la huella SHA-1 en la consola de Firebase.
