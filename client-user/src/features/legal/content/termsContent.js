// client-user/src/features/legal/content/termsContent.js
// Contenido de Términos de Servicio, adaptado del mismo texto que usa
// client-admin (web) en src/features/legal/pages/TermsOfServicePage.jsx.
// Cada sección es { title, blocks }, donde un block es un string (párrafo)
// o { items: [...] } (lista con viñetas).

export const TERMS_UPDATED_AT = '2 de julio de 2026';

export const TERMS_INTRO =
  'Bienvenido a AlertaGT. Estos Términos de Servicio ("Términos") regulan el acceso y uso de la ' +
  'aplicación móvil y web AlertaGT (la "Plataforma" o el "Servicio"), operada en Guatemala. Al crear ' +
  'una cuenta o utilizar la Plataforma, aceptas quedar vinculado por estos Términos y por nuestra ' +
  'Política de Privacidad. Si no estás de acuerdo, no debes utilizar el Servicio.';

export const TERMS_SECTIONS = [
  {
    title: '1. Objeto del servicio',
    blocks: [
      'AlertaGT es una plataforma comunitaria que permite a sus usuarios publicar, visualizar y ' +
        'comentar alertas sobre incidentes de tráfico, seguridad y otros eventos relevantes en su ' +
        'entorno geográfico, con el fin de informar a la comunidad en tiempo real. El Servicio incluye, ' +
        'entre otras funciones, publicación de alertas con fotografías y ubicación, un mapa interactivo, ' +
        'notificaciones push y gestión de perfil de usuario.',
    ],
  },
  {
    title: '2. Elegibilidad y cuenta de usuario',
    blocks: [
      'Debes tener al menos 13 años para crear una cuenta. Si eres menor de 18 años, declaras contar ' +
        'con el consentimiento de tu padre, madre o tutor legal para usar la Plataforma. Eres responsable ' +
        'de mantener la confidencialidad de tus credenciales de acceso y de toda actividad realizada bajo ' +
        'tu cuenta. Debes proporcionar información veraz, actual y completa al registrarte, incluyendo ' +
        'nombre, apellido, nombre de usuario, correo electrónico, teléfono y dirección, y mantenerla ' +
        'actualizada.',
    ],
  },
  {
    title: '3. Uso de geolocalización',
    blocks: [
      'AlertaGT utiliza los servicios de geolocalización de tu dispositivo para mostrarte alertas ' +
        'cercanas, calcular distancias, ubicar tus publicaciones en el mapa y enviarte notificaciones ' +
        'relevantes a tu zona. Al conceder permiso de ubicación desde la configuración de tu dispositivo, ' +
        'autorizas a AlertaGT a recopilar y procesar tus coordenadas GPS mientras utilizas la aplicación. ' +
        'Puedes revocar este permiso en cualquier momento desde los ajustes de tu dispositivo, aunque ello ' +
        'puede limitar funcionalidades como el mapa de alertas cercanas o el cálculo de distancia. Para ' +
        'más detalle, consulta la sección de geolocalización de nuestra Política de Privacidad.',
    ],
  },
  {
    title: '4. Contenido generado por usuarios',
    blocks: [
      'Al publicar una alerta, comentario, fotografía o cualquier otro contenido ("Contenido de ' +
        'Usuario"), declaras que tienes los derechos necesarios sobre dicho contenido y otorgas a ' +
        'AlertaGT una licencia no exclusiva, mundial y libre de regalías para almacenar, mostrar, ' +
        'reproducir y distribuir ese contenido dentro de la Plataforma, con el único fin de operar y ' +
        'mejorar el Servicio. Conservas la titularidad de tu Contenido de Usuario. Eres el único ' +
        'responsable de la exactitud, legalidad y adecuación del contenido que publiques.',
    ],
  },
  {
    title: '5. Conducta prohibida',
    blocks: [
      'Al usar AlertaGT, te comprometes a no:',
      {
        items: [
          'Publicar alertas falsas, engañosas o con la intención de causar pánico o alarma injustificada.',
          'Publicar contenido difamatorio, discriminatorio, violento, sexual o que incite al odio.',
          'Suplantar la identidad de otra persona, autoridad o entidad.',
          'Acosar, amenazar o divulgar información privada de terceros sin su consentimiento.',
          'Utilizar la Plataforma para fines comerciales no autorizados, spam o actividades fraudulentas.',
          'Intentar vulnerar la seguridad, disponibilidad o integridad de la Plataforma o de otros usuarios.',
        ],
      },
      'Nos reservamos el derecho de eliminar cualquier contenido que infrinja estos Términos y de ' +
        'suspender o eliminar las cuentas que reincidan en dichas conductas, conforme a la sección 8.',
    ],
  },
  {
    title: '6. Naturaleza de las alertas',
    blocks: [
      'Las alertas publicadas en AlertaGT son generadas por miembros de la comunidad y no constituyen ' +
        'comunicados oficiales de autoridades gubernamentales, policiales, de bomberos o de emergencia. ' +
        'AlertaGT no garantiza la veracidad, exactitud, integridad ni actualidad de las alertas publicadas ' +
        'por los usuarios. En caso de una emergencia real, contacta siempre a las autoridades competentes ' +
        'o a los números de emergencia oficiales de Guatemala.',
    ],
  },
  {
    title: '7. Propiedad intelectual',
    blocks: [
      'El nombre "AlertaGT", el logotipo, la interfaz, el software y demás elementos propios de la ' +
        'Plataforma (excluyendo el Contenido de Usuario) son propiedad de AlertaGT o de sus licenciantes y ' +
        'están protegidos por las leyes de propiedad intelectual aplicables. No se concede ninguna ' +
        'licencia sobre estos elementos salvo lo estrictamente necesario para el uso normal del Servicio.',
    ],
  },
  {
    title: '8. Suspensión y terminación',
    blocks: [
      'Podemos suspender o cancelar tu cuenta, de forma temporal o permanente, si incumples estos ' +
        'Términos, si tu conducta representa un riesgo para otros usuarios o para la integridad de la ' +
        'Plataforma, o por requerimiento legal. Puedes solicitar la eliminación de tu cuenta en cualquier ' +
        'momento desde la sección de perfil o escribiéndonos a official.hexacodee@gmail.com.',
    ],
  },
  {
    title: '9. Exclusión de garantías',
    blocks: [
      'El Servicio se ofrece "tal cual" y "según disponibilidad", sin garantías de ningún tipo, ya sean ' +
        'expresas o implícitas, incluyendo garantías de disponibilidad ininterrumpida, ausencia de ' +
        'errores, o idoneidad para un propósito particular. No garantizamos que la información ' +
        'proporcionada por otros usuarios sea precisa o esté libre de errores.',
    ],
  },
  {
    title: '10. Limitación de responsabilidad',
    blocks: [
      'En la máxima medida permitida por la ley aplicable, AlertaGT no será responsable por daños ' +
        'indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de uso ' +
        'del Servicio, ni por decisiones tomadas con base en el contenido publicado por otros usuarios, ' +
        'incluyendo alertas de tráfico o seguridad.',
    ],
  },
  {
    title: '11. Indemnización',
    blocks: [
      'Aceptas indemnizar y mantener indemne a AlertaGT frente a cualquier reclamo, daño o gasto ' +
        'razonable derivado del incumplimiento de estos Términos o del uso indebido de la Plataforma por ' +
        'tu parte.',
    ],
  },
  {
    title: '12. Modificaciones del servicio y de los términos',
    blocks: [
      'Podemos actualizar estos Términos periódicamente para reflejar cambios legales, técnicos o del ' +
        'Servicio. Publicaremos la versión vigente en esta página junto con la fecha de última ' +
        'actualización. El uso continuado de la Plataforma tras la publicación de los cambios constituye ' +
        'tu aceptación de los nuevos Términos.',
    ],
  },
  {
    title: '13. Ley aplicable y jurisdicción',
    blocks: [
      'Estos Términos se rigen por las leyes de la República de Guatemala. Cualquier controversia ' +
        'derivada de su interpretación o cumplimiento se someterá a los tribunales competentes de la ' +
        'Ciudad de Guatemala, salvo que la ley aplicable disponga lo contrario.',
    ],
  },
  {
    title: '14. Contacto',
    blocks: [
      'Si tienes preguntas sobre estos Términos, puedes escribirnos a official.hexacodee@gmail.com.',
    ],
  },
];

export default { TERMS_UPDATED_AT, TERMS_INTRO, TERMS_SECTIONS };
