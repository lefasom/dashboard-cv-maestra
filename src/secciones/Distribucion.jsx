// src/secciones/Distribucion.jsx  (Vite + React — Dashboard CV Master)
//
// Controla cómo la app comparte CV Maestra (Ajustes > Compartir aplicación).
//
// Documento de Firestore:  dashboard_config/distribucion
//
//   modoDistribucion   "apk" | "play"
//   urlApk             enlace de Google Drive con la APK vigente
//   urlPlay            enlace de la ficha de Play Store
//   mensajeCompartir   { es, en, pt }   texto que acompaña el enlace (opcional)
//   actualizadoEn      marca de tiempo del servidor (la pone esta pantalla)
//
// Cómo funciona:
//   - Arriba, 3 tarjetas: modo ACTUAL (el que tiene guardado Firebase), el
//     enlace que recibe hoy la gente y la última actualización.
//   - Abajo, el formulario: elegís el modo, pegás los dos enlaces y, si
//     querés, un mensaje por idioma. "Guardar" lo publica al instante: la
//     app lee el documento cada vez que alguien toca "Compartir".
//   - Si el documento no existe o la app no puede leerlo (sin internet,
//     Firebase caído), la app usa el modo APK con el enlace de Drive que
//     lleva escrito en el código (services/distribucionService.ts).
//   - Se guarda con merge: si el documento tiene otros campos (por ejemplo
//     los del control de versiones), no se tocan.
//
// Requiere sesión iniciada y la regla de dashboard_config/distribucion en
// firestore.rules.

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";

import { db } from "../firebase";

const COLECCION = "dashboard_config";
const DOCUMENTO = "distribucion";

const MODOS = [
  { id: "apk", label: "Modo APK", detalle: "Enlace de Drive" },
  { id: "play", label: "Modo Play Store", detalle: "Ficha de la tienda" },
];

const IDIOMAS = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
  { id: "pt", label: "Português" },
];

// ------------------------------------------------------------
// ESTILOS (van en este mismo archivo)
// ------------------------------------------------------------

const ESTILOS = `
.dist-form {
  padding: 16px 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dist-bloque {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dist-bloque > label,
.dist-titulo {
  font-size: 13px;
  font-weight: 800;
  color: var(--texto);
}

.dist-ayuda {
  margin: 0;
  color: var(--gris);
  font-size: 12px;
}

.dist-modos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dist-modos .chip-filtro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  padding: 9px 16px;
  border-radius: 14px;
  text-align: left;
}

.dist-modos .chip-filtro small {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.8;
}

.dist-input,
.dist-texto {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--borde);
  border-radius: 12px;
  background: var(--superficie-alt);
  outline: none;
}

.dist-input:focus,
.dist-texto:focus {
  border-color: var(--acento);
}

.dist-input.invalido {
  border-color: var(--error);
}

.dist-texto {
  min-height: 54px;
  resize: vertical;
}

.dist-fila-enlace {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dist-fila-enlace .dist-input {
  flex: 1;
  min-width: 0;
}

.dist-fila-enlace a {
  flex: none;
  color: var(--acento);
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.dist-activo {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 9px;
  border-radius: 10px;
  background: var(--acento-suave);
  color: var(--acento);
  font-size: 11px;
  font-weight: 800;
  vertical-align: 1px;
}

.dist-mensajes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.dist-previa {
  padding: 12px 14px;
  border: 1px dashed var(--borde);
  border-radius: 14px;
  background: var(--superficie-alt);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.dist-previa strong {
  display: block;
  margin-bottom: 2px;
  font-size: 12px;
  color: var(--gris);
}

.dist-acciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.dist-acciones button:disabled {
  opacity: 0.45;
  cursor: default;
}

.dist-ok {
  margin: 0;
  color: var(--verde);
  font-weight: 700;
}

.dist-pendiente {
  margin: 0;
  color: #b07d00;
  font-weight: 700;
  font-size: 13px;
}

.dist-errores {
  margin: 0;
  padding: 10px 14px 10px 30px;
  border-radius: 12px;
  background: rgba(220, 38, 38, 0.1);
  color: var(--error);
  font-weight: 600;
}

.card .dist-corto {
  font-size: 15px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
`;

// ------------------------------------------------------------
// AYUDAS
// ------------------------------------------------------------

const esUrl = (valor) => /^https?:\/\/\S+$/i.test(String(valor).trim());

const formularioVacio = {
  modo: "apk",
  urlApk: "",
  urlPlay: "",
  es: "",
  en: "",
  pt: "",
};

