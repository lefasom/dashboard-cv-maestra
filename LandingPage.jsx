import "./LandingPage.css";
import logoCV from "./src/assets/cvbelgrano.png";

// PEGAR AQUÍ EL ENLACE REAL DE DESCARGA DEL APK.
const URL_DESCARGA_APK = "";

/* ------------------------------------------------------------------
   CAPTURAS DE LA APP

   Cada captura tiene un `archivo` en src/assets. Si el archivo existe se
   muestra la imagen; si no, un RECUADRO que dice qué pantalla va ahí
   (por ejemplo "Mis perfiles") y el nombre exacto del PNG que falta.

   Ya existen: pantalla_app, pantalla_plantillas, pantalla_plantillas_oscuro,
   pantalla_chat, pantalla_pregunta_momento, pantalla_pregunta_area,
   pantalla_pregunta_extras, pantalla_panel_experiencia,
   pantalla_datos_personales.
   Faltan: pantalla_editor_plantilla, pantalla_vista_ats,
   pantalla_mis_perfiles, pantalla_mis_cvs, pantalla_accesible_ajustes,
   pantalla_accesible_plantillas, pantalla_accesible_explorar.

   Medida ideal: 724 x 1610, solo la pantalla (sin marco del celular).
------------------------------------------------------------------ */
const imagenes = import.meta.glob("./src/assets/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const urlImagen = (nombre) =>
  nombre ? imagenes[`./src/assets/${nombre}`] || "" : "";

// Pantalla de celular: imagen real o recuadro con la descripción
function Captura({ titulo, detalle, archivo }) {
  const src = urlImagen(archivo);

  return (
    <div className="landing-pantalla">
      {src ? (
        <img
          src={src}
          alt={`${titulo}. ${detalle ?? ""}`}
          width="724"
          height="1610"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="landing-captura" role="img" aria-label={`Captura: ${titulo}`}>
          <span className="landing-captura-tag">CAPTURA</span>
          <strong>{titulo}</strong>
          {detalle && <span>{detalle}</span>}
          {archivo && <code>src/assets/{archivo}</code>}
        </div>
      )}
    </div>
  );
}

// Flecha de descarga gruesa dentro de un círculo.
function IconoDescarga() {
  return (
    <span className="landing-download-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d="M12 4v12" />
        <path d="M6.5 11.5L12 17l5.5-5.5" />
        <path d="M6 21h12" />
      </svg>
    </span>
  );
}

// Ícono de accesibilidad de Android (Material "accessibility").
function IconoAccesibilidad() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
    </svg>
  );
}

// Botón de descarga (si todavía no hay enlace, se muestra sin acción)
function BotonDescarga({ claro = false, texto = "Descargar gratis para Android" }) {
  const clase = `landing-boton${claro ? " landing-boton-claro" : ""}`;
  const contenido = (
    <>
      <IconoDescarga />
      <span>
        {texto}
        <small>Archivo APK · 100% gratuita</small>
      </span>
    </>
  );

  return URL_DESCARGA_APK ? (
    <a href={URL_DESCARGA_APK} className={clase} target="_blank" rel="noopener noreferrer">
      {contenido}
    </a>
  ) : (
    <div className={`${clase} landing-boton-pendiente`}>{contenido}</div>
  );
}

const Check = () => (
  <span className="landing-lista-check" aria-hidden="true">✓</span>
);

