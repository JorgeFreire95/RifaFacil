import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="page-container" style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Aviso de Privacidad</h1>
        <p style={{ marginBottom: '1rem' }}>
          Última actualización: 24 de mayo de 2026.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          En <strong>RifaFacil</strong>, accesible como aplicación móvil, respetamos tu privacidad y tratamos tus datos personales con absoluta responsabilidad. Este aviso describe en detalle qué datos recolectamos, cómo los usamos, cómo los protegemos y cómo puedes ejercer tus derechos sobre ellos.
        </p>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Datos que Recopilamos</h2>
        <p style={{ marginBottom: '0.5rem' }}>
          Para ofrecerte nuestras funciones de organización y gestión de sorteos, recopilamos los siguientes datos personales:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li><strong>Información de Registro:</strong> Correo electrónico y nombre completo cuando creas una cuenta de forma manual.</li>
          <li><strong>Autenticación con Terceros:</strong> Nombre, correo electrónico, imagen de perfil y tokens de autenticación cuando utilizas el inicio de sesión con Google.</li>
          <li><strong>Datos de Sorteos:</strong> Información opcional que tú decidas ingresar para gestionar tus rifas (tales como nombres y números de teléfono de los participantes o compradores de tickets).</li>
        </ul>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Uso y Finalidad de los Datos</h2>
        <p style={{ marginBottom: '0.5rem' }}>
          Tus datos se recopilan y utilizan exclusivamente para los siguientes propósitos:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li>Permitir el acceso y seguridad de tu cuenta.</li>
          <li>Identificar tus rifas creadas y mantener la integridad de tus datos en tiempo real.</li>
          <li>Comunicarte sobre el estado de tus sorteos y la asignación de tickets.</li>
          <li>Brindar soporte técnico y resolver problemas en la aplicación.</li>
        </ul>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Proveedores de Servicios y Almacenamiento (Terceros)</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          La aplicación utiliza servicios de <strong>Google Firebase</strong> (Firebase Authentication y Cloud Firestore) para el almacenamiento seguro de datos en la nube y la gestión de sesiones en tiempo real. Firebase procesa y protege tu información de acuerdo con las normativas internacionales de seguridad y las políticas de privacidad de Google. No compartimos ni vendemos tu información personal a ninguna otra empresa o tercero con fines comerciales.
        </p>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Notificaciones y Permisos del Dispositivo</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          RifaFacil requiere el permiso de notificaciones para enviarte recordatorios locales sobre sorteos programados. Estas alertas se procesan de forma local en tu dispositivo y puedes desactivarlas en cualquier momento desde los ajustes de la aplicación o del sistema operativo.
        </p>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>5. Seguridad de tus Datos</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos contra accesos no autorizados, pérdidas o alteraciones, utilizando conexiones cifradas (SSL/TLS) provistas por el backend de Firebase.
        </p>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#f43f5e' }}>6. Eliminación de Cuentas y Retención de Datos</h2>
        <p style={{ marginBottom: '0.5rem' }}>
          De conformidad con las políticas de Google Play, tienes el derecho absoluto de solicitar la eliminación de tu cuenta y todos tus datos personales asociados en cualquier momento:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li><strong>Proceso de Solicitud:</strong> Puedes solicitar la eliminación enviando un correo electrónico a <a href="mailto:jorgefreire95@gmail.com" style={{ color: '#60a5fa', textDecoration: 'underline' }}>jorgefreire95@gmail.com</a> con el asunto <strong>"Eliminación de Cuenta - RifaFacil"</strong>, indicando el correo electrónico registrado en la aplicación.</li>
          <li><strong>Efecto de la Solicitud:</strong> Una vez procesada tu solicitud (en un plazo no mayor a 48 horas hábiles), tu cuenta de usuario en Firebase Authentication y todos los datos asociados (rifas creadas, participantes y tickets registrados) en Cloud Firestore serán eliminados de forma permanente y definitiva, sin posibilidad de recuperación.</li>
        </ul>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>7. Contacto</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Si tienes preguntas sobre esta política de privacidad, el tratamiento de tus datos o deseas iniciar una solicitud de derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), ponte en contacto con nosotros en: <a href="mailto:jorgefreire95@gmail.com" style={{ color: '#60a5fa', textDecoration: 'underline' }}>jorgefreire95@gmail.com</a>.
        </p>

        <div style={{ marginTop: '2rem' }}>
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Regresar al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
