import { useEffect, useRef, useState } from "react";
import "./LandingPage.css";
import logoCV from "./src/assets/cvbelgrano.png";
import { IDIOMAS, TEXTOS } from "./LandingTextos";

/* ------------------------------------------------------------------
   LANDING DE CV BELGRANO

   Los textos (es · en · pt) y las capturas de cada sección están en
   `LandingTextos.js`. Este archivo solo dibuja: para cambiar un texto,
   agregar una pregunta o un plan, se edita LandingTextos.js.

   Enlaces de descarga: Google Play es el canal principal y el APK la
   alternativa (por ejemplo, para los carteles con QR). Si un enlace
   está vacío, su botón se muestra sin acción.
------------------------------------------------------------------ */
const URL_GOOGLE_PLAY =
  "https://play.google.com/store/apps/details?id=com.cvbelgrano.app";
// PEGAR AQUÍ EL ENLACE REAL DE DESCARGA DEL APK.
const URL_DESCARGA_APK = "";

const CLAVE_IDIOMA = "landing_idioma";

// Idioma del sistema (igual que la app, 14/11/2026): se recorre la lista de
// idiomas preferidos del navegador / teléfono y se toma el primero que la
// landing tiene (es, en, pt). Si ninguno está, español.
function idiomaDelSistema() {
  const lista =
    Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "es"];
  for (const locale of lista) {
    const codigo = String(locale).slice(0, 2).toLowerCase();
    if (TEXTOS[codigo]) return codigo;
  }
  return "es";
}

// Idioma inicial: el que la persona eligió con el selector; si nunca eligió,
// el del sistema. El del sistema NO se guarda, así sigue al teléfono.
function idiomaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE_IDIOMA);
    if (guardado && TEXTOS[guardado]) return guardado;
  } catch {
    // Sin almacenamiento (modo privado): se sigue con el sistema.
  }
  return idiomaDelSistema();
}

/* ------------------------------------------------------------------
   CAPTURAS: imagen real o recuadro con el nombre del PNG que falta
------------------------------------------------------------------ */
const imagenes = import.meta.glob("./src/assets/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const urlImagen = (nombre) =>
  nombre ? imagenes[`./src/assets/${nombre}`] || "" : "";

function Captura({ titulo, detalle, archivo, etiqueta }) {
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
        <div className="landing-captura" role="img" aria-label={`${etiqueta}: ${titulo}`}>
          <span className="landing-captura-tag">{etiqueta}</span>
          <strong>{titulo}</strong>
          {detalle && <span>{detalle}</span>}
          {archivo && <code>src/assets/{archivo}</code>}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   ÍCONOS
------------------------------------------------------------------ */
function IconoDescarga() {
  return (
    <span className="landing-download-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" focusable="false">
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

function IconoAccesibilidad() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
    </svg>
  );
}

function IconoCorona() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}

function IconoDestellos() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M10 2l1.9 5.6L17.5 9.5l-5.6 1.9L10 17l-1.9-5.6L2.5 9.5l5.6-1.9L10 2zm8 10l.9 2.6 2.6.9-2.6.9L18 19l-.9-2.6-2.6-.9 2.6-.9L18 12z" />
    </svg>
  );
}

function IconoGlobo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   PIEZAS REUTILIZABLES
------------------------------------------------------------------ */
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

function BotonPlay({ t, claro = false, texto }) {
  return (
    <Boton
      url={URL_GOOGLE_PLAY}
      clase={`landing-boton${claro ? " landing-boton-claro" : ""}`}
      icono={<IconoTienda />}
      texto={texto ?? t.botones.play}
      detalle={t.botones.playDetalle}
    />
  );
}

function BotonApk({ t }) {
  return (
    <Boton
      url={URL_DESCARGA_APK}
      clase="landing-boton landing-boton-secundario"
      icono={<IconoDescarga />}
      texto={t.botones.apk}
      detalle={t.botones.apkDetalle}
    />
  );
}

const Check = () => (
  <span className="landing-lista-check" aria-hidden="true">✓</span>
);

function Lista({ items, chica = false }) {
  return (
    <ul className={`landing-lista${chica ? " landing-lista-chica" : ""}`}>
      {items.map((item) => (
        <li key={item}><Check />{item}</li>
      ))}
    </ul>
  );
}

function Cabecera({ datos, id, clase = "landing-experiencia-cabecera" }) {
  return (
    <div className={clase}>
      <span className="landing-etiqueta">{datos.etiqueta}</span>
      <h2 id={id}>{datos.titulo}</h2>
      {datos.texto && <p>{datos.texto}</p>}
    </div>
  );
}

