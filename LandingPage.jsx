import "./LandingPage.css";
import logoCV from "./src/assets/cvbelgrano.png";

/* ------------------------------------------------------------------
   ENLACES DE DESCARGA

   Google Play es el canal principal. El APK queda como alternativa
   (por ejemplo, para los carteles con QR). Si un enlace está vacío,
   su botón se muestra sin acción.
------------------------------------------------------------------ */
const URL_GOOGLE_PLAY =
  "https://play.google.com/store/apps/details?id=com.cvbelgrano.app";
// PEGAR AQUÍ EL ENLACE REAL DE DESCARGA DEL APK.
const URL_DESCARGA_APK = "";

/* ------------------------------------------------------------------
   CAPTURAS DE LA APP

   Cada captura tiene un `archivo` en src/assets. Si el archivo existe se
   muestra la imagen; si no, un RECUADRO que dice qué pantalla va ahí
   y el nombre exacto del PNG que falta.

   Ya existen: pantalla_app, pantalla_plantillas, pantalla_plantillas_oscuro,
   pantalla_chat, pantalla_pregunta_momento, pantalla_pregunta_area,
   pantalla_pregunta_extras, pantalla_panel_experiencia,
   pantalla_datos_personales.

   Faltan (propuestas):
   - pantalla_vista_hojas.png       → vista previa con la línea roja de hoja
   - pantalla_explorar_pdf.png      → Explorar CV con el PDF real
   - pantalla_editor_plantilla.png  → editor: orden de secciones y letra
   - pantalla_premium_corona.png    → carrusel con corona y velo gris
   - pantalla_analizador.png        → resultado del analizador básico
   - pantalla_potenciar_ia.png      → "Analizar y potenciar con IA"
   - pantalla_tienda_planes.png     → tienda: Gratis, Premium, Super, Ultra
   - pantalla_mis_perfiles.png      → Mis perfiles
   - pantalla_mis_cvs.png           → Mis CVs con "Analizar CV"
   - pantalla_accesible_ajustes.png, pantalla_accesible_plantillas.png,
     pantalla_accesible_explorar.png → modo accesible

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

// Triángulo de "play" dentro de un círculo (genérico, sin logo de marca).
function IconoTienda() {
  return (
    <span className="landing-download-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
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

// Corona de premium.
function IconoCorona() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}

// Destellos de la IA.
function IconoDestellos() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M10 2l1.9 5.6L17.5 9.5l-5.6 1.9L10 17l-1.9-5.6L2.5 9.5l5.6-1.9L10 2zm8 10l.9 2.6 2.6.9-2.6.9L18 19l-.9-2.6-2.6-.9 2.6-.9L18 12z" />
    </svg>
  );
}

// Botón genérico: enlace si hay URL, caja sin acción si todavía no hay.
function Boton({ url, clase, icono, texto, detalle }) {
  const contenido = (
    <>
      {icono}
      <span>
        {texto}
        <small>{detalle}</small>
      </span>
    </>
  );

  return url ? (
    <a href={url} className={clase} target="_blank" rel="noopener noreferrer">
      {contenido}
    </a>
  ) : (
    <div className={`${clase} landing-boton-pendiente`}>{contenido}</div>
  );
}

function BotonPlay({ claro = false, texto = "Descargar gratis en Google Play" }) {
  return (
    <Boton
      url={URL_GOOGLE_PLAY}
      clase={`landing-boton${claro ? " landing-boton-claro" : ""}`}
      icono={<IconoTienda />}
      texto={texto}
      detalle="Android · Descarga y uso gratis"
    />
  );
}

function BotonApk() {
  return (
    <Boton
      url={URL_DESCARGA_APK}
      clase="landing-boton landing-boton-secundario"
      icono={<IconoDescarga />}
      texto="Descargar el APK"
      detalle="Instalación directa desde esta página"
    />
  );
}

const Check = () => (
  <span className="landing-lista-check" aria-hidden="true">✓</span>
);

/* ------------------------------------------------------------------
   PLANES (doc 47 del centro de mando). Precios en pesos argentinos;
   el precio final siempre es el que muestra Google Play.
------------------------------------------------------------------ */
const PLANES = [
  {
    id: "gratis",
    nombre: "Gratis",
    precio: "Uso gratis",
    periodo: "",
    resumen: "Creás, analizás y descargás tus CV sin pagar.",
    incluye: [
      "Más de 30 plantillas: ATS + 2 diseños por área",
      "Descarga de tus CV en PDF, sin marcas de agua",
      "Análisis y recomendaciones para tu CV",
      "Armado y orden automático de las secciones",
      "Chat de ayuda con historial de recomendaciones",
      "Modo accesible completo",
      "Un análisis con IA de regalo",
    ],
  },
  {
    id: "premium",
    nombre: "Premium",
    precio: "$1.500",
    periodo: "por mes",
    resumen: "Todos los diseños y la IA para pulir tu CV.",
    destacado: true,
    incluye: [
      "Todos los diseños premium, sin corona",
      "Toda la biblioteca de diseños",
      "5 \"Analizar y potenciar\" con IA por mes",
      "Exportá también en Word (.docx)",
      "Funciona 30 días sin conexión",
    ],
  },
  {
    id: "super",
    nombre: "Super",
    precio: "$2.900",
    periodo: "por mes",
    resumen: "Para quien se postula todas las semanas.",
    incluye: [
      "Todo lo de Premium",
      "10 \"Analizar y potenciar\" por semana",
      "Hasta 3 por día, para cada postulación",
      "Ideal para adaptar el CV a cada aviso",
    ],
  },
  {
    id: "ultra",
    nombre: "Ultra",
    precio: "Muy pronto",
    periodo: "",
    resumen: "Tu CV en otros idiomas, traducido con IA.",
    futuro: true,
    incluye: [
      "Todo lo de Super",
      "Traducción del CV con IA (es · en · pt)",
      "Para buscar trabajo fuera del país",
    ],
  },
];

