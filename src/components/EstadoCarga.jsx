// src/components/EstadoCarga.jsx
import { LIMITE_EVENTOS } from "../config";

export default function EstadoCarga({ cargando, error, cantidad }) {
  return (
    <>
      {cargando && <p className="estado-carga">Cargando…</p>}

      {error && <p className="error">Error: {error}</p>}

      {cantidad >= LIMITE_EVENTOS && (
        <p className="aviso">
          Se alcanzó el límite de {LIMITE_EVENTOS} eventos: los conteos
          pueden estar incompletos.
        </p>
      )}
    </>
  );
}
