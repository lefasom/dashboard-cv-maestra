// src/App.jsx
// Vite + React — Dashboard CV Master

import { useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "./firebase";

// ============================================================
// CONFIGURACIÓN
// ============================================================

const TIPO_DESCARGADA = "plantilla_descargada";
const TIPO_BIBLIOTECA = "plantilla_biblioteca";

const ULTIMA_PLANTILLA = 70;
const LIMITE_EVENTOS = 5000;

const CLAVE_COLUMNAS = "dash-cv-master:columnas";

// ============================================================
// NOMBRES BASE
// ============================================================

const NOMBRES_BASE = [
  "ATS",
  ...Array.from(
    { length: ULTIMA_PLANTILLA },
    (_, i) => `CV-${String(i + 1).padStart(2, "0")}`
  ),
];

// ============================================================
// COLUMNAS / PROPIEDADES
// ============================================================

const COLUMNAS = [
  {
    key: "nombre",
    label: "Nombre",
    descripcion: "Nombre de la plantilla (CV-57, ATS…)",
    align: "left",
    inicial: true,
    valor: (f) => f.nombre,
    render: (f) => f.nombre,
  },
  {
    key: "descargas",
    label: "Descargas",
    descripcion: "Veces que se descargó el PDF",
    align: "right",
    inicial: true,
    valor: (f) => f.descargas,
    render: (f) => f.descargas,
  },
  {
    key: "biblioteca",
    label: "Favoritos",
    descripcion: "Veces que se agregó a la colección",
    align: "right",
    inicial: false,
    valor: (f) => f.biblioteca,
    render: (f) => f.biblioteca,
  },
  {
    key: "total",
    label: "Total",
    descripcion: "Descargas + favoritos",
    align: "right",
    inicial: false,
    valor: (f) => f.descargas + f.biblioteca,
    render: (f) => f.descargas + f.biblioteca,
  },
  {
    key: "porcentaje",
    label: "% descargas",
    descripcion: "Parte del total de descargas",
    align: "right",
    inicial: false,
    valor: (f, t) =>
      t.descargas ? f.descargas / t.descargas : 0,
    render: (f, t) =>
      t.descargas
        ? `${((f.descargas / t.descargas) * 100).toFixed(1)}%`
        : "—",
  },
  {
    key: "ultima",
    label: "Última descarga",
    descripcion: "Fecha de la descarga más reciente",
    align: "left",
    inicial: false,
    valor: (f) => f.ultima ?? 0,
    render: (f) =>
      f.ultima ? new Date(f.ultima).toLocaleString() : "—",
  },
  {
    key: "android",
    label: "Android",
    descripcion: "Descargas desde Android",
    align: "right",
    inicial: false,
    valor: (f) => f.android,
    render: (f) => f.android,
  },
  {
    key: "ios",
    label: "iOS",
    descripcion: "Descargas desde iOS",
    align: "right",
    inicial: false,
    valor: (f) => f.ios,
    render: (f) => f.ios,
  },
  {
    key: "prueba",
    label: "Perfil prueba",
    descripcion: "Descargas hechas con el perfil de prueba",
    align: "right",
    inicial: false,
    valor: (f) => f.prueba,
    render: (f) => f.prueba,
  },
  {
    key: "familia",
    label: "Familia",
    descripcion: "Familia de la plantilla",
    align: "left",
    inicial: false,
    valor: (f) => f.familia,
    render: (f) => f.familia || "—",
  },
];

// ============================================================
// COLUMNAS INICIALES
// ============================================================

const columnasIniciales = () =>
  Object.fromEntries(
    COLUMNAS.map((c) => [c.key, c.inicial])
  );

const leerColumnasGuardadas = () => {
  try {
    const guardado = JSON.parse(
      localStorage.getItem(CLAVE_COLUMNAS) || "null"
    );

    if (guardado && typeof guardado === "object") {
      return {
        ...columnasIniciales(),
        ...guardado,
      };
    }
  } catch {
    // Se utilizan las columnas iniciales.
  }

  return columnasIniciales();
};

// ============================================================
// AGRUPAR EVENTOS
// ============================================================

const nuevaFila = (nombre) => ({
  nombre,
  descargas: 0,
  biblioteca: 0,
  android: 0,
  ios: 0,
  prueba: 0,
  ultima: null,
  familia: "",
});

const agruparEventos = (eventos) => {
  const mapa = new Map();

  const asegurar = (nombre) => {
    if (!mapa.has(nombre)) {
      mapa.set(nombre, nuevaFila(nombre));
    }

    return mapa.get(nombre);
  };

  NOMBRES_BASE.forEach(asegurar);

  eventos.forEach((e) => {
    const nombre =
      String(e.nombre ?? "sin-nombre").trim() || "sin-nombre";

    const fila = asegurar(nombre);

    if (!fila.familia && e.extra?.familia) {
      fila.familia = String(e.extra.familia);
    }

    if (e.tipo === TIPO_DESCARGADA) {
      fila.descargas += 1;

      if (e.plataforma === "android") {
        fila.android += 1;
      }

      if (e.plataforma === "ios") {
        fila.ios += 1;
      }

      if (e.extra?.perfilPrueba === true) {
        fila.prueba += 1;
      }

      const ms = e.createdAt?.toMillis?.();

      if (ms && (!fila.ultima || ms > fila.ultima)) {
        fila.ultima = ms;
      }
    } else if (e.tipo === TIPO_BIBLIOTECA) {
      fila.biblioteca += 1;
    }
  });

  return Array.from(mapa.values());
};

// ============================================================
// LOGIN
// ============================================================

function Login() {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const entrar = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        clave
      );
    } catch {
      setError("Email o contraseña incorrectos.");
    }
  };

  return (
    <form className="login" onSubmit={entrar}>
      <h1>Dash CV Master</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        required
      />

      <button type="submit">
        Entrar
      </button>

      {error && (
        <p className="error">
          {error}
        </p>
      )}
    </form>
  );
}