const GRATIS = [
  { t: "Descarga de tus CV", d: "Tus CV en PDF, todas las veces que quieras, sin marcas de agua." },
  { t: "Más de 30 plantillas", d: "La versión ATS y dos diseños por cada una de las 11 áreas, más uno de la biblioteca." },
  { t: "Experiencia mejorada", d: "3 preguntas y la app te muestra solo los campos y ejemplos que te sirven." },
  { t: "Armado y orden automático", d: "Las secciones se acomodan solas y sabés cuántas hojas ocupa tu CV." },
  { t: "Análisis de tu CV", d: "Lo que ya está bien, ideas para sumar y palabras clave de tu área." },
  { t: "Recomendaciones", d: "Consejos concretos con ejemplos: listas, tarjetas, logros y más." },
  { t: "Chat de ayuda", d: "Hablá con el equipo y guardá el historial de recomendaciones y novedades." },
  { t: "Encuestas y comunidad", d: "Votá diseños y opiná sobre lo que viene." },
  { t: "Perfiles y Mis CVs", d: "Varios perfiles y el historial de todo lo que descargaste." },
  { t: "Modo accesible", d: "Pensado para TalkBack, completo y sin costo." },
  { t: "Modo oscuro y 3 idiomas", d: "Español, inglés y portugués, de día o de noche." },
  { t: "Sin registro", d: "Sin cuentas ni contraseñas: tus datos quedan en tu celular." },
];

