import "./LandingPage.css";
import logoCV from "./src/assets/cvbelgrano.png";

// Capturas de la aplicación (van en src/assets).
import pantallaApp from "./src/assets/pantalla_app.png";
import pantallaPlantillas from "./src/assets/pantalla_plantillas.png";
import pantallaPlantillasOscuro from "./src/assets/pantalla_plantillas_oscuro.png";
import pantallaChat from "./src/assets/pantalla_chat.png";

// PEGAR AQUÍ EL ENLACE REAL DE DESCARGA DEL APK.
const URL_DESCARGA_APK = "";

/* ------------------------------------------------------------------
   IMÁGENES DE LA EXPERIENCIA MEJORADA (en src/assets)

   Se cargan con import.meta.glob para que la página NO se rompa si
   alguna todavía no existe: en lugar de la imagen se muestra un
   recuadro que dice qué archivo falta.

   Archivos esperados:
   - pantalla_pregunta_momento.png   → pregunta 1 (momento laboral)
   - pantalla_pregunta_area.png      → pregunta 2 (área laboral)
   - pantalla_pregunta_extras.png    → pregunta 3 (¿Tenés alguno de estos?)
   - pantalla_panel_experiencia.png  → panel principal con "Administrar
                                       experiencia mejorada"
   - pantalla_datos_personales.png   → formulario "Datos personales"

   Medida ideal: 724 x 1610, solo la pantalla (sin marco del celular).
------------------------------------------------------------------ */
const imagenesNuevas = import.meta.glob(
  "./src/assets/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
);

function urlImagen(nombre) {
  return imagenesNuevas[`./src/assets/${nombre}`] || "";
}

