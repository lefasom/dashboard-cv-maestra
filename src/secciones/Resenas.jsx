// src/secciones/Resenas.jsx  (Vite + React — Dashboard CV Master)
//
// Muestra las reseñas que los usuarios envían desde la app nativa.
// Se leen en tiempo real de la colección dashboard_reviews (Firestore).
//
// FILTRO POR PUNTUACIÓN: arriba de la lista hay un botón por cada
// puntuación (5★ a 1★) con la cantidad de reseñas que tiene, más "Todas".
// Tocar un número muestra SOLO las reseñas con esa puntuación exacta
// (por ejemplo 4★ muestra únicamente las de 4 estrellas). Volver a tocar el
// mismo botón, o "Todas", quita el filtro.
//
// FILTRO POR FECHA: debajo hay un selector de PERÍODO con
//   - Todas las fechas
//   - Rápidos: Hoy, Últimos 7 días, Últimos 30 días, Este mes
//   - Por mes: un item por cada mes que tiene reseñas (con su cantidad)
// y un selector de ORDEN (más recientes primero / más antiguas primero).
// Los filtros se combinan: por ejemplo "octubre de 2026" + 5★. Los
// contadores de cada puntuación se calculan dentro del período elegido.
// El botón "Limpiar filtros" vuelve a mostrar todo.
//
// El promedio de arriba siempre se calcula con todas las reseñas, no con
// las filtradas.
//
// IR AL CHAT: cada reseña muestra el ID del chat del usuario que la dejó
// (los últimos 6 caracteres, igual que en la pestaña Chat). Si se pasa la
// prop onIrAlChat, ese ID es un botón: al tocarlo se llama
// onIrAlChat(chatId) y el padre cambia a la pestaña Chat y abre ese chat
// (ver la prop chatIdAbrir en Chat.jsx). Sin la prop, el ID es solo texto.
//
// Las reglas de Firestore piden estar autenticado para leer, así que esta
// sección tiene que mostrarse cuando ya hay sesión iniciada en el dashboard.

import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { COLECCIONES, LIMITE_RESENAS } from "../config";
import { db } from "../firebase";

// ------------------------------------------------------------
// ESTILOS DE LOS FILTROS DE FECHA Y DEL ID DE CHAT
// (van en este mismo archivo)
// ------------------------------------------------------------

const ESTILOS = `
.resenas-fecha-filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  margin: 8px 0 12px;
}

.resenas-fecha-filtros label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  opacity: 0.9;
}

.resenas-fecha-filtros select {
  max-width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--borde);
  border-radius: 10px;
  background: var(--superficie-alt);
  color: var(--texto);
  font-size: 13px;
  font-weight: 600;
}

.resenas-limpiar {
  padding: 6px 12px;
  border: 1px solid var(--borde);
  border-radius: 999px;
  background: transparent;
  color: var(--texto);
  font-size: 12px;
  font-weight: 800;
}

.resena-chat {
  align-self: flex-start;
  margin-top: 8px;
  padding: 4px 12px;
  border: 1px solid var(--borde);
  border-radius: 999px;
  background: var(--superficie-alt);
  color: var(--texto);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.resena-id {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.6;
}
`;

const PUNTUACIONES = [5, 4, 3, 2, 1];

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Períodos rápidos del selector
const PERIODOS_RAPIDOS = [
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "7d", etiqueta: "Últimos 7 días" },
  { valor: "30d", etiqueta: "Últimos 30 días" },
  { valor: "mes-actual", etiqueta: "Este mes" },
];

const dosDigitos = (n) => String(n).padStart(2, "0");

const formatearFecha = (fecha) =>
  `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(
    fecha.getDate()
  )}`;

const formatearHora = (fecha) =>
  `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;

// "2026-10" para una fecha en ms (hora local)
const claveMes = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}`;
};

// "2026-10" -> "octubre de 2026"
const etiquetaMes = (clave) => {
  const [anio, mes] = clave.split("-");
  return `${MESES[Number(mes) - 1]} de ${anio}`;
};

// Medianoche (hora local) de hace N días
const inicioHaceDias = (dias) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - dias);
  return d.getTime();
};

