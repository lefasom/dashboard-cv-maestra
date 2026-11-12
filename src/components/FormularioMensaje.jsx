// src/components/FormularioMensaje.jsx
//
// Campos de cada modo de mensaje. Recibe el objeto `rico` y avisa cada
// cambio con onChange(nuevoRico).
//
// TRILINGÜE: cada texto visible se escribe en Español, Inglés y Portugués.
// El español va en el campo de siempre (rico.texto, rico.pregunta…); inglés
// y portugués van en rico.idioma.en / rico.idioma.pt (ver mensajesRicos.js).
// La app muestra el idioma de Ajustes y, si está vacío, el español.

import CampoFormato from "./CampoFormato";
import { IDIOMAS, leerTraduccion, ponerTraduccion } from "../servicios/mensajesRicos";
import "../estilos-mensajes.css";

const MAX_OPCIONES = 6;

export default function FormularioMensaje({ rico, onChange }) {
  const set = (campo, valor) => onChange({ ...rico, [campo]: valor });

  // Valor y setter de un campo en un idioma ("es" = campo base)
  const valorEn = (lang, campo) =>
    lang === "es" ? rico[campo] ?? "" : leerTraduccion(rico, lang, campo) ?? "";
  const setEn = (lang, campo, valor) =>
    lang === "es"
      ? set(campo, valor)
      : onChange(ponerTraduccion(rico, lang, campo, valor));

  // Repite un campo de texto 3 veces, uno por idioma, con rótulo claro
  const tri = (etiqueta, campo, render) => (
    <div className="mr-trilingue">
      {IDIOMAS.map(({ id, nombre, bandera }) =>
        render({
          key: id,
          etiqueta: `${etiqueta} · ${bandera} ${nombre}${
            id === "es" ? "" : " (si queda vacío se muestra el español)"
          }`,
          value: valorEn(id, campo),
          onChange: (v) => setEn(id, campo, v),
        })
      )}
    </div>
  );

  const textarea = (rows, maxLength) => (p) => (
    <label className="mr-campo" key={p.key}>
      <span className="mr-campo-etiqueta">{p.etiqueta}</span>
      <textarea
        className="mr-textarea"
        rows={rows}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        maxLength={maxLength}
      />
    </label>
  );

  const input = (maxLength) => (p) => (
    <label className="mr-campo" key={p.key}>
      <span className="mr-campo-etiqueta">{p.etiqueta}</span>
      <input
        type="text"
        className="mr-input"
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        maxLength={maxLength}
      />
    </label>
  );

  const formato = (rows, placeholder) => (p) => (
    <CampoFormato
      key={p.key}
      etiqueta={p.etiqueta}
      value={p.value}
      onChange={p.onChange}
      rows={rows}
      placeholder={placeholder}
    />
  );

  switch (rico.tipo) {
    case "texto":
      return tri(
        "Texto del mensaje",
        "texto",
        formato(6, "Escribí el mensaje. Con Enter hacés un salto de línea.")
      );

    case "tarjeta":
      return (
        <>
          <label className="mr-campo">
            <span className="mr-campo-etiqueta">URL de la imagen</span>
            <input
              type="url"
              className="mr-input"
              value={rico.imagen ?? ""}
              onChange={(e) => set("imagen", e.target.value)}
              placeholder="https://…/imagen.jpg"
            />
          </label>

          {tri(
            "Texto debajo de la imagen (opcional)",
            "texto",
            formato(7, "Título, descripción, llamado a la acción…")
          )}
        </>
      );

    case "video":
      return (
        <>
          <label className="mr-campo">
            <span className="mr-campo-etiqueta">Enlace del video</span>
            <input
              type="url"
              className="mr-input"
              value={rico.url ?? ""}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <small className="mr-ayuda-campo">
              YouTube se reproduce dentro de la app ("Ver aquí"). Instagram,
              TikTok y Vimeo abren el enlace afuera.
            </small>
          </label>

          {tri("Título (opcional)", "titulo", input(150))}

          {tri("Descripción (opcional)", "descripcion", textarea(3, 400))}
        </>
      );

    case "encuesta_likes": {
      const v = Array.isArray(rico.votos) ? rico.votos : [0, 0];
      const setVoto = (i, valor) => {
        const nuevo = [v[0] ?? 0, v[1] ?? 0];
        nuevo[i] = Math.max(0, Math.round(Number(valor) || 0));
        set("votos", nuevo);
      };

      return (
        <>
          {tri("Pregunta", "pregunta", formato(3, "¿Te resulta fácil crear y personalizar tu currículum?"))}

          <div className="mr-dos">
            <label className="mr-campo">
              <span className="mr-campo-etiqueta">👍 Votos iniciales</span>
              <input
                type="number"
                min="0"
                className="mr-input"
                value={v[0] ?? 0}
                onChange={(e) => setVoto(0, e.target.value)}
              />
            </label>

            <label className="mr-campo">
              <span className="mr-campo-etiqueta">👎 Votos iniciales</span>
              <input
                type="number"
                min="0"
                className="mr-input"
                value={v[1] ?? 0}
                onChange={(e) => setVoto(1, e.target.value)}
              />
            </label>
          </div>
        </>
      );
    }

    case "encuesta_top": {
      const opciones = Array.isArray(rico.opciones) ? rico.opciones : [];

      const cambiar = (i, campo, valor) =>
        set(
          "opciones",
          opciones.map((o, n) => (n === i ? { ...o, [campo]: valor } : o))
        );

      const agregar = () =>
        set("opciones", [
          ...opciones,
          { id: String.fromCharCode(97 + opciones.length), texto: "", votos: 0 },
        ]);

      // Al quitar una opción también se quita su traducción
      const quitar = (i) => {
        let nuevo = { ...rico, opciones: opciones.filter((_, n) => n !== i) };
        IDIOMAS.filter((l) => l.id !== "es").forEach(({ id }) => {
          const t = leerTraduccion(rico, id, "opciones");
          if (Array.isArray(t))
            nuevo = ponerTraduccion(nuevo, id, "opciones", t.filter((_, n) => n !== i));
        });
        onChange(nuevo);
      };

      const opcionEn = (lang, i) => {
        const t = leerTraduccion(rico, lang, "opciones");
        return Array.isArray(t) ? t[i] ?? "" : "";
      };
      const setOpcionEn = (lang, i, valor) => {
        const t = leerTraduccion(rico, lang, "opciones");
        const arr = opciones.map((_, n) => (Array.isArray(t) ? t[n] ?? "" : ""));
        arr[i] = valor;
        onChange(ponerTraduccion(rico, lang, "opciones", arr));
      };

      return (
        <>
          {tri("Pregunta", "pregunta", formato(3, "¿Qué considerás más importante en un buen currículum?"))}

          <div className="mr-campo">
            <span className="mr-campo-etiqueta">
              Opciones (mínimo 2, máximo {MAX_OPCIONES})
            </span>

            {opciones.map((o, i) => (
              <div className="mr-opcion-fila" key={i}>
                <span className="mr-opcion-num">{i + 1}</span>

                <div className="mr-opcion-idiomas">
                  {IDIOMAS.map(({ id, nombre, bandera }) => (
                    <input
                      key={id}
                      type="text"
                      className="mr-input"
                      value={id === "es" ? o.texto ?? "" : opcionEn(id, i)}
                      onChange={(e) =>
                        id === "es"
                          ? cambiar(i, "texto", e.target.value)
                          : setOpcionEn(id, i, e.target.value)
                      }
                      placeholder={`Opción ${i + 1} · ${bandera} ${nombre}`}
                      aria-label={`Opción ${i + 1} en ${nombre}`}
                      maxLength={100}
                    />
                  ))}
                </div>

                <input
                  type="number"
                  min="0"
                  className="mr-input mr-input-votos"
                  value={o.votos ?? 0}
                  onChange={(e) =>
                    cambiar(
                      i,
                      "votos",
                      Math.max(0, Math.round(Number(e.target.value) || 0))
                    )
                  }
                  title="Votos iniciales"
                />

                <button
                  type="button"
                  className="mr-btn mr-btn-chico"
                  onClick={() => quitar(i)}
                  disabled={opciones.length <= 2}
                  aria-label={`Quitar opción ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              className="mr-btn mr-btn-chico"
              onClick={agregar}
              disabled={opciones.length >= MAX_OPCIONES}
            >
              ＋ Agregar opción
            </button>
          </div>
        </>
      );
    }

    default:
      return null;
  }
}