// Pantalla de celular con marco. Si falta la imagen, muestra un aviso.
function Pantalla({ archivo, alt }) {
  const src = urlImagen(archivo);

  return (
    <div className="landing-pantalla">
      {src ? (
        <img
          src={src}
          alt={alt}
          width="724"
          height="1610"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="landing-pantalla-vacia" role="img" aria-label={alt}>
          <span>Falta la imagen</span>
          <strong>{archivo}</strong>
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
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <path d="M12 4v12" />
        <path d="M6.5 11.5L12 17l5.5-5.5" />
        <path d="M6 21h12" />
      </svg>
    </span>
  );
}

// Ícono de accesibilidad igual al de los celulares Android
// (Material Design "accessibility"): cabeza, brazos abiertos y piernas.
function IconoAccesibilidad() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
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
              TU CV, SIEMPRE PREPARADO
            </span>

            <h2>
              Tené tu CV siempre preparado
              <span> para cuando llegue la oportunidad.</span>
            </h2>

            <p>
              Creá tu currículum en pocos pasos, mantenelo actualizado
              y mejoralo con el tiempo. CV Belgrano te acompaña para
              que tu experiencia siempre esté lista para presentarse.
            </p>

          </div>

        </div>

        {/* IMÁGENES DE LA APLICACIÓN */}

        <div className="landing-telefonos">

          <div className="landing-decoracion" aria-hidden="true" />

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

        </div>

      </section>

      {/* BENEFICIOS Y DESCARGA */}

      <section
        className="landing-franja"
        aria-label="Beneficios y descarga de la aplicación"
      >

        <div className="landing-franja-interior">

          <ul className="landing-beneficios">

            <li>
              <span className="landing-check" aria-hidden="true">✓</span>
              Tu CV listo en pocos pasos
            </li>

            <li>
              <span className="landing-check" aria-hidden="true">✓</span>
              Más de 60 plantillas y diseños
            </li>

            <li>
              <span className="landing-check" aria-hidden="true">✓</span>
              Experiencia mejorada que te guía con ejemplos
            </li>

            <li>
              <span className="landing-check" aria-hidden="true">✓</span>
              Modo oscuro y accesibilidad con lectores de pantalla
            </li>

          </ul>

          <div className="landing-acciones">

            {URL_DESCARGA_APK ? (
              <a
                href={URL_DESCARGA_APK}
                className="landing-boton"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconoDescarga />

                <span>
                  Descargar aplicación
                  <small>Versión APK · 100% gratuita</small>
                </span>
              </a>
            ) : (
              <div className="landing-boton landing-boton-pendiente">
                <IconoDescarga />

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

      </section>

      {/* SIEMPRE PREPARADO */}

      <section
        className="landing-siempre"
        aria-labelledby="landing-siempre-titulo"
      >

        <div className="landing-siempre-interior">

          <div className="landing-siempre-cabecera">

            <span className="landing-etiqueta">
              LA IDEA DE CV BELGRANO
            </span>

            <h2 id="landing-siempre-titulo">
              Que tu CV nunca te agarre desprevenido.
            </h2>

            <p>
              CV Belgrano es una comunidad de personas que mantienen su
              currículum disponible y actualizado, y lo van mejorando
              paso a paso.
            </p>

          </div>

          <div className="landing-siempre-columnas">

            <div>
              <h3>Siempre disponible</h3>
              <p>
                Guardá tus perfiles y tus CV en PDF dentro de la app,
                listos para compartir cuando los necesites.
              </p>
            </div>

            <div>
              <h3>Siempre actualizado</h3>
              <p>
                Sumá un trabajo, un curso o un idioma cuando quieras y
                descargá tu CV al día.
              </p>
            </div>

            <div>
              <h3>Siempre mejorando</h3>
              <p>
                Con ejemplos paso a paso aprendés a mejorar cada parte
                de tu currículum.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* EXPERIENCIA MEJORADA: LAS 3 PREGUNTAS */}

      <section
        className="landing-experiencia"
        aria-labelledby="landing-experiencia-titulo"
      >

        <div className="landing-experiencia-interior">

          <div className="landing-experiencia-cabecera">

            <span className="landing-etiqueta">
              EXPERIENCIA MEJORADA
            </span>

            <h2 id="landing-experiencia-titulo">
              Respondé 3 preguntas y la app se adapta a vos.
            </h2>

            <p>
              Elegís tu momento laboral, el área en la que querés
              trabajar y qué más querés sumar a tu CV. Son tres
              preguntas de selección que se responden en menos de
              un minuto.
            </p>

          </div>

          <div className="landing-galeria">

            <figure className="landing-galeria-item">
              <Pantalla
                archivo="pantalla_pregunta_momento.png"
                alt="Primera pregunta de la experiencia mejorada: ¿En qué momento laboral te encontrás? Con las opciones tengo experiencia laboral, trabajo de forma independiente y soy estudiante o es mi primer CV"
              />
              <figcaption>
                <span className="landing-galeria-numero">1</span>
                <strong>Tu momento laboral</strong>
                <span>
                  Tengo experiencia, trabajo de forma independiente
                  o es mi primer CV.
                </span>
              </figcaption>
            </figure>

            <figure className="landing-galeria-item">
              <Pantalla
                archivo="pantalla_pregunta_area.png"
                alt="Segunda pregunta: ¿En qué área querés trabajar? Con familias como atención al cliente, tecnología, salud y deportes"
              />
              <figcaption>
                <span className="landing-galeria-numero">2</span>
                <strong>Tu área de trabajo</strong>
                <span>
                  Atención al cliente, tecnología, salud, deportes,
                  oficios y más.
                </span>
              </figcaption>
            </figure>

            <figure className="landing-galeria-item">
              <Pantalla
                archivo="pantalla_pregunta_extras.png"
                alt="Tercera pregunta: ¿Tenés alguno de estos? Con opciones como certificaciones, idiomas, licencia de conducir y GitHub"
              />
              <figcaption>
                <span className="landing-galeria-numero">3</span>
                <strong>Lo que querés sumar</strong>
                <span>
                  Certificaciones, idiomas, licencia de conducir,
                  GitHub y más, según tu área.
                </span>
              </figcaption>
            </figure>

          </div>

          <div className="landing-desbloqueo">

            <div>
              <h3>Ejemplos para tu área</h3>
              <p>
                Al responder, desbloqueás ejemplos pensados para lo
                que vas a completar.
              </p>
            </div>

            <div>
              <h3>Formularios a tu medida</h3>
              <p>
                Ves solo los campos que te sirven, sin completar
                datos de más.
              </p>
            </div>

            <div>
              <h3>Menos de un minuto</h3>
              <p>
                Tres preguntas rápidas y tu experiencia queda
                personalizada.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* FORMULARIOS Y PANEL */}

      <section
        className="landing-formularios"
        aria-labelledby="landing-formularios-titulo"
      >

        <div className="landing-formularios-telefonos">

          <figure className="landing-formularios-item">
            <Pantalla
              archivo="pantalla_panel_experiencia.png"
              alt="Panel principal con el botón Administrar experiencia mejorada, actualmente activada"
            />
            <figcaption>Activá y administrá tu experiencia</figcaption>
          </figure>

          <figure className="landing-formularios-item landing-formularios-item-dos">
            <Pantalla
              archivo="pantalla_datos_personales.png"
              alt="Formulario de datos personales con secciones desplegables de contacto, perfil profesional, educación, habilidades, redes e idiomas"
            />
            <figcaption>Datos personales, ordenados por secciones</figcaption>
          </figure>

        </div>

        <div className="landing-formularios-texto">

          <span className="landing-etiqueta">
            COMPLETÁ SOLO LO QUE IMPORTA
          </span>

          <h2 id="landing-formularios-titulo">
            Un formulario ordenado, que se ajusta a tus respuestas.
          </h2>

          <p>
            Tus datos se organizan en secciones que se abren y se
            cierran: contacto, perfil profesional, educación,
            habilidades, redes e idiomas. Completás una por una, a tu
            ritmo, con una foto de perfil opcional.
          </p>

          <ul className="landing-lista">

            <li>
              <span className="landing-lista-check" aria-hidden="true">✓</span>
              Secciones desplegables para no perderte
            </li>

            <li>
              <span className="landing-lista-check" aria-hidden="true">✓</span>
              Ejemplos que te guían mientras escribís
            </li>

            <li>
              <span className="landing-lista-check" aria-hidden="true">✓</span>
              Administrá tu experiencia mejorada cuando quieras
            </li>

          </ul>

        </div>

      </section>

      {/* COMUNIDAD, CHAT Y MODO OSCURO */}

      <section
        className="landing-oscuro"
        aria-labelledby="landing-oscuro-titulo"
      >

        <div className="landing-oscuro-texto">

          <span className="landing-etiqueta">
            COMUNIDAD Y MODO OSCURO
          </span>

          <h2 id="landing-oscuro-titulo">
            Sumate a la comunidad, de día o de noche.
          </h2>

          <p>
            Desde el chat recibís novedades del equipo, votás en
            encuestas cortas y opinás sobre la app. Con el modo
            oscuro, todo se ve cómodo a cualquier hora.
          </p>

          <ul className="landing-lista">

            <li>
              <span className="landing-lista-check" aria-hidden="true">✓</span>
              Chat de ayuda dentro de la app
            </li>

            <li>
              <span className="landing-lista-check" aria-hidden="true">✓</span>
              Encuestas rápidas para dar tu opinión
            </li>

            <li>
              <span className="landing-lista-check" aria-hidden="true">✓</span>
              Modo oscuro en toda la aplicación
            </li>

          </ul>

          <p className="landing-oscuro-nota">
            Tu opinión nos ayuda a seguir mejorando: la app crece junto
            con la comunidad.
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

      {/* CIERRE */}

      <section className="landing-cierre">

        <h2>Tu CV, siempre listo.</h2>

        <p>
          Sumate a la comunidad que tiene su CV preparado y lo mejora
          paso a paso.
        </p>

        {URL_DESCARGA_APK && (
          <a
            href={URL_DESCARGA_APK}
            className="landing-boton landing-boton-claro"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconoDescarga />
            <span>Descargar CV Belgrano</span>
          </a>
        )}

        <span className="landing-gratuita">
          CV Belgrano · Aplicación gratuita
        </span>

      </section>

    </main>
  );
}