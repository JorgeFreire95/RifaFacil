import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="page-container" style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h1>Aviso de privacidad</h1>
        <p>
          En RifaFacil respetamos tu privacidad y tratamos tus datos personales con responsabilidad. Este aviso describe qué datos recolectamos, cómo los usamos y por qué.
        </p>

        <h2>Datos que recopilamos</h2>
        <ul>
          <li>Correo electrónico.</li>
          <li>Nombre de usuario.</li>
          <li>Teléfono.</li>
          <li>Datos de autenticación de Google cuando usas el inicio de sesión con Google.</li>
        </ul>

        <h2>Uso de los datos</h2>
        <p>
          Utilizamos estos datos para permitir el acceso a tu cuenta, identificar tus rifas, comunicarte sobre tus tickets y brindar una experiencia personalizada dentro de la app.
        </p>

        <h2>Servicios de terceros</h2>
        <p>
          La aplicación usa Firebase para autenticación y almacenamiento de datos. Tu información se almacena y procesa conforme a las políticas de seguridad de Firebase.
        </p>

        <h2>Notificaciones</h2>
        <p>
          RifaFacil puede solicitar permiso para enviar notificaciones locales. Estas notificaciones solo se utilizan para avisos de la app y confirmaciones relevantes a la experiencia del usuario.
        </p>

        <h2>Sin venta de datos</h2>
        <p>
          No vendemos ni compartimos tus datos personales con terceros fuera de los proveedores de servicios necesarios para el funcionamiento de la app.
        </p>

        <h2>Contacto</h2>
        <p>
          Si deseas más información sobre el tratamiento de datos o quieres solicitar la eliminación de tu cuenta, contacta al desarrollador desde los canales oficiales que aparecen en la tienda.
        </p>

        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>
            Regresar al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