// ¿La fecha (ms) entra en el período elegido?
// periodo: "todas" | "hoy" | "7d" | "30d" | "mes-actual" | "mes:AAAA-MM"
const coincideConPeriodo = (ms, periodo) => {
  if (periodo === "todas") return true;
  if (periodo === "hoy") return ms >= inicioHaceDias(0);
  if (periodo === "7d") return ms >= inicioHaceDias(6);
  if (periodo === "30d") return ms >= inicioHaceDias(29);
  if (periodo === "mes-actual") return claveMes(ms) === claveMes(Date.now());
  if (periodo.startsWith("mes:")) return claveMes(ms) === periodo.slice(4);
  return true;
};

const Estrellas = ({ n }) => (
  <span className="estrellas" aria-label={`${n} estrellas`}>
    {"★".repeat(n)}
    <span className="estrellas-vacias">{"★".repeat(5 - n)}</span>
  </span>
);

export default function Resenas({ onIrAlChat }) {
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // null = todas | 1 a 5 = solo esa puntuación
  const [filtro, setFiltro] = useState(null);

  // Período de fechas y orden de la lista
  const [periodo, setPeriodo] = useState("todas");
  const [orden, setOrden] = useState("nuevas"); // "nuevas" | "viejas"

  useEffect(() => {
    const consulta = query(
      collection(db, COLECCIONES.RESENAS),
      orderBy("createdAt", "desc"),
      limit(LIMITE_RESENAS)
    );

    const desuscribir = onSnapshot(
      consulta,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => {
          const d = doc.data();

          // createdAt puede ser null un instante si el servidor todavía no
          // confirmó el timestamp
          const fecha = d.createdAt?.toDate ? d.createdAt.toDate() : null;

          return {
            id: doc.id,
            chatId: typeof d.chatId === "string" ? d.chatId : "",
            usuario: d.nombre ?? "Anónimo",
            estrellas: Math.min(5, Math.max(0, Math.round(Number(d.estrellas)) || 0)),
            // Para filtrar y ordenar. Si el timestamp todavía no llegó, la
            // reseña es de recién: se toma como "ahora".
            ms: fecha ? fecha.getTime() : Date.now(),
            fecha: fecha ? formatearFecha(fecha) : "—",
            hora: fecha ? formatearHora(fecha) : "",
            texto: d.texto ?? "",
          };
        });

        setResenas(lista);
        setError(null);
        setCargando(false);
      },
      (err) => {
        console.error("[reseñas] Error leyendo Firestore:", err);

        setError(
          err?.code === "permission-denied"
            ? "No tenés permiso para ver las reseñas. Iniciá sesión e intentá de nuevo."
            : "No se pudieron cargar las reseñas."
        );
        setCargando(false);
      }
    );

    return desuscribir;
  }, []);

  // El promedio usa todas las reseñas, aunque haya filtros activos
  const promedio = useMemo(() => {
    if (resenas.length === 0) return null;

    const suma = resenas.reduce((total, r) => total + r.estrellas, 0);
    return (suma / resenas.length).toFixed(1);
  }, [resenas]);

  // Meses que tienen reseñas, del más nuevo al más viejo:
  // [{ clave: "2026-10", etiqueta: "octubre de 2026", cantidad: 3 }, …]
  const meses = useMemo(() => {
    const mapa = {};

    resenas.forEach((r) => {
      const clave = claveMes(r.ms);
      mapa[clave] = (mapa[clave] ?? 0) + 1;
    });

    return Object.keys(mapa)
      .sort()
      .reverse()
      .map((clave) => ({
        clave,
        etiqueta: etiquetaMes(clave),
        cantidad: mapa[clave],
      }));
  }, [resenas]);

  // Reseñas dentro del período elegido (todavía sin filtrar por estrellas)
  const porPeriodo = useMemo(
    () => resenas.filter((r) => coincideConPeriodo(r.ms, periodo)),
    [resenas, periodo]
  );

  // Cuántas reseñas tiene cada puntuación dentro del período: { 5: 3, 4: 1, … }
  const cantidades = useMemo(() => {
    const mapa = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    porPeriodo.forEach((r) => {
      if (r.estrellas in mapa) mapa[r.estrellas] += 1;
    });

    return mapa;
  }, [porPeriodo]);

  // Reseñas que se muestran: período + puntuación, ordenadas por fecha
  const visibles = useMemo(() => {
    const base = filtro
      ? porPeriodo.filter((r) => r.estrellas === filtro)
      : porPeriodo;

    return [...base].sort((a, b) =>
      orden === "viejas" ? a.ms - b.ms : b.ms - a.ms
    );
  }, [porPeriodo, filtro, orden]);

  const hayFiltros = filtro !== null || periodo !== "todas";

  // Tocar el filtro activo lo quita
  const alternarFiltro = (puntuacion) =>
    setFiltro((actual) => (actual === puntuacion ? null : puntuacion));

  const limpiarFiltros = () => {
    setFiltro(null);
    setPeriodo("todas");
  };

  return (
    <section className="panel">
      <style>{ESTILOS}</style>

      <div className="panel-head">
        <h2>
          Reseñas{" "}
          <span className="contador">
            {hayFiltros ? `${visibles.length} de ${resenas.length}` : resenas.length}
          </span>
        </h2>

        {promedio !== null && (
          <div className="promedio">
            <strong>{promedio}</strong>
            <Estrellas n={Math.round(promedio)} />
          </div>
        )}
      </div>

      {/* ---------------- FILTRO POR PUNTUACIÓN ---------------- */}
      {!cargando && !error && resenas.length > 0 && (
        <div className="valoracion-filtros" role="group" aria-label="Filtrar por puntuación">
          <button
            type="button"
            className={`chip-filtro${filtro === null ? " activo" : ""}`}
            onClick={() => setFiltro(null)}
            aria-pressed={filtro === null}
          >
            Todas ({porPeriodo.length})
          </button>

          {PUNTUACIONES.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip-filtro${filtro === p ? " activo" : ""}`}
              onClick={() => alternarFiltro(p)}
              aria-pressed={filtro === p}
              aria-label={`${p} estrellas, ${cantidades[p]} reseñas`}
            >
              {p} ★ ({cantidades[p]})
            </button>
          ))}
        </div>
      )}

      {/* ---------------- FILTRO POR FECHA Y ORDEN ---------------- */}
      {!cargando && !error && resenas.length > 0 && (
        <div className="resenas-fecha-filtros">
          <label>
            Período
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              aria-label="Filtrar por período"
            >
              <option value="todas">Todas las fechas</option>

              <optgroup label="Rápidos">
                {PERIODOS_RAPIDOS.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Por mes">
                {meses.map((m) => (
                  <option key={m.clave} value={`mes:${m.clave}`}>
                    {m.etiqueta} ({m.cantidad})
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <label>
            Orden
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              aria-label="Ordenar por fecha"
            >
              <option value="nuevas">Más recientes primero</option>
              <option value="viejas">Más antiguas primero</option>
            </select>
          </label>

          {hayFiltros && (
            <button
              type="button"
              className="resenas-limpiar"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      <div className="scroll" style={{ maxHeight: "60vh" }}>
        {cargando && (
          <p style={{ padding: "1rem", opacity: 0.7 }}>Cargando reseñas…</p>
        )}

        {!cargando && error && (
          <p style={{ padding: "1rem", color: "#dc2626" }}>{error}</p>
        )}

        {!cargando && !error && resenas.length === 0 && (
          <p style={{ padding: "1rem", opacity: 0.7 }}>
            Todavía no hay reseñas.
          </p>
        )}

        {!cargando && !error && resenas.length > 0 && visibles.length === 0 && (
          <p style={{ padding: "1rem", opacity: 0.7 }}>
            No hay reseñas con estos filtros.
          </p>
        )}

        {visibles.map((r) => (
          <article className="resena" key={r.id}>
            <div className="resena-cab">
              <strong>{r.usuario}</strong>
              <span className="resena-fecha">
                {r.fecha} · {r.hora}
              </span>
            </div>

            <Estrellas n={r.estrellas} />
            {r.texto && <p>{r.texto}</p>}

            {/* ID del chat del usuario: abre su chat */}
            {r.chatId &&
              (onIrAlChat ? (
                <button
                  type="button"
                  className="resena-chat"
                  onClick={() => onIrAlChat(r.chatId)}
                  title="Abrir el chat de este usuario"
                >
                  💬 Ir al chat · ID …{r.chatId.slice(-6)}
                </button>
              ) : (
                <span className="resena-id">ID …{r.chatId.slice(-6)}</span>
              ))}
          </article>
        ))}
      </div>
    </section>
  );
}