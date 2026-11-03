// src/components/GuiaFormatos.jsx
//
// Cartelito con las reglas de formato de los textos (negrita, colores…).
// Se muestra dentro del editor y en la sección "Mensajes personalizados".

import { COLORES_FORMATO, TextoFormato } from "./PreviewMensaje";
import "../estilos-mensajes.css";

const FILAS = [
  { marca: "*texto*", ejemplo: "*Negrita*", nota: "Negrita" },
  { marca: "**texto**", ejemplo: "**Título grande**", nota: "Negrita más grande (títulos)" },
  { marca: "~texto~", ejemplo: "~Cursiva~", nota: "Cursiva" },
  { marca: "{azul:texto}", ejemplo: "{azul:Texto azul}", nota: "Color (en negrita)" },
  { marca: "Enter", ejemplo: "", nota: "Salto de línea. Dos Enter seguidos dejan una línea en blanco." },
  { marca: "*{azul:texto}*", ejemplo: "*{azul:Negrita azul}*", nota: "Se pueden combinar (un nivel)" },
];

export default function GuiaFormatos({ abierta = false }) {
  return (
    <details className="mr-guia" open={abierta}>
      <summary>¿Cómo se escriben los formatos?</summary>

      <table>
        <tbody>
          {FILAS.map((f) => (
            <tr key={f.marca}>
              <td>
                <code>{f.marca}</code>
              </td>
              <td>{f.ejemplo ? <TextoFormato texto={f.ejemplo} /> : "—"}</td>
              <td>{f.nota}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ margin: "8px 0 0" }}>
        Colores disponibles:{" "}
        {Object.keys(COLORES_FORMATO).map((c, i, arr) => (
          <span key={c}>
            <TextoFormato texto={`{${c}:${c}}`} />
            {i < arr.length - 1 ? ", " : ""}
          </span>
        ))}
        .
      </p>

      <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
        Tip: seleccioná un texto y tocá los botones <b>N</b>, <b>G</b>, <i>C</i> o un
        color de la barra: las marcas se ponen solas.
      </p>
    </details>
  );
}
