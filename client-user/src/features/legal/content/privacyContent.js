// client-user/src/features/legal/content/privacyContent.js
// Contenido de Política de Privacidad, adaptado del mismo texto que usa
// client-admin (web) en src/features/legal/pages/PrivacyPolicyPage.jsx.

export const PRIVACY_UPDATED_AT = '2 de julio de 2026';

export const PRIVACY_INTRO =
  'En AlertaGT nos tomamos en serio la privacidad de nuestra comunidad. Esta Política de Privacidad ' +
  'explica qué datos personales recopilamos, con qué finalidad los tratamos, cómo los protegemos y ' +
  'cuáles son tus derechos sobre ellos. Al usar la aplicación AlertaGT (el "Servicio"), aceptas las ' +
  'prácticas descritas en este documento, en conjunto con nuestros Términos de Servicio.';

export const PRIVACY_SECTIONS = [
  {
    title: '1. Responsable del tratamiento',
    blocks: [
      'AlertaGT ("nosotros") es responsable del tratamiento de los datos personales recopilados a ' +
        'través de la aplicación y el sitio web AlertaGT. Para cualquier consulta relacionada con ' +
        'privacidad, puedes contactarnos en official.hexacodee@gmail.com.',
    ],
  },
  {
    title: '2. Datos que recopilamos',
    blocks: [
      'Recopilamos los siguientes tipos de información:',
      {
        items: [
          'Datos de registro: nombre, apellido, nombre de usuario, correo electrónico, número de teléfono, dirección, ciudad, país y contraseña (almacenada de forma cifrada).',
          'Foto de perfil: imagen opcional que subes al crear o editar tu cuenta.',
          'Contenido publicado: alertas, títulos, descripciones, categorías, nivel de riesgo, fotografías adjuntas y comentarios que publicas en la Plataforma.',
          'Datos de ubicación: coordenadas GPS aproximadas o precisas de tu dispositivo, recopiladas cuando concedes permiso de geolocalización.',
          'Datos técnicos y de uso: tipo de dispositivo, sistema operativo, identificadores de la aplicación, tokens de notificaciones push, registros de actividad y preferencias como el radio de alertas o el modo de visualización (claro/oscuro).',
        ],
      },
    ],
  },
  {
    title: '3. Datos de geolocalización',
    blocks: [
      'La geolocalización es central en el funcionamiento de AlertaGT. Utilizamos tu ubicación para: ' +
        'mostrarte alertas dentro de tu radio de interés, calcular la distancia entre tu posición actual y ' +
        'las alertas publicadas, ubicar tus propias publicaciones en el mapa comunitario y personalizar ' +
        'notificaciones sobre incidentes cercanos. El permiso de ubicación es gestionado por tu sistema ' +
        'operativo; puedes otorgarlo o revocarlo en cualquier momento desde la configuración de tu ' +
        'dispositivo. Si desactivas la geolocalización, algunas funciones (mapa de cercanía, distancia a ' +
        'alertas, notificaciones por zona) dejarán de estar disponibles, pero podrás seguir usando el ' +
        'resto de la Plataforma.',
    ],
  },
  {
    title: '4. Finalidad del tratamiento',
    blocks: [
      'Utilizamos tus datos personales para:',
      {
        items: [
          'Crear, autenticar y administrar tu cuenta de usuario.',
          'Mostrar, publicar y distribuir alertas y comentarios dentro de la comunidad.',
          'Calcular distancias y mostrar el mapa de alertas cercanas a tu ubicación.',
          'Enviarte notificaciones relevantes sobre alertas en tu zona.',
          'Mejorar la seguridad, el rendimiento y la experiencia general de la Plataforma.',
          'Detectar, prevenir y responder a fraude, abuso o contenido que infrinja nuestros Términos.',
          'Cumplir con obligaciones legales aplicables.',
        ],
      },
    ],
  },
  {
    title: '5. Base legal',
    blocks: [
      'Tratamos tus datos con base en: (i) la ejecución del contrato que aceptas al registrarte y usar ' +
        'el Servicio; (ii) tu consentimiento, en particular para el acceso a la geolocalización y el envío ' +
        'de notificaciones push, el cual puedes retirar en cualquier momento; y (iii) nuestro interés ' +
        'legítimo en mantener la Plataforma segura y funcional para toda la comunidad.',
    ],
  },
  {
    title: '6. Con quién compartimos tu información',
    blocks: [
      'No vendemos tus datos personales. Podemos compartir información en los siguientes casos:',
      {
        items: [
          'Con otros usuarios: tu nombre de usuario, foto de perfil y el contenido que publiques (alertas y comentarios) son visibles para la comunidad de AlertaGT.',
          'Proveedores de servicios: utilizamos proveedores de infraestructura en la nube, almacenamiento de imágenes y mapas que procesan datos en nuestro nombre bajo obligaciones de confidencialidad.',
          'Requerimientos legales: cuando sea necesario para cumplir con la ley, proteger nuestros derechos o responder a un requerimiento válido de una autoridad competente.',
        ],
      },
    ],
  },
  {
    title: '7. Conservación de los datos',
    blocks: [
      'Conservamos tus datos personales mientras tu cuenta permanezca activa y durante el tiempo ' +
        'adicional necesario para cumplir obligaciones legales, resolver disputas o hacer cumplir nuestros ' +
        'acuerdos. Si eliminas tu cuenta, borraremos o anonimizaremos tus datos personales dentro de un ' +
        'plazo razonable, salvo que la ley exija su conservación por más tiempo.',
    ],
  },
  {
    title: '8. Seguridad de la información',
    blocks: [
      'Aplicamos medidas técnicas y organizativas razonables para proteger tus datos, incluyendo ' +
        'cifrado de contraseñas, transmisión de datos mediante conexiones seguras y controles de acceso a ' +
        'nuestros sistemas. Sin embargo, ningún sistema es completamente infalible; te recomendamos usar ' +
        'una contraseña robusta y no compartirla con terceros.',
    ],
  },
  {
    title: '9. Tus derechos',
    blocks: [
      'Sobre tus datos personales, puedes en todo momento:',
      {
        items: [
          'Acceder, actualizar o corregir tu información desde la sección de perfil.',
          'Solicitar la eliminación de tu cuenta y de tus datos personales.',
          'Retirar tu consentimiento para el uso de geolocalización o notificaciones push.',
          'Solicitar una copia de los datos personales que tenemos sobre ti.',
          'Oponerte a determinados tratamientos de tus datos, cuando la ley lo permita.',
        ],
      },
      'Para ejercer cualquiera de estos derechos, escríbenos a official.hexacodee@gmail.com.',
    ],
  },
  {
    title: '10. Almacenamiento local',
    blocks: [
      'Utilizamos almacenamiento local en tu dispositivo (AsyncStorage) para mantener tu sesión ' +
        'iniciada, recordar tus preferencias (como el modo oscuro) y guardar temporalmente tu última ' +
        'ubicación conocida para mejorar el rendimiento de la app. Puedes borrar esta información ' +
        'desinstalando la aplicación o cerrando sesión, aunque ello puede restablecer tus preferencias.',
    ],
  },
  {
    title: '11. Notificaciones push',
    blocks: [
      'Si aceptas recibir notificaciones, te enviaremos avisos sobre alertas cercanas, respuestas a tus ' +
        'comentarios y novedades relevantes del Servicio. Puedes desactivar las notificaciones en ' +
        'cualquier momento desde la configuración de tu dispositivo o desde los ajustes de la aplicación.',
    ],
  },
  {
    title: '12. Menores de edad',
    blocks: [
      'AlertaGT no está dirigido a menores de 13 años y no recopilamos intencionalmente datos ' +
        'personales de niños menores de esa edad. Si eres padre, madre o tutor y crees que un menor bajo ' +
        'tu cuidado nos ha proporcionado datos personales, contáctanos para solicitar su eliminación.',
    ],
  },
  {
    title: '13. Cambios a esta política',
    blocks: [
      'Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras ' +
        'prácticas o en la normativa aplicable. Publicaremos cualquier cambio en esta misma página junto ' +
        'con la fecha de última actualización, y te notificaremos dentro de la app cuando el cambio sea ' +
        'significativo.',
    ],
  },
  {
    title: '14. Contacto',
    blocks: [
      'Si tienes dudas, comentarios o solicitudes relacionadas con esta Política de Privacidad, ' +
        'escríbenos a official.hexacodee@gmail.com.',
    ],
  },
];

export default { PRIVACY_UPDATED_AT, PRIVACY_INTRO, PRIVACY_SECTIONS };