// ============================================================
// MODAL DE PROPIEDADES
// ============================================================

function ModalPropiedades({
  abierto,
  activas,
  onCambiar,
  onRestablecer,
  onCerrar,
}) {
  if (!abierto) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onCerrar();
        }
      }}
    >
      <div className="modal-propiedades">
        <div className="modal-header">
          <div>
            <h2>Propiedades</h2>
            <p>
              Elegí qué información querés mostrar en la tabla.
            </p>
          </div>

          <button
            type="button"
            className="modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="modal-contenido">
          <table className="props">
            <tbody>
              {COLUMNAS.map((c) => (
                <tr key={c.key}>
                  <td className="prop-check">
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(activas[c.key])}
                        onChange={(e) =>
                          onCambiar(
                            c.key,
                            e.target.checked
                          )
                        }
                      />

                      <span className="prop-nombre">
                        {c.label}
                      </span>
                    </label>
                  </td>

                  <td className="prop-desc">
                    {c.descripcion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secundario"
            onClick={onRestablecer}
          >
            Restablecer
          </button>

          <button
            type="button"
            onClick={onCerrar}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LISTA DE PLANTILLAS
// ============================================================

function ListaPlantillas({
  filas,
  totales,
  activas,
}) {
  const columnasVisibles = COLUMNAS.filter(
    (c) => activas[c.key]
  );

  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("todas");
  const [orden, setOrden] = useState({
    key: "descargas",
    dir: "desc",
  });

  const cambiarOrden = (key) => {
    setOrden((o) =>
      o.key === key
        ? {
            key,
            dir: o.dir === "desc" ? "asc" : "desc",
          }
        : {
            key,
            dir:
              key === "nombre" || key === "familia"
                ? "asc"
                : "desc",
          }
    );
  };

  const filasVisibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    let resultado = filas.filter((f) => {
      if (
        texto &&
        !f.nombre.toLowerCase().includes(texto)
      ) {
        return false;
      }

      if (
        vista === "descargadas" &&
        f.descargas === 0
      ) {
        return false;
      }

      if (
        vista === "favoritas" &&
        f.biblioteca === 0
      ) {
        return false;
      }

      if (
        vista === "sin-datos" &&
        (f.descargas > 0 ||
          f.biblioteca > 0)
      ) {
        return false;
      }

      return true;
    });

    const columna =
      COLUMNAS.find(
        (c) => c.key === orden.key
      ) ?? COLUMNAS[1];

    const signo =
      orden.dir === "asc" ? 1 : -1;

    resultado = [...resultado].sort((a, b) => {
      const va = columna.valor(a, totales);
      const vb = columna.valor(b, totales);

      if (
        typeof va === "string" ||
        typeof vb === "string"
      ) {
        return (
          String(va).localeCompare(
            String(vb),
            undefined,
            { numeric: true }
          ) * signo
        );
      }

      if (va !== vb) {
        return (va - vb) * signo;
      }

      return a.nombre.localeCompare(
        b.nombre,
        undefined,
        { numeric: true }
      );
    });

    return resultado;
  }, [
    filas,
    totales,
    busqueda,
    vista,
    orden,
  ]);

  return (
    <section className="panel panel-tabla">
      <div className="panel-head">
        <h2>Plantillas</h2>

        <span className="contador">
          {filasVisibles.length}
        </span>
      </div>

      <div className="filtros">
        <input
          type="search"
          placeholder="Filtrar por nombre (ej. CV-57)"
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />

        <select
          value={vista}
          onChange={(e) =>
            setVista(e.target.value)
          }
        >
          <option value="todas">
            Todas
          </option>

          <option value="descargadas">
            Con descargas
          </option>

          <option value="favoritas">
            Con favoritos
          </option>

          <option value="sin-datos">
            Sin actividad
          </option>
        </select>
      </div>

      {columnasVisibles.length === 0 ? (
        <p className="vacio">
          Activá al menos una propiedad.
        </p>
      ) : (
        <div className="scroll">
          <table className="lista">
            <thead>
              <tr>
                {columnasVisibles.map((c) => (
                  <th
                    key={c.key}
                    className={`${c.align} ordenable`}
                    onClick={() =>
                      cambiarOrden(c.key)
                    }
                    title="Ordenar"
                  >
                    {c.label}

                    {orden.key === c.key && (
                      <span className="flecha">
                        {orden.dir === "desc"
                          ? " ▼"
                          : " ▲"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filasVisibles.map((f) => (
                <tr key={f.nombre}>
                  {columnasVisibles.map((c) => (
                    <td
                      key={c.key}
                      className={c.align}
                    >
                      {c.render(
                        f,
                        totales
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {filasVisibles.length === 0 && (
            <p className="vacio">
              No hay plantillas con ese filtro.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// ============================================================
// DASHBOARD
// ============================================================

function Dashboard({ usuario }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [activas, setActivas] = useState(
    leerColumnasGuardadas
  );

  const [
    modalPropiedades,
    setModalPropiedades,
  ] = useState(false);

  // ----------------------------------------------------------
  // FIRESTORE
  // ----------------------------------------------------------

  useEffect(() => {
    const consulta = query(
      collection(db, "dashboard_events"),
      orderBy("createdAt", "desc"),
      limit(LIMITE_EVENTOS)
    );

    const desuscribir = onSnapshot(
      consulta,
      (snap) => {
        setEventos(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );

        setCargando(false);
      },
      (err) => {
        setError(err.message);
        setCargando(false);
      }
    );

    return desuscribir;
  }, []);

  // ----------------------------------------------------------
  // GUARDAR PROPIEDADES
  // ----------------------------------------------------------

  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE_COLUMNAS,
        JSON.stringify(activas)
      );
    } catch {
      // Sin almacenamiento: no pasa nada.
    }
  }, [activas]);

  // ----------------------------------------------------------
  // DATOS
  // ----------------------------------------------------------

  const filas = useMemo(
    () => agruparEventos(eventos),
    [eventos]
  );

  const totales = useMemo(
    () => ({
      descargas: filas.reduce(
        (suma, f) =>
          suma + f.descargas,
        0
      ),

      biblioteca: filas.reduce(
        (suma, f) =>
          suma + f.biblioteca,
        0
      ),

      conDescargas:
        filas.filter(
          (f) => f.descargas > 0
        ).length,
    }),
    [filas]
  );

  const cambiarColumna = (
    key,
    valor
  ) => {
    setActivas((previas) => ({
      ...previas,
      [key]: valor,
    }));
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="contenedor">
      <header>
        <div className="titulo-header">
          <h1>Dash CV Master</h1>
          <span className="estado">
            Dashboard
          </span>
        </div>

        <div className="acciones-header">
          <button
            type="button"
            className="btn-propiedades"
            onClick={() =>
              setModalPropiedades(true)
            }
          >
            <span className="icono-propiedades">
              ⚙
            </span>

            Propiedades
          </button>

          <span className="usuario">
            {usuario.email}
          </span>

          <button
            type="button"
            onClick={() =>
              signOut(auth)
            }
          >
            Salir
          </button>
        </div>
      </header>

      {cargando && (
        <p className="estado-carga">
          Cargando…
        </p>
      )}

      {error && (
        <p className="error">
          Error: {error}
        </p>
      )}

      {eventos.length >=
        LIMITE_EVENTOS && (
        <p className="aviso">
          Se alcanzó el límite de{" "}
          {LIMITE_EVENTOS} eventos: los
          conteos pueden estar incompletos.
        </p>
      )}

      <div className="resumen">
        <div className="card">
          <span>Descargas</span>
          <strong>
            {totales.descargas}
          </strong>
        </div>

        <div className="card">
          <span>Favoritos</span>
          <strong>
            {totales.biblioteca}
          </strong>
        </div>

        <div className="card">
          <span>
            Plantillas descargadas
          </span>

          <strong>
            {totales.conDescargas}
          </strong>
        </div>
      </div>

      <ListaPlantillas
        filas={filas}
        totales={totales}
        activas={activas}
      />

      <ModalPropiedades
        abierto={modalPropiedades}
        activas={activas}
        onCambiar={cambiarColumna}
        onRestablecer={() =>
          setActivas(
            columnasIniciales()
          )
        }
        onCerrar={() =>
          setModalPropiedades(false)
        }
      />
    </div>
  );
}

// ============================================================
// APP
// ============================================================

export default function App() {
  const [usuario, setUsuario] =
    useState(undefined);

  useEffect(
    () =>
      onAuthStateChanged(
        auth,
        (u) => setUsuario(u)
      ),
    []
  );

  return (
    <>
      <style>
        {estilos}
      </style>

      {usuario === undefined ? (
        <p className="cargando-app">
          Cargando…
        </p>
      ) : usuario ? (
        <Dashboard
          usuario={usuario}
        />
      ) : (
        <Login />
      )}
    </>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const estilos = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #f3f6fa;
    color: #1f2937;
    font-family: Inter, system-ui, sans-serif;
    font-size: 13px;
  }

  h1 {
    margin: 0;
    font-size: 20px;
  }

  h2 {
    margin: 0;
    font-size: 14px;
  }

  button {
    background: #2bb3a8;
    color: #ffffff;
    border: 0;
    padding: 7px 12px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
  }

  button:hover {
    filter: brightness(0.96);
  }

  input[type="email"],
  input[type="password"],
  input[type="search"],
  select {
    padding: 7px 10px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #1f2937;
    font-size: 13px;
  }

  input:focus,
  select:focus {
    outline: 2px solid rgba(43, 179, 168, 0.18);
    border-color: #2bb3a8;
  }

  .contenedor {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 18px;
  }

  /* ========================================================
     HEADER
     ======================================================== */

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
  }

  .titulo-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .estado {
    background: #e0f5f3;
    color: #0f766e;
    border-radius: 999px;
    padding: 3px 9px;
    font-size: 10px;
    font-weight: 800;
  }

  .acciones-header {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .usuario {
    color: #64748b;
    font-size: 12px;
  }

  .btn-propiedades {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #ffffff;
    color: #334155;
    border: 1px solid #cbd5e1;
  }

  .btn-propiedades:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }

  .icono-propiedades {
    font-size: 13px;
  }

  /* ========================================================
     RESUMEN
     ======================================================== */

  .resumen {
    display: grid;
    grid-template-columns:
      repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }

  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #2bb3a8;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .card span {
    color: #64748b;
    font-size: 12px;
  }

  .card strong {
    font-size: 24px;
    line-height: 1.1;
  }

  /* ========================================================
     TABLA
     ======================================================== */

  .panel {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
  }

  .panel-tabla {
    width: 100%;
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .contador {
    background: #e0f5f3;
    color: #0f766e;
    font-weight: 800;
    padding: 1px 10px;
    border-radius: 999px;
    font-size: 12px;
  }

  .filtros {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .filtros input {
    flex: 1;
    min-width: 0;
  }

  .scroll {
    overflow: auto;
    max-height: 560px;
    border: 1px solid #eef2f6;
    border-radius: 6px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  table.lista th,
  table.lista td {
    padding: 5px 10px;
    border-bottom: 1px solid #eef2f6;
    white-space: nowrap;
  }

  table.lista th {
    position: sticky;
    top: 0;
    background: #f8fafc;
    color: #475569;
    font-size: 12px;
    z-index: 1;
  }

  table.lista tbody tr:hover {
    background: #f1f9f8;
  }

  th.ordenable {
    cursor: pointer;
    user-select: none;
  }

  th.ordenable:hover {
    color: #0f766e;
  }

  .flecha {
    color: #2bb3a8;
  }

  .left {
    text-align: left;
  }

  .right {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* ========================================================
     MODAL
     ======================================================== */

  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    background: rgba(15, 23, 42, 0.42);

    backdrop-filter: blur(2px);
  }

  .modal-propiedades {
    width: min(620px, 100%);
    max-height: min(720px, 90vh);

    display: flex;
    flex-direction: column;

    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;

    box-shadow:
      0 20px 50px rgba(15, 23, 42, 0.18);

    overflow: hidden;

    animation: modalEntrada 0.16s ease-out;
  }

  @keyframes modalEntrada {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.99);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;

    padding: 18px 20px 14px;

    border-bottom: 1px solid #eef2f6;
  }

  .modal-header h2 {
    font-size: 17px;
    color: #1e293b;
  }

  .modal-header p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 12px;
  }

  .modal-cerrar {
    width: 30px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    background: #f1f5f9;
    color: #64748b;

    border-radius: 50%;

    font-size: 20px;
    line-height: 1;
  }

  .modal-cerrar:hover {
    background: #e2e8f0;
    color: #334155;
  }

  .modal-contenido {
    padding: 14px 20px;
    overflow-y: auto;
  }

  .props {
    width: 100%;
    max-width: 540px;
    margin: 0 auto;
    border-collapse: collapse;
  }

  .props td {
    padding: 9px 6px;
    border-bottom: 1px solid #eef2f6;
    vertical-align: middle;
  }

  .props tr:last-child td {
    border-bottom: 0;
  }

  .prop-check {
    width: 45%;
  }

  .props label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .props input[type="checkbox"] {
    width: 15px;
    height: 15px;
    margin: 0;
    accent-color: #2bb3a8;
    cursor: pointer;
  }

  .prop-nombre {
    font-weight: 650;
    color: #334155;
  }

  .prop-desc {
    color: #94a3b8;
    font-size: 11px;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;

    padding: 12px 20px;

    border-top: 1px solid #eef2f6;

    background: #fafbfc;
  }

  .btn-secundario {
    background: transparent;
    color: #2563eb;
    border: 1px solid transparent;
  }

  .btn-secundario:hover {
    background: #eff6ff;
  }

  /* ========================================================
     ESTADOS
     ======================================================== */

  .vacio {
    color: #94a3b8;
    padding: 8px 10px;
    margin: 0;
  }

  .error {
    color: #dc2626;
  }

  .aviso {
    background: #fef9c3;
    border: 1px solid #fde68a;
    color: #854d0e;
    padding: 6px 10px;
    border-radius: 6px;
  }

  .estado-carga {
    color: #64748b;
  }

  .cargando-app {
    padding: 24px;
  }

  /* ========================================================
     LOGIN
     ======================================================== */

  .login {
    width: min(320px, calc(100% - 32px));

    margin: 15vh auto;

    display: flex;
    flex-direction: column;
    gap: 10px;

    padding: 24px;

    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;

    box-shadow:
      0 10px 30px rgba(15, 23, 42, 0.06);
  }

  .login h1 {
    margin-bottom: 6px;
  }

  /* ========================================================
     RESPONSIVE
     ======================================================== */

  @media (max-width: 700px) {
    .contenedor {
      padding: 12px;
    }

    header {
      align-items: flex-start;
      flex-direction: column;
    }

    .acciones-header {
      width: 100%;
      flex-wrap: wrap;
    }

    .usuario {
      flex: 1;
      min-width: 150px;
    }

    .filtros {
      flex-direction: column;
    }

    .modal-overlay {
      padding: 12px;
    }

    .modal-propiedades {
      max-height: 92vh;
    }

    .modal-header {
      padding: 15px;
    }

    .modal-contenido {
      padding: 10px 15px;
    }

    .modal-footer {
      padding: 10px 15px;
    }

    .prop-check {
      width: 42%;
    }
  }
`;