const PREGUNTAS = [
  {
    p: "¿Qué puedo hacer gratis?",
    r: "Casi todo. Usar la app, armar tus perfiles, descargar tus CV en PDF, más de 30 plantillas (la versión ATS y dos diseños por área), el análisis y las recomendaciones de tu CV, el orden automático de las secciones, el chat de ayuda y todo el modo accesible. Premium suma diseños nuevos y la IA, para quien los quiera.",
  },
  {
    p: "¿Tiene publicidad?",
    r: "No, y no la va a tener. CV Belgrano se sostiene solo con las suscripciones de quienes eligen un plan.",
  },
  {
    p: "¿Tengo que crear una cuenta?",
    r: "No. Abrís la app y empezás. No pedimos correo ni contraseña. Si te suscribís, el plan queda asociado a tu cuenta de Google Play, así lo recuperás con \"Restaurar compras\" en otro teléfono.",
  },
  {
    p: "¿Cómo cancelo la suscripción?",
    r: "Desde Ajustes → CV Belgrano Premium → \"Cancelar suscripción\", o desde Google Play. El botón está siempre a la vista. Los PDF que ya descargaste son tuyos y se quedan en tu celular.",
  },
  {
    p: "¿Qué hace \"Analizar y potenciar con IA\"?",
    r: "Revisa tu CV y te propone una versión mejor redactada: logros con números, verbos de acción y palabras clave de tu área. Vos ves los cambios, los aplicás si te gustan y podés volver a la versión anterior.",
  },
  {
    p: "¿Qué datos se envían a la IA?",
    r: "Solo el texto de tu CV: nunca tu foto ni tus datos de contacto. Te pedimos permiso la primera vez y la app avisa que hace falta internet. El analizador gratis, en cambio, funciona sin conexión y no envía nada.",
  },
  {
    p: "¿Dónde quedan mis datos?",
    r: "En tu celular. Tus perfiles y tus CV se guardan en el teléfono, no en una cuenta en internet. Premium sigue funcionando hasta 30 días sin conexión.",
  },
  {
    p: "¿Los CV pasan los filtros automáticos de las empresas?",
    r: "Cada área tiene una versión ATS, gratis: un diseño simple y limpio, pensado para que los sistemas de selección lean bien tu información.",
  },
  {
    p: "¿Sirve si es mi primer CV?",
    r: "Sí. Elegís \"es mi primer CV\" y la app te muestra solo los campos que te sirven, con ejemplos. El analizador te sugiere listas y tarjetas para destacar cursos, proyectos o voluntariados.",
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page">

      {/* ============ BARRA SUPERIOR ============ */}

      <header className="landing-barra">
        <a href="#inicio" className="landing-barra-marca">
          <img src={logoCV} alt="" width="36" height="36" />
          <span>CV Belgrano</span>
        </a>
        <nav className="landing-barra-enlaces" aria-label="Secciones">
          <a href="#funciones">Funciones</a>
          <a href="#gratis">Gratis</a>
          <a href="#ia">IA</a>
          <a href="#planes">Planes</a>
          <a href="#preguntas">Preguntas</a>
        </nav>
        <a href="#descargar" className="landing-barra-boton">Descargar</a>
      </header>

      {/* ============ HERO ============ */}

      <section className="landing-hero" id="inicio">
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
              <span> y potencialo con IA.</span>
            </h2>

            <p>
              Respondés 3 preguntas, completás tus datos con ejemplos de tu
              área y elegís entre 77 diseños. La app revisa tu CV, te dice
              qué mejorar y, con un toque, lo potencia con IA. Lo que ves es
              exactamente lo que sale en el PDF.
            </p>

            <div className="landing-hero-cta">
              <BotonPlay />
            </div>

            <ul className="landing-chips" aria-label="Ventajas principales">
              <li>Descargá tu CV gratis</li>
              <li>Sin registro</li>
              <li>Sin publicidad</li>
              <li>Tus datos en tu celular</li>
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
            <li><strong>77</strong><span>diseños de CV</span></li>
            <li><strong>11</strong><span>áreas de trabajo</span></li>
            <li><strong>3</strong><span>idiomas: es · en · pt</span></li>
                        <li><strong>+30</strong><span>plantillas gratis</span></li>
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
              ordenarlo, qué diseño usar y si está bien escrito. CV Belgrano
              resuelve todo eso desde el celular.
            </p>
          </div>

          <div className="landing-siempre-columnas landing-columnas-cuatro">
            <div>
              <h3>"No sé qué escribir"</h3>
              <p>Te damos ejemplos pensados para tu área en cada sección.</p>
            </div>
            <div>
              <h3>"No sé si está bien"</h3>
              <p>El analizador te dice qué ya está bien y qué podés sumar.</p>
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

      <section className="landing-experiencia" id="funciones" aria-labelledby="landing-pasos-titulo">
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
                <p>Probalos con tus datos y mirá cuántas hojas ocupa.</p>
              </div>
            </li>
            <li>
              <span className="landing-galeria-numero">4</span>
              <div>
                <h3>Descargá y potenciá</h3>
                <p>Tu PDF listo para enviar, analizado y mejorado con IA.</p>
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
                <span>Atención al cliente, tecnología, salud, gastronomía, oficios y más.</span>
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
            <li><Check />Listas y tarjetas propias para destacarte</li>
            <li><Check />Administrá tu experiencia mejorada cuando quieras</li>
          </ul>
        </div>
      </section>

      {/* ============ LO QUE VES ES LO QUE SALE (PAGINACIÓN EXACTA) ============ */}

      <section className="landing-oscuro" aria-labelledby="landing-hojas-titulo">
        <div className="landing-oscuro-texto">
          <span className="landing-etiqueta">SIN SORPRESAS EN EL PDF</span>
          <h2 id="landing-hojas-titulo">Lo que ves es exactamente lo que sale.</h2>
          <p>
            La vista previa marca con una línea dónde termina cada hoja,
            y el PDF sale igual: si dice "1 hoja", tu CV entra en una
            hoja. Si se pasa, la app te sugiere achicar la letra o
            reordenar secciones.
          </p>
          <ul className="landing-lista">
            <li><Check />Línea de corte de hoja en la vista previa</li>
            <li><Check />Misma medida en la vista previa, el modo accesible y el PDF</li>
            <li><Check />"Explorar CV" con el PDF real de cada descarga</li>
          </ul>
        </div>

        <div className="landing-oscuro-telefonos">
          <figure className="landing-oscuro-item landing-oscuro-item-uno">
            <Captura
              archivo="pantalla_vista_hojas.png"
              titulo="Vista previa · línea de hoja"
              detalle="La línea roja marca el final de cada hoja"
            />
            <figcaption>Sabés cuántas hojas ocupa</figcaption>
          </figure>
          <figure className="landing-oscuro-item landing-oscuro-item-dos">
            <Captura
              archivo="pantalla_explorar_pdf.png"
              titulo="Explorar CV · PDF real"
              detalle="La estructura arriba y el PDF descargado abajo"
            />
            <figcaption>Mirá el PDF tal como lo enviaste</figcaption>
          </figure>
        </div>
      </section>

      {/* ============ PLANTILLAS ============ */}

      <section className="landing-formularios" aria-labelledby="landing-plantillas-titulo">
        <div className="landing-formularios-telefonos">
          <figure className="landing-formularios-item">
            <Captura
              archivo="pantalla_editor_plantilla.png"
              titulo="Editor de plantilla"
              detalle="Orden de secciones y tamaño de letra"
            />
            <figcaption>Personalizá cada detalle</figcaption>
          </figure>
          <figure className="landing-formularios-item landing-formularios-item-dos">
            <Captura
              archivo="pantalla_premium_corona.png"
              titulo="Plantillas · gratis y premium"
              detalle="Los diseños premium llevan una corona"
            />
            <figcaption>Gratis primero, premium con corona</figcaption>
          </figure>
        </div>

        <div className="landing-formularios-texto">
          <span className="landing-etiqueta">DISEÑOS QUE SE NOTAN</span>
          <h2 id="landing-plantillas-titulo">
            77 plantillas pensadas para cada área de trabajo.
          </h2>
          <p>
            Cada una de las 11 áreas tiene su versión ATS y cinco diseños
            propios, y la biblioteca suma 11 diseños más. Con el plan
            gratis usás la versión ATS y dos diseños por área; con Premium
            se abren todos los que llevan corona.
          </p>
          <ul className="landing-lista">
            <li><Check />Cambiás de diseño sin volver a escribir nada</li>
            <li><Check />Ordenás y ocultás secciones a tu gusto</li>
            <li><Check />Ajustás el tamaño de letra para que entre todo</li>
            <li><Check />Versión ATS gratis en todas las áreas</li>
          </ul>
        </div>
      </section>

      {/* ============ ANALIZADOR + IA ============ */}

      <section className="landing-oscuro landing-ia" id="ia" aria-labelledby="landing-ia-titulo">
        <div className="landing-oscuro-texto">
          <span className="landing-etiqueta landing-etiqueta-dorada">
            <span className="landing-etiqueta-icono"><IconoDestellos /></span>
            ANALIZAR Y POTENCIAR
          </span>
          <h2 id="landing-ia-titulo">Tu CV revisado y mejorado, en un toque.</h2>
          <p>
            Cada CV que descargás se puede analizar. La app te dice, con
            palabras simples, qué ya está bien y qué podés sumar. Y con
            "Analizar y potenciar con IA", te propone una versión más
            fuerte, lista para aplicar.
          </p>

          <div className="landing-ia-tarjetas">
            <div className="landing-ia-tarjeta">
              <span className="landing-ia-tag">GRATIS · SIN INTERNET</span>
              <h3>Analizador del CV</h3>
              <ul className="landing-lista landing-lista-chica">
                <li><Check />Logros sin números y frases débiles</li>
                <li><Check />Verbos de acción y fechas que no cierran</li>
                <li><Check />Palabras clave de tu área</li>
                <li><Check />Cuántas hojas ocupa tu CV</li>
              </ul>
            </div>
            <div className="landing-ia-tarjeta landing-ia-tarjeta-dorada">
              <span className="landing-ia-tag">PREMIUM · CON IA</span>
              <h3>Potenciar con IA</h3>
              <ul className="landing-lista landing-lista-chica">
                <li><Check />Reescribe tu experiencia con logros claros</li>
                <li><Check />Suma las palabras clave que buscan las empresas</li>
                <li><Check />Aplicás los cambios que te gusten</li>
                <li><Check />"Volver al anterior" cuando quieras</li>
              </ul>
            </div>
          </div>

          <p className="landing-oscuro-nota">
            A la IA solo va el texto del CV: nunca tu foto ni tus datos de
            contacto. Te pedimos permiso antes del primer uso.
          </p>
        </div>

        <div className="landing-oscuro-telefonos">
          <figure className="landing-oscuro-item landing-oscuro-item-uno">
            <Captura
              archivo="pantalla_analizador.png"
              titulo="Analizador del CV"
              detalle="Lo que ya está bien e ideas para sumar"
            />
            <figcaption>Ideas claras, sin puntajes</figcaption>
          </figure>
          <figure className="landing-oscuro-item landing-oscuro-item-dos">
            <Captura
              archivo="pantalla_potenciar_ia.png"
              titulo="Analizar y potenciar con IA"
              detalle="Antes y después, listo para aplicar"
            />
            <figcaption>Tu CV potenciado con IA</figcaption>
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
              detalle="Tus PDF con el botón Analizar CV"
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
            cliente y otro para administración) y todos los CV que
            descargues. Cuando aparece una oportunidad, tu CV ya está ahí,
            en PDF o en Word.
          </p>
          <ul className="landing-lista">
            <li><Check />Varios perfiles en la misma app</li>
            <li><Check />Historial de descargas en "Mis CVs"</li>
            <li><Check />PDF gratis y Word (.docx) con Premium</li>
            <li><Check />Respaldo de tus datos para cambiar de teléfono</li>
          </ul>
        </div>
      </section>

      {/* ============ TODO LO QUE ES GRATIS ============ */}

      <section className="landing-siempre" id="gratis" aria-labelledby="landing-gratis-titulo">
        <div className="landing-siempre-interior">
          <div className="landing-siempre-cabecera">
            <span className="landing-etiqueta">USO GRATIS</span>
            <h2 id="landing-gratis-titulo">Todo esto lo usás sin pagar.</h2>
            <p>
              La app y tus CV son gratis. Lo premium es un extra: diseños
              nuevos y la IA, con pagos chicos, para quien los quiera.
            </p>
          </div>

          <ul className="landing-gratis">
            {GRATIS.map(({ t, d }) => (
              <li key={t}>
                <Check />
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ PLANES ============ */}

      <section className="landing-experiencia landing-planes-seccion" id="planes" aria-labelledby="landing-planes-titulo">
        <div className="landing-experiencia-interior">
          <div className="landing-experiencia-cabecera">
            <span className="landing-etiqueta">PLANES</span>
            <h2 id="landing-planes-titulo">Lo esencial es gratis. Premium suma diseños e IA.</h2>
            <p>
              Sin publicidad y sin letra chica: suscripción mensual por
              Google Play, con "Cancelar suscripción" siempre a la vista.
            </p>
          </div>

          <div className="landing-planes">
            {PLANES.map((plan) => (
              <article
                key={plan.id}
                className={`landing-plan${plan.destacado ? " landing-plan-destacado" : ""}${plan.futuro ? " landing-plan-futuro" : ""}`}
                aria-labelledby={`plan-${plan.id}`}
              >
                {plan.destacado && <span className="landing-plan-cinta">Recomendado</span>}
                <h3 id={`plan-${plan.id}`}>
                  {plan.id !== "gratis" && (
                    <span className="landing-plan-corona"><IconoCorona /></span>
                  )}
                  {plan.nombre}
                </h3>
                <p className="landing-plan-precio">
                  <strong>{plan.precio}</strong>
                  {plan.periodo && <span>{plan.periodo}</span>}
                </p>
                <p className="landing-plan-resumen">{plan.resumen}</p>
                <ul className="landing-lista landing-lista-chica">
                  {plan.incluye.map((item) => (
                    <li key={item}><Check />{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <ul className="landing-garantias" aria-label="Condiciones de los planes">
            <li>Cancelás cuando quieras</li>
            <li>Los PDF descargados son tuyos</li>
            <li>Restaurar compras en otro teléfono</li>
            <li>Cupones de descuento</li>
          </ul>
          <p className="landing-planes-nota">
            Precios en pesos argentinos, con renovación mensual. El precio
            final es el que muestra Google Play al suscribirte. Para
            suscribirte tenés que ser mayor de 18 años o tener permiso de
            tu madre, padre o tutor.
          </p>
        </div>
      </section>

      {/* ============ PRIVACIDAD Y SIMPLICIDAD ============ */}

      <section className="landing-siempre" aria-labelledby="landing-privacidad-titulo">
        <div className="landing-siempre-interior">
          <div className="landing-siempre-cabecera">
            <span className="landing-etiqueta">SIMPLE Y PRIVADA</span>
            <h2 id="landing-privacidad-titulo">Tu información es tuya.</h2>
            <p>
              Sin cuentas, sin contraseñas y sin publicidad. Tus datos
              personales se guardan en tu celular.
            </p>
          </div>

          <div className="landing-siempre-columnas landing-columnas-cuatro">
            <div>
              <h3>Sin registro</h3>
              <p>Abrís la app y empezás. No te pedimos correo ni contraseña.</p>
            </div>
            <div>
              <h3>En tu celular</h3>
              <p>Tus perfiles y tus CV quedan guardados en el teléfono.</p>
            </div>
            <div>
              <h3>Sin publicidad</h3>
              <p>Nada de anuncios entre vos y tu próximo trabajo.</p>
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
            novedades y votás en encuestas cortas. Tu conversación vuelve
            aunque reinstales la app. Y con el modo oscuro, todo se ve
            cómodo a cualquier hora.
          </p>
          <ul className="landing-lista">
            <li><Check />Chat de ayuda en tu idioma</li>
            <li><Check />Tu chat se recupera al reinstalar</li>
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

      <section className="landing-accesibilidad" aria-labelledby="landing-accesibilidad-titulo">
        <div className="landing-accesibilidad-icono" aria-hidden="true">
          <IconoAccesibilidad />
        </div>

        <div className="landing-accesibilidad-texto">
          <span className="landing-etiqueta">DISEÑADA PARA TODOS</span>
          <h2 id="landing-accesibilidad-titulo">
            La accesibilidad no es una función adicional. Es parte de la
            experiencia.
          </h2>
          <p>
            CV Belgrano tiene un modo accesible pensado para quienes usan
            lectores de pantalla como TalkBack: podés crear, organizar,
            analizar y descargar tus currículums sin depender de
            elementos visuales.
          </p>
          <p>
            Porque todas las personas merecen las mismas oportunidades
            para construir su futuro laboral.
          </p>
          <ul className="landing-lista">
            <li><Check />Se activa solo con TalkBack o desde Ajustes</li>
            <li><Check />Plantillas en 3 pasos, con el diseño descrito en palabras</li>
            <li><Check />"Explorar CV": escuchá tu currículum antes de enviarlo</li>
            <li><Check />El analizador y los planes se leen por bloques cortos</li>
            <li><Check />La accesibilidad no se cobra: es igual en todos los planes</li>
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

      {/* ============ DESCARGA ============ */}

      <section className="landing-siempre" id="descargar" aria-labelledby="landing-instalar-titulo">
        <div className="landing-siempre-interior">
          <div className="landing-siempre-cabecera">
            <span className="landing-etiqueta">INSTALALA EN 1 MINUTO</span>
            <h2 id="landing-instalar-titulo">Descargá CV Belgrano en tu Android.</h2>
            <p>
              Desde Google Play, en un toque. Si preferís, también podés
              instalar el archivo APK directo desde esta página.
            </p>
          </div>

          <div className="landing-descargas">
            <BotonPlay />
            <BotonApk />
          </div>

          <h3 className="landing-subtitulo">¿Elegiste el APK? Así se instala:</h3>

          <ol className="landing-instalar">
            <li>
              <span className="landing-galeria-numero">1</span>
              <div>
                <h3>Descargá el archivo</h3>
                <p>Tocá "Descargar el APK" desde tu celular.</p>
              </div>
            </li>
            <li>
              <span className="landing-galeria-numero">2</span>
              <div>
                <h3>Abrilo e instalá</h3>
                <p>
                  Si Android te lo pide, permití instalar apps de esta
                  fuente. Es un paso normal fuera de Google Play.
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
        </div>
      </section>

      {/* ============ PREGUNTAS FRECUENTES ============ */}

      <section className="landing-experiencia" id="preguntas" aria-labelledby="landing-faq-titulo">
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
        <p>Tené tu CV listo y potenciado. Descargá CV Belgrano gratis y armalo en minutos.</p>
        <BotonPlay claro texto="Descargar CV Belgrano" />
        <span className="landing-gratuita">
          CV Belgrano · Uso gratis · Sin registro · Sin publicidad · Android
        </span>
      </section>

    </main>
  );
}