const PREGUNTAS = [
  {
    p: "¿Cuánto cuesta?",
    r: "Nada. CV Belgrano es gratuita: creás, editás y descargás tus CV en PDF sin pagar.",
  },
  {
    p: "¿Tengo que crear una cuenta?",
    r: "No. Abrís la app y empezás. No pedimos correo, contraseña ni registro.",
  },
  {
    p: "¿Dónde quedan mis datos?",
    r: "En tu celular. Tus perfiles y tus CV se guardan en el teléfono, no en una cuenta en internet.",
  },
  {
    p: "¿Sirve si es mi primer CV?",
    r: "Sí. Elegís \"es mi primer CV\" y la app te muestra solo los campos que te sirven, con ejemplos para completar cada parte.",
  },
  {
    p: "¿Los CV pasan los filtros automáticos de las empresas?",
    r: "Cada área tiene una versión ATS: un diseño simple y limpio, pensado para que los sistemas de selección lean bien tu información.",
  },
  {
    p: "¿Por qué se descarga como APK?",
    r: "Es la versión inicial para Android. Descargás el archivo, lo abrís y lo instalás en un minuto. Más abajo te mostramos cómo.",
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page">

      {/* ============ HERO ============ */}

      <section className="landing-hero">
        <div className="landing-contenido">
          <div className="landing-identidad">
            <img src={logoCV} alt="Logo de CV Belgrano" className="landing-logo" />
            <div>
              <h1>CV Belgrano</h1>
              <p>Currículum Vitae Belgrano</p>
            </div>
          </div>

          <div className="landing-texto">
            <span className="landing-etiqueta">TU CV PROFESIONAL, DESDE EL CELULAR</span>

            <h2>
              Armá un CV que te represente
              <span> y tenelo listo para la próxima oportunidad.</span>
            </h2>

            <p>
              Respondés 3 preguntas, completás tus datos con ejemplos de tu
              área y elegís entre más de 60 diseños. En minutos tenés tu
              currículum en PDF, listo para enviar por WhatsApp o por mail.
            </p>

            <div className="landing-hero-cta">
              <BotonDescarga />
            </div>

            <ul className="landing-chips" aria-label="Ventajas principales">
              <li>Gratis</li>
              <li>Sin registro</li>
              <li>Tus datos quedan en tu celular</li>
              <li>PDF en un toque</li>
            </ul>
          </div>
        </div>

        <div className="landing-telefonos">
          <div className="landing-decoracion" aria-hidden="true" />
          <div className="landing-telefono landing-telefono-uno">
            <Captura
              archivo="pantalla_app.png"
              titulo="Inicio · panel principal"
              detalle="Los tres pasos para crear tu CV"
            />
          </div>
          <div className="landing-telefono landing-telefono-dos">
            <Captura
              archivo="pantalla_plantillas.png"
              titulo="Mis plantillas · modo claro"
              detalle="Selección y personalización de plantillas"
            />
          </div>
        </div>
      </section>

      {/* ============ FRANJA DE NÚMEROS ============ */}

      <section className="landing-franja" aria-label="CV Belgrano en números">
        <div className="landing-franja-interior">
          <ul className="landing-numeros">
            <li><strong>66</strong><span>plantillas</span></li>
            <li><strong>11</strong><span>áreas de trabajo</span></li>
            <li><strong>3</strong><span>preguntas para empezar</span></li>
            <li><strong>$0</strong><span>siempre gratis</span></li>
          </ul>
        </div>
      </section>

      {/* ============ EL PROBLEMA ============ */}

      <section className="landing-siempre" aria-labelledby="landing-problema-titulo">
        <div className="landing-siempre-interior">
          <div className="landing-siempre-cabecera">
            <span className="landing-etiqueta">¿TE PASÓ?</span>
            <h2 id="landing-problema-titulo">
              Te piden el CV para mañana y no sabés por dónde empezar.
            </h2>
            <p>
              Armar un currículum desde cero cuesta: qué poner, cómo
              ordenarlo, qué diseño usar. CV Belgrano resuelve todo eso
              desde el celular.
            </p>
          </div>

          <div className="landing-siempre-columnas">
            <div>
              <h3>"No sé qué escribir"</h3>
              <p>Te damos ejemplos pensados para tu área en cada sección.</p>
            </div>
            <div>
              <h3>"No tengo computadora"</h3>
              <p>Lo armás, lo editás y lo descargás en PDF desde el teléfono.</p>
            </div>
            <div>
              <h3>"Lo tengo desactualizado"</h3>
              <p>Tus datos quedan guardados: sumás lo nuevo y lo descargás al día.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}

      <section className="landing-experiencia" aria-labelledby="landing-pasos-titulo">
        <div className="landing-experiencia-interior">
          <div className="landing-experiencia-cabecera">
            <span className="landing-etiqueta">CÓMO FUNCIONA</span>
            <h2 id="landing-pasos-titulo">De cero a tu CV en PDF, en 4 pasos.</h2>
            <p>Sin cuentas, sin vueltas y sin saber de diseño.</p>
          </div>

          <ol className="landing-instalar landing-pasos">
            <li>
              <span className="landing-galeria-numero">1</span>
              <div>
                <h3>Contanos de vos</h3>
                <p>Tu momento laboral, tu área y lo que querés sumar.</p>
              </div>
            </li>
            <li>
              <span className="landing-galeria-numero">2</span>
              <div>
                <h3>Completá tus datos</h3>
                <p>Solo los campos que te sirven, con ejemplos al lado.</p>
              </div>
            </li>
            <li>
              <span className="landing-galeria-numero">3</span>
              <div>
                <h3>Elegí tu diseño</h3>
                <p>Probalos con tus datos y quedate con el que más te guste.</p>
              </div>
            </li>
            <li>
              <span className="landing-galeria-numero">4</span>
              <div>
                <h3>Descargá y enviá</h3>
                <p>Tu CV en PDF, listo para WhatsApp, mail o imprimir.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ============ EXPERIENCIA MEJORADA: LAS 3 PREGUNTAS ============ */}

      <section className="landing-experiencia" aria-labelledby="landing-experiencia-titulo">
        <div className="landing-experiencia-interior">
          <div className="landing-experiencia-cabecera">
            <span className="landing-etiqueta">EXPERIENCIA MEJORADA</span>
            <h2 id="landing-experiencia-titulo">
              Respondé 3 preguntas y la app se adapta a vos.
            </h2>
            <p>
              Elegís tu momento laboral, el área en la que querés trabajar
              y qué más querés sumar a tu CV. Son tres preguntas de
              selección que se responden en menos de un minuto.
            </p>
          </div>

          <div className="landing-galeria">
            <figure className="landing-galeria-item">
              <Captura
                archivo="pantalla_pregunta_momento.png"
                titulo="Pregunta 1 · momento laboral"
                detalle="Tengo experiencia, trabajo independiente o es mi primer CV"
              />
              <figcaption>
                <span className="landing-galeria-numero">1</span>
                <strong>Tu momento laboral</strong>
                <span>Tengo experiencia, trabajo de forma independiente o es mi primer CV.</span>
              </figcaption>
            </figure>

            <figure className="landing-galeria-item">
              <Captura
                archivo="pantalla_pregunta_area.png"
                titulo="Pregunta 2 · área de trabajo"
                detalle="Atención al cliente, tecnología, salud, deportes…"
              />
              <figcaption>
                <span className="landing-galeria-numero">2</span>
                <strong>Tu área de trabajo</strong>
                <span>Atención al cliente, tecnología, salud, deportes, oficios y más.</span>
              </figcaption>
            </figure>

            <figure className="landing-galeria-item">
              <Captura
                archivo="pantalla_pregunta_extras.png"
                titulo="Pregunta 3 · ¿tenés alguno de estos?"
                detalle="Certificaciones, idiomas, licencia, GitHub…"
              />
              <figcaption>
                <span className="landing-galeria-numero">3</span>
                <strong>Lo que querés sumar</strong>
                <span>Certificaciones, idiomas, licencia de conducir, GitHub y más, según tu área.</span>
              </figcaption>
            </figure>
          </div>

          <div className="landing-desbloqueo">
            <div>
              <h3>Ejemplos para tu área</h3>
              <p>Al responder, desbloqueás ejemplos pensados para lo que vas a completar.</p>
            </div>
            <div>
              <h3>Formularios a tu medida</h3>
              <p>Ves solo los campos que te sirven, sin completar datos de más.</p>
            </div>
            <div>
              <h3>Menos de un minuto</h3>
              <p>Tres preguntas rápidas y tu experiencia queda personalizada.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FORMULARIOS Y PANEL ============ */}

      <section className="landing-formularios" aria-labelledby="landing-formularios-titulo">
        <div className="landing-formularios-telefonos">
          <figure className="landing-formularios-item">
            <Captura
              archivo="pantalla_panel_experiencia.png"
              titulo="Panel principal · administrar experiencia mejorada"
              detalle="Experiencia mejorada activada"
            />
            <figcaption>Activá y administrá tu experiencia</figcaption>
          </figure>
          <figure className="landing-formularios-item landing-formularios-item-dos">
            <Captura
              archivo="pantalla_datos_personales.png"
              titulo="Datos personales · formulario"
              detalle="Contacto, perfil, educación, habilidades, redes e idiomas"
            />
            <figcaption>Datos personales, ordenados por secciones</figcaption>
          </figure>
        </div>

        <div className="landing-formularios-texto">
          <span className="landing-etiqueta">COMPLETÁ SOLO LO QUE IMPORTA</span>
          <h2 id="landing-formularios-titulo">
            Un formulario ordenado, que se ajusta a tus respuestas.
          </h2>
          <p>
            Tus datos se organizan en secciones que se abren y se cierran:
            contacto, perfil profesional, educación, habilidades, redes e
            idiomas. Completás una por una, a tu ritmo, con una foto de
            perfil opcional.
          </p>
          <ul className="landing-lista">
            <li><Check />Secciones desplegables para no perderte</li>
            <li><Check />Ejemplos que te guían mientras escribís</li>
            <li><Check />Plantillas recomendadas para tu rubro</li>
            <li><Check />Administrá tu experiencia mejorada cuando quieras</li>
          </ul>
        </div>
      </section>

      {/* ============ PLANTILLAS ============ */}

      <section className="landing-oscuro landing-plantillas" aria-labelledby="landing-plantillas-titulo">
        <div className="landing-oscuro-texto">
          <span className="landing-etiqueta">DISEÑOS QUE SE NOTAN</span>
          <h2 id="landing-plantillas-titulo">
            66 plantillas pensadas para cada área de trabajo.
          </h2>
          <p>
            Atención al cliente, tecnología, salud, oficios, deportes y
            más: cada área tiene sus propios diseños y una versión ATS,
            simple y limpia, para que los sistemas de selección lean bien
            tu información.
          </p>
          <ul className="landing-lista">
            <li><Check />Cambiás de diseño sin volver a escribir nada</li>
            <li><Check />Ordenás y ocultás secciones a tu gusto</li>
            <li><Check />Ajustás el tamaño de letra para que entre todo</li>
            <li><Check />Vista previa real antes de descargar</li>
          </ul>
        </div>

        <div className="landing-oscuro-telefonos">
          <figure className="landing-oscuro-item landing-oscuro-item-uno">
            <Captura
              archivo="pantalla_editor_plantilla.png"
              titulo="Editor de plantilla"
              detalle="Orden de secciones y tamaño de letra"
            />
            <figcaption>Personalizá cada detalle</figcaption>
          </figure>
          <figure className="landing-oscuro-item landing-oscuro-item-dos">
            <Captura
              archivo="pantalla_vista_ats.png"
              titulo="Vista previa del CV · versión ATS"
              detalle="Diseño simple, listo para filtros automáticos"
            />
            <figcaption>Versión ATS en cada área</figcaption>
          </figure>
        </div>
      </section>

      {/* ============ PERFILES Y MIS CVs ============ */}

      <section className="landing-formularios" aria-labelledby="landing-perfiles-titulo">
        <div className="landing-formularios-telefonos">
          <figure className="landing-formularios-item">
            <Captura
              archivo="pantalla_mis_perfiles.png"
              titulo="Mis perfiles"
              detalle="Varios perfiles guardados en el celular"
            />
            <figcaption>Un perfil para cada búsqueda</figcaption>
          </figure>
          <figure className="landing-formularios-item landing-formularios-item-dos">
            <Captura
              archivo="pantalla_mis_cvs.png"
              titulo="Mis CVs · descargas"
              detalle="Todos tus PDF en un solo lugar"
            />
            <figcaption>Tus CV siempre a mano</figcaption>
          </figure>
        </div>

        <div className="landing-formularios-texto">
          <span className="landing-etiqueta">SIEMPRE PREPARADO</span>
          <h2 id="landing-perfiles-titulo">
            Que tu CV nunca te agarre desprevenido.
          </h2>
          <p>
            Guardá varios perfiles (por ejemplo, uno para atención al
            cliente y otro para administración) y todos los PDF que
            descargues. Cuando aparece una oportunidad, tu CV ya está ahí.
          </p>
          <ul className="landing-lista">
            <li><Check />Varios perfiles en la misma app</li>
            <li><Check />Historial de CV descargados en "Mis CVs"</li>
            <li><Check />Actualizás un dato y descargás la versión nueva</li>
          </ul>
        </div>
      </section>

      {/* ============ PRIVACIDAD Y SIMPLICIDAD ============ */}

      <section className="landing-siempre" aria-labelledby="landing-privacidad-titulo">
        <div className="landing-siempre-interior">
          <div className="landing-siempre-cabecera">
            <span className="landing-etiqueta">SIMPLE Y PRIVADA</span>
            <h2 id="landing-privacidad-titulo">Tu información es tuya.</h2>
            <p>
              Sin cuentas, sin contraseñas y sin pagos. Tus datos
              personales se guardan en tu celular.
            </p>
          </div>

          <div className="landing-siempre-columnas">
            <div>
              <h3>Sin registro</h3>
              <p>Abrís la app y empezás. No te pedimos correo ni contraseña.</p>
            </div>
            <div>
              <h3>En tu celular</h3>
              <p>Tus perfiles y tus CV quedan guardados en el teléfono.</p>
            </div>
            <div>
              <h3>En tu idioma</h3>
              <p>Usala en español, inglés o portugués, cuando quieras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMUNIDAD Y MODO OSCURO ============ */}

      <section className="landing-oscuro" aria-labelledby="landing-oscuro-titulo">
        <div className="landing-oscuro-texto">
          <span className="landing-etiqueta">COMUNIDAD Y MODO OSCURO</span>
          <h2 id="landing-oscuro-titulo">Una app que crece con vos, de día o de noche.</h2>
          <p>
            Desde el chat de ayuda hablás con el equipo, recibís
            novedades y votás en encuestas cortas. Tu opinión decide qué
            mejoramos. Y con el modo oscuro, todo se ve cómodo a
            cualquier hora.
          </p>
          <ul className="landing-lista">
            <li><Check />Chat de ayuda dentro de la app</li>
            <li><Check />Encuestas para opinar sobre los diseños</li>
            <li><Check />Modo oscuro en toda la aplicación</li>
          </ul>
          <p className="landing-oscuro-nota">
            Tu opinión nos ayuda a seguir mejorando: la app crece junto
            con la comunidad.
          </p>
        </div>

        <div className="landing-oscuro-telefonos">
          <figure className="landing-oscuro-item landing-oscuro-item-uno">
            <Captura
              archivo="pantalla_plantillas_oscuro.png"
              titulo="Mis plantillas · modo oscuro"
              detalle="La misma app, cómoda de noche"
            />
            <figcaption>Modo oscuro</figcaption>
          </figure>
          <figure className="landing-oscuro-item landing-oscuro-item-dos">
            <Captura
              archivo="pantalla_chat.png"
              titulo="Chat de ayuda · encuestas"
              detalle="Mensaje del equipo y encuesta con resultados"
            />
            <figcaption>Chat con el equipo</figcaption>
          </figure>
        </div>
      </section>

      {/* ============ ACCESIBILIDAD ============ */}

      <section className="landing-accesibilidad">
        <div className="landing-accesibilidad-icono" aria-hidden="true">
          <IconoAccesibilidad />
        </div>

        <div className="landing-accesibilidad-texto">
          <span className="landing-etiqueta">DISEÑADA PARA TODOS</span>
          <h2>
            La accesibilidad no es una función adicional. Es parte de la
            experiencia.
          </h2>
          <p>
            CV Belgrano tiene un modo accesible pensado para quienes usan
            lectores de pantalla como TalkBack: podés crear, organizar y
            descargar tus currículums sin depender de elementos visuales.
          </p>
          <p>
            Porque todas las personas merecen las mismas oportunidades
            para construir su futuro laboral.
          </p>
          <ul className="landing-lista">
            <li><Check />Se activa solo con TalkBack o desde Ajustes ("Modo accesible")</li>
            <li><Check />Plantillas en 3 pasos, con el diseño descrito en palabras</li>
            <li><Check />"Explorar CV": escuchá tu currículum antes de descargarlo</li>
            <li><Check />Botones grandes y avisos en español, inglés y portugués</li>
            <li><Check />Mismas plantillas y mismas funciones: la accesibilidad no se cobra</li>
          </ul>
        </div>

        <div className="landing-accesibilidad-capturas">
          <figure className="landing-oscuro-item">
            <Captura
              archivo="pantalla_accesible_ajustes.png"
              titulo="Ajustes · Modo accesible"
              detalle="El interruptor que activa la vista accesible"
            />
            <figcaption>Se activa en un toque</figcaption>
          </figure>
          <figure className="landing-oscuro-item">
            <Captura
              archivo="pantalla_accesible_plantillas.png"
              titulo="Modo accesible · Plantillas"
              detalle="Elegir diseño en 3 pasos, con botones grandes"
            />
            <figcaption>Plantillas en 3 pasos</figcaption>
          </figure>
          <figure className="landing-oscuro-item">
            <Captura
              archivo="pantalla_accesible_explorar.png"
              titulo="Modo accesible · Explorar CV"
              detalle="El CV leído por secciones, sin abrir el PDF"
            />
            <figcaption>Escuchá tu CV</figcaption>
          </figure>
        </div>
      </section>

      {/* ============ CÓMO INSTALAR EL APK ============ */}

      <section className="landing-siempre" aria-labelledby="landing-instalar-titulo">
        <div className="landing-siempre-interior">
          <div className="landing-siempre-cabecera">
            <span className="landing-etiqueta">INSTALALA EN 1 MINUTO</span>
            <h2 id="landing-instalar-titulo">Cómo instalar CV Belgrano en Android.</h2>
            <p>
              La versión inicial se descarga como archivo APK, directo
              desde esta página.
            </p>
          </div>

          <ol className="landing-instalar">
            <li>
              <span className="landing-galeria-numero">1</span>
              <div>
                <h3>Descargá el archivo</h3>
                <p>Tocá "Descargar gratis para Android" desde tu celular.</p>
              </div>
            </li>
            <li>
              <span className="landing-galeria-numero">2</span>
              <div>
                <h3>Abrilo e instalá</h3>
                <p>
                  Si Android te lo pide, permití instalar apps de esta
                  fuente. Es un paso normal para apps fuera del Play Store.
                </p>
              </div>
            </li>
            <li>
              <span className="landing-galeria-numero">3</span>
              <div>
                <h3>Creá tu primer CV</h3>
                <p>Abrí CV Belgrano, respondé las 3 preguntas y empezá.</p>
              </div>
            </li>
          </ol>

          <div className="landing-centro">
            <BotonDescarga />
          </div>
        </div>
      </section>

      {/* ============ PREGUNTAS FRECUENTES ============ */}

      <section className="landing-experiencia" aria-labelledby="landing-faq-titulo">
        <div className="landing-experiencia-interior">
          <div className="landing-experiencia-cabecera">
            <span className="landing-etiqueta">PREGUNTAS FRECUENTES</span>
            <h2 id="landing-faq-titulo">Lo que todos preguntan.</h2>
          </div>

          <div className="landing-faq">
            {PREGUNTAS.map(({ p, r }) => (
              <details key={p}>
                <summary>{p}</summary>
                <p>{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CIERRE ============ */}

      <section className="landing-cierre">
        <h2>Tu próxima oportunidad puede llegar hoy.</h2>
        <p>Tené tu CV listo. Descargá CV Belgrano gratis y armalo en minutos.</p>
        <BotonDescarga claro texto="Descargar CV Belgrano" />
        <span className="landing-gratuita">
          CV Belgrano · Gratis · Sin registro · Android
        </span>
      </section>

    </main>
  );
}