// Pasa el documento de Firestore al formato del formulario
const aFormulario = (datos) => {
  if (!datos) return formularioVacio;

  const mensajes =
    datos.mensajeCompartir && typeof datos.mensajeCompartir === "object"
      ? datos.mensajeCompartir
      : {};

  return {
    modo: datos.modoDistribucion === "play" ? "play" : "apk",
    urlApk: typeof datos.urlApk === "string" ? datos.urlApk : "",
    urlPlay: typeof datos.urlPlay === "string" ? datos.urlPlay : "",
    es: typeof mensajes.es === "string" ? mensajes.es : "",
    en: typeof mensajes.en === "string" ? mensajes.en : "",
    pt: typeof mensajes.pt === "string" ? mensajes.pt : "",
  };
};

const formatoFecha = (marca) => {
  const fecha = typeof marca?.toDate === "function" ? marca.toDate() : null;
  if (!fecha) return "—";

  return fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const nombreModo = (modo) => (modo === "play" ? "Play Store" : "APK");

// ------------------------------------------------------------
// COMPONENTE
// ------------------------------------------------------------

export default function Distribucion() {
  const [remoto, setRemoto] = useState(null); // datos guardados en Firebase
  const [existe, setExiste] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [errorLectura, setErrorLectura] = useState(null);

  const [form, setForm] = useState(formularioVacio);
  const [editado, setEditado] = useState(false);
  const editadoRef = useRef(false);

  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [errores, setErrores] = useState([]);

  // Escucha el documento. Si estás escribiendo, no te pisa lo que tipeaste.
  useEffect(() => {
    return onSnapshot(
      doc(db, COLECCION, DOCUMENTO),
      (snap) => {
        const datos = snap.exists() ? snap.data() : null;

        setExiste(snap.exists());
        setRemoto(datos);
        setErrorLectura(null);
        setCargando(false);

        if (!editadoRef.current) setForm(aFormulario(datos));
      },
      (err) => {
        console.error("[distribucion] Error leyendo Firestore:", err);

        setErrorLectura(
          err?.code === "permission-denied"
            ? "No tenés permiso para leer la configuración. Publicá las reglas nuevas e iniciá sesión."
            : "No se pudo cargar la configuración."
        );
        setCargando(false);
      }
    );
  }, []);

  const cambiar = (campo, valor) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
    editadoRef.current = true;
    setEditado(true);
    setGuardadoOk(false);
    setErrores([]);
  };

  const descartar = () => {
    editadoRef.current = false;
    setEditado(false);
    setErrores([]);
    setGuardadoOk(false);
    setForm(aFormulario(remoto));
  };

  // Lo que está publicado hoy
  const formRemoto = useMemo(() => aFormulario(remoto), [remoto]);
  const modoActual = existe ? formRemoto.modo : "apk";
  const enlaceActual = existe
    ? modoActual === "play"
      ? formRemoto.urlPlay
      : formRemoto.urlApk
    : "";

  // Lo que recibirá la gente si guardás el formulario tal como está
  const enlaceNuevo = form.modo === "play" ? form.urlPlay : form.urlApk;

  const urlApkInvalida = form.urlApk.trim() !== "" && !esUrl(form.urlApk);
  const urlPlayInvalida = form.urlPlay.trim() !== "" && !esUrl(form.urlPlay);

  const guardar = async () => {
    if (guardando) return;

    const problemas = [];

    if (urlApkInvalida) {
      problemas.push("El enlace de la APK debe empezar con http:// o https://");
    }

    if (urlPlayInvalida) {
      problemas.push(
        "El enlace de Play Store debe empezar con http:// o https://"
      );
    }

    // El enlace del modo elegido es obligatorio: si estuviera vacío, la app
    // volvería en silencio al enlace por defecto
    if (!esUrl(enlaceNuevo)) {
      problemas.push(
        `Falta el enlace del modo ${nombreModo(form.modo)}: es el que recibirá la gente.`
      );
    }

    if (problemas.length > 0) {
      setErrores(problemas);
      return;
    }

    setGuardando(true);
    setErrores([]);
    setGuardadoOk(false);

    try {
      await setDoc(
        doc(db, COLECCION, DOCUMENTO),
        {
          modoDistribucion: form.modo,
          urlApk: form.urlApk.trim(),
          urlPlay: form.urlPlay.trim(),
          mensajeCompartir: {
            es: form.es.trim(),
            en: form.en.trim(),
            pt: form.pt.trim(),
          },
          actualizadoEn: serverTimestamp(),
        },
        { merge: true }
      );

      editadoRef.current = false;
      setEditado(false);
      setGuardadoOk(true);
    } catch (err) {
      console.error("[distribucion] No se pudo guardar:", err);

      setErrores([
        err?.code === "permission-denied"
          ? "No se pudo guardar: sin permiso. Iniciá sesión y publicá la regla de dashboard_config/distribucion."
          : "No se pudo guardar. Intentá de nuevo.",
      ]);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <style>{ESTILOS}</style>

      {cargando && <p className="estado-carga">Cargando…</p>}
      {errorLectura && <p className="error">Error: {errorLectura}</p>}

      {!cargando && !errorLectura && !existe && (
        <p className="aviso">
          Todavía no hay configuración guardada. Mientras tanto la app usa el
          modo APK con el enlace de Drive que lleva en el código. Completá el
          formulario y tocá Guardar para tomar el control desde acá.
        </p>
      )}

      {/* ---------------- TARJETAS ---------------- */}
      <div className="resumen">
        <div className="card">
          <span>Modo actual en la app</span>
          <strong>{nombreModo(modoActual)}</strong>
          <small className="card-sub">
            {existe ? "Guardado en Firebase" : "Por defecto (sin configurar)"}
          </small>
        </div>

        <div className="card">
          <span>Enlace que recibe la gente</span>
          <strong className="dist-corto">
            {enlaceActual || "Enlace por defecto de la app"}
          </strong>
        </div>

        <div className="card">
          <span>Última actualización</span>
          <strong className="dist-corto">
            {formatoFecha(remoto?.actualizadoEn)}
          </strong>
        </div>
      </div>

      {/* ---------------- FORMULARIO ---------------- */}
      <section className="panel">
        <div className="panel-head">
          <h2>Compartir la app</h2>
        </div>

        <div className="dist-form">
          <div className="dist-bloque">
            <span className="dist-titulo">Modo de distribución</span>

            <div className="dist-modos">
              {MODOS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`chip-filtro${form.modo === m.id ? " activo" : ""}`}
                  onClick={() => cambiar("modo", m.id)}
                  aria-pressed={form.modo === m.id}
                >
                  {m.label}
                  <small>{m.detalle}</small>
                </button>
              ))}
            </div>

            <p className="dist-ayuda">
              El modo elegido decide qué enlace se comparte. El otro enlace
              queda guardado para cuando cambies de modo.
            </p>
          </div>

          <div className="dist-bloque">
            <label htmlFor="dist-url-apk">
              Enlace de la APK (Google Drive)
              {form.modo === "apk" && <span className="dist-activo">En uso</span>}
            </label>

            <div className="dist-fila-enlace">
              <input
                id="dist-url-apk"
                type="url"
                className={`dist-input${urlApkInvalida ? " invalido" : ""}`}
                value={form.urlApk}
                onChange={(e) => cambiar("urlApk", e.target.value)}
                placeholder="https://drive.google.com/…"
                autoComplete="off"
                spellCheck={false}
              />

              {esUrl(form.urlApk) && (
                <a href={form.urlApk.trim()} target="_blank" rel="noreferrer">
                  Probar ↗
                </a>
              )}
            </div>

            <p className="dist-ayuda">
              Usá siempre el mismo enlace y reemplazá el archivo dentro de
              Drive. Acceso: “cualquiera con el enlace”.
            </p>
          </div>

          <div className="dist-bloque">
            <label htmlFor="dist-url-play">
              Enlace de Play Store
              {form.modo === "play" && <span className="dist-activo">En uso</span>}
            </label>

            <div className="dist-fila-enlace">
              <input
                id="dist-url-play"
                type="url"
                className={`dist-input${urlPlayInvalida ? " invalido" : ""}`}
                value={form.urlPlay}
                onChange={(e) => cambiar("urlPlay", e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=…"
                autoComplete="off"
                spellCheck={false}
              />

              {esUrl(form.urlPlay) && (
                <a href={form.urlPlay.trim()} target="_blank" rel="noreferrer">
                  Probar ↗
                </a>
              )}
            </div>
          </div>

          <div className="dist-bloque">
            <span className="dist-titulo">
              Mensaje que acompaña el enlace (opcional)
            </span>

            <p className="dist-ayuda">
              Si un idioma queda vacío, la app usa su texto por defecto. El
              enlace se agrega solo, en una línea nueva.
            </p>

            <div className="dist-mensajes">
              {IDIOMAS.map((i) => (
                <div className="dist-bloque" key={i.id}>
                  <label htmlFor={`dist-msg-${i.id}`}>{i.label}</label>

                  <textarea
                    id={`dist-msg-${i.id}`}
                    className="dist-texto"
                    value={form[i.id]}
                    onChange={(e) => cambiar(i.id, e.target.value)}
                    maxLength={200}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="dist-previa">
            <strong>Lo que recibirá la gente al guardar</strong>
            {enlaceNuevo.trim() || "— (falta el enlace del modo elegido)"}
          </div>

          {errores.length > 0 && (
            <ul className="dist-errores">
              {errores.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          <div className="dist-acciones">
            <button type="button" onClick={guardar} disabled={guardando || !editado}>
              {guardando ? "Guardando…" : "Guardar"}
            </button>

            <button
              type="button"
              className="btn-claro"
              onClick={descartar}
              disabled={guardando || !editado}
            >
              Descartar cambios
            </button>

            {editado && !guardando && (
              <p className="dist-pendiente">Hay cambios sin guardar</p>
            )}

            {guardadoOk && !editado && (
              <p className="dist-ok">Guardado. La app ya lo usa.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
