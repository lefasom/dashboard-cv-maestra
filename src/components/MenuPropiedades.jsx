// src/components/MenuPropiedades.jsx
import { useState } from "react";

export default function MenuPropiedades({
  columnas,
  activas,
  onCambiar,
  onRestablecer,
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="menu-props">
      <button
        type="button"
        className="btn-claro"
        onClick={() => setAbierto((a) => !a)}
      >
        ⚙ Propiedades
      </button>

      {abierto && (
        <>
          <div
            className="menu-fondo"
            onClick={() => setAbierto(false)}
          />

          <div className="menu-lista">
            {columnas.map((c) => (
              <label key={c.key}>
                <input
                  type="checkbox"
                  checked={Boolean(activas[c.key])}
                  onChange={(e) => onCambiar(c.key, e.target.checked)}
                />
                {c.label}
              </label>
            ))}

            <button
              type="button"
              className="btn-link"
              onClick={onRestablecer}
            >
              Restablecer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
