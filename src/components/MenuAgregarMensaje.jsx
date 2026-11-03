// src/components/MenuAgregarMensaje.jsx
//
// Botón que abre un menú con los tipos de mensaje (texto, tarjeta, video,
// encuestas) y "Mis mensajes guardados". Se usa en dos lugares del Chat:
//   - Arriba (variante "boton"): "＋ Agregar mensaje" para enviar a todos o
//     a varios chats.
//   - Junto al botón de enviar (variante "mas"): el "＋" para mandarle algo
//     solo a ese chat.
//
// onElegir({ modo }) o onElegir({ guardados: true })

import { useState } from "react";

import { MODOS_MENSAJE } from "../config";
import "../estilos-mensajes.css";

export default function MenuAgregarMensaje({
  variante = "boton",
  onElegir,
  disabled = false,
}) {
  const [abierto, setAbierto] = useState(false);

  const elegir = (dato) => {
    setAbierto(false);
    onElegir?.(dato);
  };

  return (
    <span className="mr-menu-wrap">
      {variante === "mas" ? (
        <button
          type="button"
          className="mr-mas"
          onClick={() => setAbierto((v) => !v)}
          disabled={disabled}
          aria-label="Agregar mensaje personalizado"
          aria-haspopup="menu"
          aria-expanded={abierto}
          title="Video, encuesta, tarjeta…"
        >
          ＋
        </button>
      ) : (
        <button
          type="button"
          className="mr-btn mr-btn-principal"
          onClick={() => setAbierto((v) => !v)}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={abierto}
        >
          ＋ Agregar mensaje
        </button>
      )}

      {abierto && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 44 }}
            onClick={() => setAbierto(false)}
            role="presentation"
          />

          <div
            className={`mr-menu ${variante === "mas" ? "arriba" : "abajo"}`}
            role="menu"
          >
            {MODOS_MENSAJE.map((m) => (
              <button
                key={m.id}
                type="button"
                role="menuitem"
                onClick={() => elegir({ modo: m.id })}
              >
                {m.icono} {m.etiqueta}
              </button>
            ))}

            <hr />

            <button
              type="button"
              role="menuitem"
              onClick={() => elegir({ guardados: true })}
            >
              📁 Mis mensajes guardados
            </button>
          </div>
        </>
      )}
    </span>
  );
}
