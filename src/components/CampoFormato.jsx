// src/components/CampoFormato.jsx
//
// Cuadro de texto con barra de formato. Los botones envuelven lo que tengas
// seleccionado con las marcas que entiende la app:
//   N  = *negrita*     G = **grande**     C = ~cursiva~
//   Color = {color:texto}
//   ↵  = salto de línea (con Enter también se hace)
// No hace falta escribir las marcas a mano.

import { useRef } from "react";

import { LIMITE_TEXTO_RICO } from "../config";
import { COLORES_FORMATO } from "./PreviewMensaje";
import "../estilos-mensajes.css";

export default function CampoFormato({
  etiqueta,
  value,
  onChange,
  rows = 4,
  placeholder = "",
  maxLength = LIMITE_TEXTO_RICO,
  formato = true,
}) {
  const ref = useRef(null);

  // Envuelve la selección (o un texto de ejemplo) con apertura y cierre
  const envolver = (apertura, cierre, relleno = "texto") => {
    const el = ref.current;
    if (!el) return;

    const ini = el.selectionStart ?? value.length;
    const fin = el.selectionEnd ?? value.length;
    const elegido = value.slice(ini, fin) || relleno;

    onChange(
      value.slice(0, ini) + apertura + elegido + cierre + value.slice(fin)
    );

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        ini + apertura.length,
        ini + apertura.length + elegido.length
      );
    });
  };

  const insertarSalto = () => {
    const el = ref.current;
    if (!el) return;

    const ini = el.selectionStart ?? value.length;
    const fin = el.selectionEnd ?? value.length;

    onChange(value.slice(0, ini) + "\n" + value.slice(fin));

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(ini + 1, ini + 1);
    });
  };

  // Los botones no le sacan el foco al cuadro (si no, se pierde la selección)
  const sinFoco = (e) => e.preventDefault();

  return (
    <label className="mr-campo">
      {etiqueta && <span className="mr-campo-etiqueta">{etiqueta}</span>}

      {formato && (
        <div className="mr-barra-formato" role="toolbar" aria-label="Formato">
          <button
            type="button"
            title="Negrita: *texto*"
            onMouseDown={sinFoco}
            onClick={() => envolver("*", "*")}
          >
            <b>N</b>
          </button>

          <button
            type="button"
            title="Negrita grande: **texto**"
            onMouseDown={sinFoco}
            onClick={() => envolver("**", "**")}
          >
            <b>G</b>
          </button>

          <button
            type="button"
            title="Cursiva: ~texto~"
            onMouseDown={sinFoco}
            onClick={() => envolver("~", "~")}
          >
            <i>C</i>
          </button>

          <span className="mr-sep" />

          {Object.entries(COLORES_FORMATO).map(([nombre, hex]) => (
            <button
              key={nombre}
              type="button"
              className="mr-color"
              title={`Color ${nombre}: {${nombre}:texto}`}
              onMouseDown={sinFoco}
              onClick={() => envolver(`{${nombre}:`, "}")}
            >
              <span style={{ background: hex }} />
            </button>
          ))}

          <span className="mr-sep" />

          <button
            type="button"
            title="Salto de línea"
            onMouseDown={sinFoco}
            onClick={insertarSalto}
          >
            ↵
          </button>
        </div>
      )}

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mr-textarea"
      />

      <span className={`mr-contador${value.length > maxLength ? " excedido" : ""}`}>
        {value.length}/{maxLength}
      </span>
    </label>
  );
}