// Dos capturas a un lado y texto con lista al otro (fondo liso).
function SeccionTelefonos({ datos, id, etiquetaCaptura }) {
  return (
    <section className="landing-formularios" aria-labelledby={id}>
      <div className="landing-formularios-telefonos">
        {datos.capturas.map((c, i) => (
          <figure key={c.archivo}
            className={`landing-formularios-item${i === 1 ? " landing-formularios-item-dos" : ""}`}>
            <Captura {...c} etiqueta={etiquetaCaptura} />
            <figcaption>{c.pie}</figcaption>
          </figure>
        ))}
      </div>

      <div className="landing-formularios-texto">
        <span className="landing-etiqueta">{datos.etiqueta}</span>
        <h2 id={id}>{datos.titulo}</h2>
        <p>{datos.texto}</p>
        <Lista items={datos.lista} />
      </div>
    </section>
  );
}

// Panel redondeado: texto a un lado y dos capturas al otro.
function SeccionPanel({ datos, id, idSeccion, etiquetaCaptura, clase = "", etiqueta, children }) {
  return (
    <section className={`landing-oscuro ${clase}`} id={idSeccion} aria-labelledby={id}>
      <div className="landing-oscuro-texto">
        {etiqueta ?? <span className="landing-etiqueta">{datos.etiqueta}</span>}
        <h2 id={id}>{datos.titulo}</h2>
        <p>{datos.texto}</p>
        {children ?? <Lista items={datos.lista} />}
        {datos.nota && <p className="landing-oscuro-nota">{datos.nota}</p>}
      </div>

      <div className="landing-oscuro-telefonos">
        {datos.capturas.map((c, i) => (
          <figure key={c.archivo}
            className={`landing-oscuro-item landing-oscuro-item-${i === 0 ? "uno" : "dos"}`}>
            <Captura {...c} etiqueta={etiquetaCaptura} />
            <figcaption>{c.pie}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Pasos({ items, clase = "" }) {
  return (
    <ol className={`landing-instalar ${clase}`}>
      {items.map((paso, i) => (
        <li key={paso.t}>
          <span className="landing-galeria-numero">{i + 1}</span>
          <div>
            <h3>{paso.t}</h3>
            <p>{paso.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Columnas({ items }) {
  return (
    <div className="landing-siempre-columnas landing-columnas-cuatro">
      {items.map((c) => (
        <div key={c.t}>
          <h3>{c.t}</h3>
          <p>{c.d}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   SELECTOR DE IDIOMA (en la barra superior)
------------------------------------------------------------------ */
function SelectorIdioma({ idioma, cambiar, etiqueta }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);
  const actual = IDIOMAS.find((i) => i.codigo === idioma) ?? IDIOMAS[0];

  // Se cierra al tocar afuera o con Escape.
  useEffect(() => {
    if (!abierto) return undefined;
    const afuera = (e) => {
      if (caja.current && !caja.current.contains(e.target)) setAbierto(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("pointerdown", afuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", afuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  return (
    <div className="landing-idioma" ref={caja}>
      <button
        type="button"
        className="landing-idioma-boton"
        aria-haspopup="true"
        aria-expanded={abierto}
        aria-label={`${etiqueta}: ${actual.nombre}`}
        onClick={() => setAbierto((v) => !v)}
      >
        <IconoGlobo />
        <span>{actual.corto}</span>
        <span className="landing-idioma-flecha" aria-hidden="true">▾</span>
      </button>

      {abierto && (
        <ul className="landing-idioma-menu">
          {IDIOMAS.map((i) => (
            <li key={i.codigo}>
              <button
                type="button"
                lang={i.codigo}
                aria-current={i.codigo === idioma ? "true" : undefined}
                className={i.codigo === idioma ? "activo" : ""}
                onClick={() => {
                  cambiar(i.codigo);
                  setAbierto(false);
                }}
              >
                <span className="landing-idioma-codigo">{i.corto}</span>
                {i.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   PÁGINA
------------------------------------------------------------------ */
export default function LandingPage() {
  const [idioma, setIdioma] = useState(idiomaInicial);
  const t = TEXTOS[idioma];

  // Solo se guarda lo que se elige con el selector.
  const elegirIdioma = (codigo) => {
    setIdioma(codigo);
    try {
      localStorage.setItem(CLAVE_IDIOMA, codigo);
    } catch {
      // Sin almacenamiento: el idioma vale solo para esta visita.
    }
  };
  const cap = t.captura;

  // Idioma del documento y título de la pestaña.
  useEffect(() => {
    document.documentElement.lang = idioma;
    document.title = t.meta.titulo;
  }, [idioma, t]);

  return (
    <main className="landing-page" lang={idioma}>

      {/* ============ BARRA SUPERIOR ============ */}

      <header className="landing-barra">
        <a href="#inicio" className="landing-barra-marca">
          <img src={logoCV} alt="" width="36" height="36" />
          <span>{t.hero.nombre}</span>
        </a>
        <nav className="landing-barra-enlaces" aria-label={t.barra.enlacesAria}>
          {t.barra.enlaces.map((e) => (
            <a key={e.href} href={e.href}>{e.texto}</a>
          ))}
        </nav>
        <div className="landing-barra-acciones">
          <SelectorIdioma idioma={idioma} cambiar={elegirIdioma} etiqueta={t.barra.idiomaAria} />
          <a href="#descargar" className="landing-barra-boton">{t.barra.descargar}</a>
        </div>
      </header>

      {/* ============ HERO ============ */}

      <section className="landing-hero" id="inicio">
        <div className="landing-contenido">
          <div className="landing-identidad">
            <img src={logoCV} alt={t.hero.logoAlt} className="landing-logo" />
            <div>
              <h1>{t.hero.nombre}</h1>
              <p>{t.hero.subtitulo}</p>
            </div>
          </div>

          <div className="landing-texto">
            <span className="landing-etiqueta">{t.hero.etiqueta}</span>
            <h2>
              {t.hero.titulo}
              <span> {t.hero.tituloResalte}</span>
            </h2>
            <p>{t.hero.texto}</p>

            <div className="landing-hero-cta">
              <BotonPlay t={t} />
            </div>

            <ul className="landing-chips" aria-label={t.hero.chipsAria}>
              {t.hero.chips.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>

        <div className="landing-telefonos">
          <div className="landing-decoracion" aria-hidden="true" />
          {t.hero.capturas.map((c, i) => (
            <div key={c.archivo} className={`landing-telefono landing-telefono-${i === 0 ? "uno" : "dos"}`}>
              <Captura {...c} etiqueta={cap} />
            </div>
          ))}
        </div>
      </section>

      {/* ============ NÚMEROS ============ */}

      <section className="landing-franja" aria-label={t.numeros.aria}>
        <div className="landing-franja-interior">
          <ul className="landing-numeros">
            {t.numeros.items.map((n) => (
              <li key={n.t}><strong>{n.n}</strong><span>{n.t}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ EL PROBLEMA ============ */}

      <section className="landing-siempre" aria-labelledby="landing-problema-titulo">
        <div className="landing-siempre-interior">
          <Cabecera datos={t.problema} id="landing-problema-titulo" clase="landing-siempre-cabecera" />
          <Columnas items={t.problema.columnas} />
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}

      <section className="landing-experiencia" id="funciones" aria-labelledby="landing-pasos-titulo">
        <div className="landing-experiencia-interior">
          <Cabecera datos={t.pasos} id="landing-pasos-titulo" />
          <Pasos items={t.pasos.items} clase="landing-pasos" />
        </div>
      </section>

      {/* ============ EXPERIENCIA MEJORADA ============ */}

      <section className="landing-experiencia" aria-labelledby="landing-experiencia-titulo">
        <div className="landing-experiencia-interior">
          <Cabecera datos={t.experiencia} id="landing-experiencia-titulo" />

          <div className="landing-galeria">
            {t.experiencia.galeria.map((g, i) => (
              <figure key={g.archivo} className="landing-galeria-item">
                <Captura archivo={g.archivo} titulo={g.titulo} detalle={g.detalle} etiqueta={cap} />
                <figcaption>
                  <span className="landing-galeria-numero">{i + 1}</span>
                  <strong>{g.nombre}</strong>
                  <span>{g.texto}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="landing-desbloqueo">
            {t.experiencia.desbloqueo.map((d) => (
              <div key={d.t}>
                <h3>{d.t}</h3>
                <p>{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FORMULARIOS ============ */}

      <SeccionTelefonos datos={t.formularios} id="landing-formularios-titulo" etiquetaCaptura={cap} />

      {/* ============ LO QUE VES ES LO QUE SALE ============ */}

      <SeccionPanel datos={t.hojas} id="landing-hojas-titulo" etiquetaCaptura={cap} />

      {/* ============ PLANTILLAS ============ */}

      <SeccionTelefonos datos={t.plantillas} id="landing-plantillas-titulo" etiquetaCaptura={cap} />

      {/* ============ ANALIZADOR + IA ============ */}

      <SeccionPanel
        datos={t.ia}
        id="landing-ia-titulo"
        idSeccion="ia"
        etiquetaCaptura={cap}
        clase="landing-ia"
        etiqueta={
          <span className="landing-etiqueta landing-etiqueta-dorada">
            <span className="landing-etiqueta-icono"><IconoDestellos /></span>
            {t.ia.etiqueta}
          </span>
        }
      >
        <div className="landing-ia-tarjetas">
          {t.ia.tarjetas.map((tarjeta) => (
            <div key={tarjeta.titulo}
              className={`landing-ia-tarjeta${tarjeta.dorada ? " landing-ia-tarjeta-dorada" : ""}`}>
              <span className="landing-ia-tag">{tarjeta.tag}</span>
              <h3>{tarjeta.titulo}</h3>
              <Lista items={tarjeta.lista} chica />
            </div>
          ))}
        </div>
      </SeccionPanel>

      {/* ============ PERFILES Y MIS CVs ============ */}

      <SeccionTelefonos datos={t.perfiles} id="landing-perfiles-titulo" etiquetaCaptura={cap} />

      {/* ============ TODO LO QUE ES GRATIS ============ */}

      <section className="landing-siempre" id="gratis" aria-labelledby="landing-gratis-titulo">
        <div className="landing-siempre-interior">
          <Cabecera datos={t.gratis} id="landing-gratis-titulo" clase="landing-siempre-cabecera" />
          <ul className="landing-gratis">
            {t.gratis.items.map(({ t: titulo, d }) => (
              <li key={titulo}>
                <Check />
                <div>
                  <h3>{titulo}</h3>
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
          <Cabecera datos={t.planes} id="landing-planes-titulo" />

          <div className="landing-planes">
            {t.planes.items.map((plan) => (
              <article
                key={plan.id}
                className={`landing-plan${plan.destacado ? " landing-plan-destacado" : ""}${plan.futuro ? " landing-plan-futuro" : ""}`}
                aria-labelledby={`plan-${plan.id}`}
              >
                {plan.destacado && <span className="landing-plan-cinta">{t.planes.recomendado}</span>}
                <h3 id={`plan-${plan.id}`}>
                  {plan.corona && <span className="landing-plan-corona"><IconoCorona /></span>}
                  {plan.nombre}
                </h3>
                <p className="landing-plan-precio">
                  <strong>{plan.precio}</strong>
                  {plan.periodo && <span>{plan.periodo}</span>}
                </p>
                <p className="landing-plan-resumen">{plan.resumen}</p>
                <Lista items={plan.incluye} chica />
              </article>
            ))}
          </div>

          <ul className="landing-garantias" aria-label={t.planes.garantiasAria}>
            {t.planes.garantias.map((g) => <li key={g}>{g}</li>)}
          </ul>
          <p className="landing-planes-nota">{t.planes.nota}</p>
        </div>
      </section>

      {/* ============ PRIVACIDAD ============ */}

      <section className="landing-siempre" aria-labelledby="landing-privacidad-titulo">
        <div className="landing-siempre-interior">
          <Cabecera datos={t.privacidad} id="landing-privacidad-titulo" clase="landing-siempre-cabecera" />
          <Columnas items={t.privacidad.columnas} />
        </div>
      </section>

      {/* ============ COMUNIDAD Y MODO OSCURO ============ */}

      <SeccionPanel datos={t.comunidad} id="landing-oscuro-titulo" etiquetaCaptura={cap} />

      {/* ============ ACCESIBILIDAD ============ */}

      <section className="landing-accesibilidad" aria-labelledby="landing-accesibilidad-titulo">
        <div className="landing-accesibilidad-icono" aria-hidden="true">
          <IconoAccesibilidad />
        </div>

        <div className="landing-accesibilidad-texto">
          <span className="landing-etiqueta">{t.accesibilidad.etiqueta}</span>
          <h2 id="landing-accesibilidad-titulo">{t.accesibilidad.titulo}</h2>
          {t.accesibilidad.parrafos.map((p) => <p key={p}>{p}</p>)}
          <Lista items={t.accesibilidad.lista} />
        </div>

        <div className="landing-accesibilidad-capturas">
          {t.accesibilidad.capturas.map((c) => (
            <figure key={c.archivo} className="landing-oscuro-item">
              <Captura {...c} etiqueta={cap} />
              <figcaption>{c.pie}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ============ DESCARGA ============ */}

      <section className="landing-siempre" id="descargar" aria-labelledby="landing-instalar-titulo">
        <div className="landing-siempre-interior">
          <Cabecera datos={t.descarga} id="landing-instalar-titulo" clase="landing-siempre-cabecera" />

          <div className="landing-descargas">
            <BotonPlay t={t} />
            <BotonApk t={t} />
          </div>

          <h3 className="landing-subtitulo">{t.descarga.subtitulo}</h3>
          <Pasos items={t.descarga.pasos} />
        </div>
      </section>

      {/* ============ PREGUNTAS FRECUENTES ============ */}

      <section className="landing-experiencia" id="preguntas" aria-labelledby="landing-faq-titulo">
        <div className="landing-experiencia-interior">
          <Cabecera datos={t.faq} id="landing-faq-titulo" />
          <div className="landing-faq">
            {t.faq.items.map(({ p, r }) => (
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
        <h2>{t.cierre.titulo}</h2>
        <p>{t.cierre.texto}</p>
        <BotonPlay t={t} claro texto={t.cierre.boton} />
        <span className="landing-gratuita">{t.cierre.pie}</span>
      </section>

    </main>
  );
}
