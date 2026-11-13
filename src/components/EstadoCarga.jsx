// src/components/EstadoCarga.jsx
import { LIMITE_EVENTOS } from "../config";

// total: cantidad real en el servidor (useColeccion la pide solo al llegar al tope)
export default function EstadoCarga({ cargando, error, cantidad, total = null }) {
  const formato = (n) => n.toLocaleString("es-AR");

  return (
    <>
      {cargando && <p className="estado-carga">Cargando…</p>}

      {error && <p className="error">Error: {error}</p>}

      {cantidad >= LIMITE_EVENTOS && (
        <p className="aviso">
          {total !== null && total > cantidad
            ? `Hay ${formato(total)} eventos en total. Las tablas muestran los ${formato(cantidad)} más recientes.`
            : `Se alcanzó el límite de ${formato(LIMITE_EVENTOS)} eventos: los conteos pueden estar incompletos.`}
        </p>
      )}
    </>
  );
}
