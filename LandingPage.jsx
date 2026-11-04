import "./LandingPage.css";
import logoCV from "./src/assets/cvbelgrano.png";

// Capturas de la aplicación (van en src/assets).
import pantallaApp from "./src/assets/pantalla_app.png";
import pantallaPlantillas from "./src/assets/pantalla_plantillas.png";
import pantallaPlantillasOscuro from "./src/assets/pantalla_plantillas_oscuro.png";
import pantallaChat from "./src/assets/pantalla_chat.png";

// PEGAR AQUÍ EL ENLACE REAL DE DESCARGA DEL APK.
const URL_DESCARGA_APK = "";

// Símbolo universal de accesibilidad.
// Figura humana con brazos extendidos.
function IconoAccesibilidad() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="58"
      height="58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Accesibilidad universal"
    >
      <circle
        cx="32"
        cy="32"
        r="29"
        stroke="currentColor"
        strokeWidth="3"
      />

      <circle
        cx="32"
        cy="14"
        r="4"
        fill="currentColor"
      />

      <path
        d="M12 25L32 30L52 25"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M32 30V43"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M32 43L20 54"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M32 43L44 54"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M32 30L25 43"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M32 30L39 43"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-page">

      {/* PRESENTACIÓN PRINCIPAL */}

      <section className="landing-hero">

        <div className="landing-contenido">

          <div className="landing-identidad">
            <img
              src={logoCV}
              alt="Logo de CV Belgrano"
              className="landing-logo"
            />

            <div>
              <h1>CV Belgrano</h1>
              <p>Currículum Vitae Belgrano</p>
            </div>
          </div>

          <div className="landing-texto">

            <span className="landing-etiqueta">
              UNA NUEVA FORMA DE CREAR TU CV
            </span>

            <h2>
              Tu experiencia merece
              <span> una mejor presentación.</span>
            </h2>

            <p>
              Creá tu currículum de manera sencilla, rápida y
              profesional. Una aplicación diseñada para acompañarte
              en cada etapa de tu vida laboral.
            </p>

          </div>

          <div className="landing-beneficios">

            <div>
              <span className="landing-check">✓</span>
              Creación de CV en pocos pasos
            </div>

            <div>
              <span className="landing-check">✓</span>
              Más de 60 plantillas y diseños
            </div>

            <div>
              <span className="landing-check">✓</span>
              Experiencia mejorada y personalizada
            </div>

            <div>
              <span className="landing-check">✓</span>
              Modo oscuro para cuidar tu vista
            </div>

            <div>
              <span className="landing-check">✓</span>
              Accesibilidad con lectores de pantalla
            </div>

          </div>

          <div className="landing-acciones">

            {URL_DESCARGA_APK ? (
              <a
                href={URL_DESCARGA_APK}
                className="landing-boton"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="landing-download-icon">↓</span>

                <span>
                  Descargar aplicación
                  <small>Versión APK · 100% gratuita</small>
                </span>
              </a>
            ) : (
              <div className="landing-boton landing-boton-pendiente">
                <span className="landing-download-icon">↓</span>

                <span>
                  Descargar aplicación
                  <small>Versión APK · 100% gratuita</small>
                </span>
              </div>
            )}

            <span className="landing-nota">
              Versión inicial disponible para Android.
            </span>

          </div>

        </div>

        {/* IMÁGENES DE LA APLICACIÓN */}

        <div className="landing-telefonos">

          <div className="landing-telefono landing-telefono-uno">
            <img
              src={pantallaApp}
              alt="Panel principal de CV Belgrano con los tres pasos para crear un CV"
            />
          </div>

          <div className="landing-telefono landing-telefono-dos">
            <img
              src={pantallaPlantillas}
              alt="Vista de selección y personalización de plantillas de CV"
            />
          </div>

          <div className="landing-decoracion" />

        </div>

      </section>

      {/* ACCESIBILIDAD */}

      <section className="landing-accesibilidad">

        <div
          className="landing-accesibilidad-icono"
          aria-hidden="true"
        >
          <IconoAccesibilidad />
        </div>

        <div className="landing-accesibilidad-texto">

          <span className="landing-etiqueta">
            DISEÑADA PARA TODOS
          </span>

          <h2>
            La accesibilidad no es una función adicional.
            Es parte de la experiencia.
          </h2>

          <p>
            CV Belgrano incorpora una experiencia accesible pensada
            también para personas que utilizan lectores de pantalla.
            Las funciones se adaptan para que puedas crear, organizar
            y gestionar tus currículums sin depender de elementos
            exclusivamente visuales.
          </p>

          <p>
            Porque todas las personas merecen las mismas oportunidades
            para construir su futuro laboral.
          </p>

        </div>

      </section>

      {/* EXPERIENCIA MEJORADA */}

      <section className="landing-experiencia">

        <div className="landing-experiencia-texto">

          <span className="landing-etiqueta">
            MENOS PASOS, MÁS RESULTADOS
          </span>

          <h2>
            Tu CV comienza con lo que realmente importa.
          </h2>

          <p>
            Con nuestra experiencia mejorada, respondés algunas
            preguntas sobre tu situación laboral, el área en la que
            querés trabajar y tus conocimientos.
          </p>

          <p>
            La aplicación adapta los formularios a tus necesidades,
            evitando campos innecesarios y haciendo que completar
            tu currículum sea mucho más simple.
          </p>

        </div>

        <div className="landing-experiencia-pasos">

          <div className="landing-paso">
            <span>01</span>

            <div>
              <h3>Contanos sobre vos</h3>
              <p>
                Seleccioná tu situación y tus objetivos laborales.
              </p>
            </div>
          </div>

          <div className="landing-paso">
            <span>02</span>

            <div>
              <h3>Personalizá tu CV</h3>
              <p>
                Completá los datos y elegí entre diferentes diseños.
              </p>
            </div>
          </div>

          <div className="landing-paso">
            <span>03</span>

            <div>
              <h3>Descargalo en PDF</h3>
              <p>
                Obtené un currículum listo para compartir.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* MODO OSCURO Y CHAT */}

      <section
        className="landing-oscuro"
        aria-labelledby="landing-oscuro-titulo"
      >

        <div className="landing-oscuro-texto">

          <span className="landing-etiqueta">
            MODO OSCURO Y CHAT
          </span>

          <h2 id="landing-oscuro-titulo">
            Creá tu CV a cualquier hora, sin cansar la vista.
          </h2>

          <p>
            Activá el modo oscuro y trabajá cómodo de día o de noche.
            Los formularios, las plantillas, el chat y los menús se
            adaptan para que todo se vea claro y equilibrado.
          </p>

          <ul className="landing-oscuro-lista">

            <li>
              <span className="landing-oscuro-check" aria-hidden="true">✓</span>
              Modo oscuro en toda la aplicación
            </li>

            <li>
              <span className="landing-oscuro-check" aria-hidden="true">✓</span>
              Chat de ayuda dentro de la app
            </li>

            <li>
              <span className="landing-oscuro-check" aria-hidden="true">✓</span>
              Encuestas rápidas para dar tu opinión
            </li>

          </ul>

          <p className="landing-oscuro-nota">
            Desde el chat podés escribirnos, recibir novedades del
            equipo y votar en encuestas cortas. Tu opinión nos ayuda
            a seguir mejorando.
          </p>

        </div>

        <div className="landing-oscuro-telefonos">

          <figure className="landing-oscuro-item landing-oscuro-item-uno">
            <div className="landing-pantalla">
              <img
                src={pantallaPlantillasOscuro}
                alt="Selección de plantillas de CV Belgrano en modo oscuro"
                width="724"
                height="1610"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption>Elegí tu diseño en modo oscuro</figcaption>
          </figure>

          <figure className="landing-oscuro-item landing-oscuro-item-dos">
            <div className="landing-pantalla">
              <img
                src={pantallaChat}
                alt="Chat de CV Belgrano con un mensaje del equipo y encuestas con resultados"
                width="724"
                height="1610"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption>Chat con novedades y encuestas</figcaption>
          </figure>

        </div>

      </section>

      {/* CIERRE */}

      <section className="landing-cierre">

        <h2>Tu CV, tu futuro.</h2>

        <p>
          Una herramienta para crear, mejorar y presentar
          tu experiencia profesional.
        </p>

        {URL_DESCARGA_APK && (
          <a
            href={URL_DESCARGA_APK}
            className="landing-boton landing-boton-claro"
            target="_blank"
            rel="noopener noreferrer"
          >
            Descargar CV Belgrano ↓
          </a>
        )}

        <span className="landing-gratuita">
          CV Belgrano · Aplicación gratuita
        </span>

      </section>

    </main>
  );
}