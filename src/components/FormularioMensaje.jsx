// src/components/FormularioMensaje.jsx
//
// Campos de cada modo de mensaje. Recibe el objeto `rico` y avisa cada
// cambio con onChange(nuevoRico).

import CampoFormato from "./CampoFormato";
import "../estilos-mensajes.css";

const MAX_OPCIONES = 6;

export default function FormularioMensaje({ rico, onChange }) {
  const set = (campo, valor) => onChange({ ...rico, [campo]: valor });

  switch (rico.tipo) {
    case "texto":
      return (
        <CampoFormato
          etiqueta="Texto del mensaje"
          value={rico.texto ?? ""}
          onChange={(v) => set("texto", v)}
          rows={6}
          placeholder="Escribí el mensaje. Con Enter hacés un salto de línea."
        />
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

          <CampoFormato
            etiqueta="Texto debajo de la imagen (opcional)"
            value={rico.texto ?? ""}
            onChange={(v) => set("texto", v)}
            rows={7}
            placeholder="Título, descripción, llamado a la acción…"
          />
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

          <label className="mr-campo">
            <span className="mr-campo-etiqueta">Título (opcional)</span>
            <input
              type="text"
              className="mr-input"
              value={rico.titulo ?? ""}
              onChange={(e) => set("titulo", e.target.value)}
              maxLength={150}
            />
          </label>

          <label className="mr-campo">
            <span className="mr-campo-etiqueta">Descripción (opcional)</span>
            <textarea
              className="mr-textarea"
              rows={3}
              value={rico.descripcion ?? ""}
              onChange={(e) => set("descripcion", e.target.value)}
              maxLength={400}
            />
          </label>
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
          <CampoFormato
            etiqueta="Pregunta"
            value={rico.pregunta ?? ""}
            onChange={(val) => set("pregunta", val)}
            rows={3}
            placeholder="¿Te resulta fácil crear y personalizar tu currículum?"
          />

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

      const quitar = (i) =>
        set(
          "opciones",
          opciones.filter((_, n) => n !== i)
        );

      return (
        <>
          <CampoFormato
            etiqueta="Pregunta"
            value={rico.pregunta ?? ""}
            onChange={(val) => set("pregunta", val)}
            rows={3}
            placeholder="¿Qué considerás más importante en un buen currículum?"
          />

          <div className="mr-campo">
            <span className="mr-campo-etiqueta">
              Opciones (mínimo 2, máximo {MAX_OPCIONES})
            </span>

            {opciones.map((o, i) => (
              <div className="mr-opcion-fila" key={i}>
                <span className="mr-opcion-num">{i + 1}</span>

                <input
                  type="text"
                  className="mr-input"
                  value={o.texto ?? ""}
                  onChange={(e) => cambiar(i, "texto", e.target.value)}
                  placeholder={`Opción ${i + 1}`}
                  maxLength={100}
                />

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
