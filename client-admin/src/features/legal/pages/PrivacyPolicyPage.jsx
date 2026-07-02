import { LegalLayout } from '../components/LegalLayout.jsx'

export const PrivacyPolicyPage = () => (
  <LegalLayout title='Política de Privacidad' updatedAt='2 de julio de 2026'>
    <p className='legal-intro'>
      En AlertaGT nos tomamos en serio la privacidad de nuestra comunidad. Esta Política de Privacidad
      explica qué datos personales recopilamos, con qué finalidad los tratamos, cómo los protegemos y
      cuáles son tus derechos sobre ellos. Al usar la aplicación AlertaGT (el "Servicio"), aceptas las
      prácticas descritas en este documento, en conjunto con nuestros{' '}
      <a href='/terms'>Términos de Servicio</a>.
    </p>

    <nav className='legal-toc' aria-label='Contenido'>
      <span className='legal-toc-title'>Contenido</span>
      <ol>
        <li><a href='#responsable'>1. Responsable del tratamiento</a></li>
        <li><a href='#datos-recopilados'>2. Datos que recopilamos</a></li>
        <li><a href='#geolocalizacion'>3. Datos de geolocalización</a></li>
        <li><a href='#finalidad'>4. Finalidad del tratamiento</a></li>
        <li><a href='#base-legal'>5. Base legal</a></li>
        <li><a href='#comparticion'>6. Con quién compartimos tu información</a></li>
        <li><a href='#conservacion'>7. Conservación de los datos</a></li>
        <li><a href='#seguridad'>8. Seguridad de la información</a></li>
        <li><a href='#derechos'>9. Tus derechos</a></li>
        <li><a href='#cookies'>10. Cookies y almacenamiento local</a></li>
        <li><a href='#notificaciones'>11. Notificaciones push</a></li>
        <li><a href='#menores'>12. Menores de edad</a></li>
        <li><a href='#cambios'>13. Cambios a esta política</a></li>
        <li><a href='#contacto'>14. Contacto</a></li>
      </ol>
    </nav>

    <section id='responsable'>
      <h3>1. Responsable del tratamiento</h3>
      <p>
        AlertaGT ("nosotros") es responsable del tratamiento de los datos personales recopilados a
        través de la aplicación y el sitio web AlertaGT. Para cualquier consulta relacionada con
        privacidad, puedes contactarnos en{' '}
        <a href='mailto:official.hexacodee@gmail.com'>official.hexacodee@gmail.com</a>.
      </p>
    </section>

    <section id='datos-recopilados'>
      <h3>2. Datos que recopilamos</h3>
      <p>Recopilamos los siguientes tipos de información:</p>
      <ul>
        <li>
          <strong>Datos de registro:</strong> nombre, apellido, nombre de usuario, correo electrónico,
          número de teléfono, dirección, ciudad, país y contraseña (almacenada de forma cifrada).
        </li>
        <li>
          <strong>Foto de perfil:</strong> imagen opcional que subes al crear o editar tu cuenta.
        </li>
        <li>
          <strong>Contenido publicado:</strong> alertas, títulos, descripciones, categorías, nivel de
          riesgo, fotografías adjuntas y comentarios que publicas en la Plataforma.
        </li>
        <li>
          <strong>Datos de ubicación:</strong> coordenadas GPS aproximadas o precisas de tu dispositivo,
          recopiladas cuando concedes permiso de geolocalización.
        </li>
        <li>
          <strong>Datos técnicos y de uso:</strong> tipo de dispositivo, sistema operativo, identificadores
          de la aplicación, tokens de notificaciones push, registros de actividad (por ejemplo, alertas
          vistas, marcadas como favoritas o reportadas) y preferencias como el radio de alertas o el modo
          de visualización (claro/oscuro).
        </li>
      </ul>
    </section>

    <section id='geolocalizacion'>
      <h3>3. Datos de geolocalización</h3>
      <p>
        La geolocalización es central en el funcionamiento de AlertaGT. Utilizamos tu ubicación para:
        mostrarte alertas dentro de tu radio de interés, calcular la distancia entre tu posición actual y
        las alertas publicadas, ubicar tus propias publicaciones en el mapa comunitario y personalizar
        notificaciones sobre incidentes cercanos. El permiso de ubicación es gestionado por tu sistema
        operativo o navegador; puedes otorgarlo o revocarlo en cualquier momento desde la configuración de
        tu dispositivo. Si desactivas la geolocalización, algunas funciones (mapa de cercanía, distancia a
        alertas, notificaciones por zona) dejarán de estar disponibles, pero podrás seguir usando el resto
        de la Plataforma.
      </p>
    </section>

    <section id='finalidad'>
      <h3>4. Finalidad del tratamiento</h3>
      <p>Utilizamos tus datos personales para:</p>
      <ul>
        <li>Crear, autenticar y administrar tu cuenta de usuario.</li>
        <li>Mostrar, publicar y distribuir alertas y comentarios dentro de la comunidad.</li>
        <li>Calcular distancias y mostrar el mapa de alertas cercanas a tu ubicación.</li>
        <li>Enviarte notificaciones relevantes sobre alertas en tu zona.</li>
        <li>Mejorar la seguridad, el rendimiento y la experiencia general de la Plataforma.</li>
        <li>Detectar, prevenir y responder a fraude, abuso o contenido que infrinja nuestros Términos.</li>
        <li>Cumplir con obligaciones legales aplicables.</li>
      </ul>
    </section>

    <section id='base-legal'>
      <h3>5. Base legal</h3>
      <p>
        Tratamos tus datos con base en: (i) la ejecución del contrato que aceptas al registrarte y usar el
        Servicio; (ii) tu consentimiento, en particular para el acceso a la geolocalización y el envío de
        notificaciones push, el cual puedes retirar en cualquier momento; y (iii) nuestro interés legítimo
        en mantener la Plataforma segura y funcional para toda la comunidad.
      </p>
    </section>

    <section id='comparticion'>
      <h3>6. Con quién compartimos tu información</h3>
      <p>No vendemos tus datos personales. Podemos compartir información en los siguientes casos:</p>
      <ul>
        <li>
          <strong>Con otros usuarios:</strong> tu nombre de usuario, foto de perfil y el contenido que
          publiques (alertas y comentarios) son visibles para la comunidad de AlertaGT.
        </li>
        <li>
          <strong>Proveedores de servicios:</strong> utilizamos proveedores de infraestructura en la nube,
          almacenamiento de imágenes y mapas (por ejemplo, servicios de mapas basados en OpenStreetMap y
          CARTO) que procesan datos en nuestro nombre bajo obligaciones de confidencialidad.
        </li>
        <li>
          <strong>Requerimientos legales:</strong> cuando sea necesario para cumplir con la ley, proteger
          nuestros derechos o responder a un requerimiento válido de una autoridad competente.
        </li>
      </ul>
    </section>

    <section id='conservacion'>
      <h3>7. Conservación de los datos</h3>
      <p>
        Conservamos tus datos personales mientras tu cuenta permanezca activa y durante el tiempo
        adicional necesario para cumplir obligaciones legales, resolver disputas o hacer cumplir nuestros
        acuerdos. Si eliminas tu cuenta, borraremos o anonimizaremos tus datos personales dentro de un
        plazo razonable, salvo que la ley exija su conservación por más tiempo.
      </p>
    </section>

    <section id='seguridad'>
      <h3>8. Seguridad de la información</h3>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger tus datos, incluyendo cifrado
        de contraseñas, transmisión de datos mediante conexiones seguras y controles de acceso a nuestros
        sistemas. Sin embargo, ningún sistema es completamente infalible; te recomendamos usar una
        contraseña robusta y no compartirla con terceros.
      </p>
    </section>

    <section id='derechos'>
      <h3>9. Tus derechos</h3>
      <p>Sobre tus datos personales, puedes en todo momento:</p>
      <ul>
        <li>Acceder, actualizar o corregir tu información desde la sección de perfil.</li>
        <li>Solicitar la eliminación de tu cuenta y de tus datos personales.</li>
        <li>Retirar tu consentimiento para el uso de geolocalización o notificaciones push.</li>
        <li>Solicitar una copia de los datos personales que tenemos sobre ti.</li>
        <li>Oponerte a determinados tratamientos de tus datos, cuando la ley lo permita.</li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos, escríbenos a{' '}
        <a href='mailto:official.hexacodee@gmail.com'>official.hexacodee@gmail.com</a>.
      </p>
    </section>

    <section id='cookies'>
      <h3>10. Cookies y almacenamiento local</h3>
      <p>
        Utilizamos almacenamiento local y de sesión en tu dispositivo (equivalente a cookies) para
        mantener tu sesión iniciada, recordar tus preferencias (como el modo oscuro o el radio de
        alertas) y guardar temporalmente tu última ubicación conocida para mejorar el rendimiento de la
        app. Puedes borrar esta información desde la configuración de tu navegador o dispositivo, aunque
        ello puede cerrar tu sesión o restablecer tus preferencias.
      </p>
    </section>

    <section id='notificaciones'>
      <h3>11. Notificaciones push</h3>
      <p>
        Si aceptas recibir notificaciones, te enviaremos avisos sobre alertas cercanas, respuestas a tus
        comentarios y novedades relevantes del Servicio. Puedes desactivar las notificaciones en cualquier
        momento desde la configuración de tu dispositivo o desde los ajustes de la aplicación.
      </p>
    </section>

    <section id='menores'>
      <h3>12. Menores de edad</h3>
      <p>
        AlertaGT no está dirigido a menores de 13 años y no recopilamos intencionalmente datos personales
        de niños menores de esa edad. Si eres padre, madre o tutor y crees que un menor bajo tu cuidado
        nos ha proporcionado datos personales, contáctanos para solicitar su eliminación.
      </p>
    </section>

    <section id='cambios'>
      <h3>13. Cambios a esta política</h3>
      <p>
        Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras
        prácticas o en la normativa aplicable. Publicaremos cualquier cambio en esta misma página junto
        con la fecha de última actualización, y te notificaremos dentro de la app cuando el cambio sea
        significativo.
      </p>
    </section>

    <section id='contacto'>
      <h3>14. Contacto</h3>
      <p>
        Si tienes dudas, comentarios o solicitudes relacionadas con esta Política de Privacidad, escríbenos
        a <a href='mailto:official.hexacodee@gmail.com'>official.hexacodee@gmail.com</a>.
      </p>
    </section>
  </LegalLayout>
)
