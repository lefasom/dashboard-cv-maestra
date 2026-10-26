// src/secciones/Versiones.jsx
//
// Control de versiones de la app.
//
//   dashboard_config/versiones            la lee la app (bloqueo por fecha).
//       { versiones: [{ version, lanzamiento, vencimiento }], actualizadoEn }
//       Las versiones vencidas SE QUEDAN acá: si se sacaran, la app vieja
//       no encontraría su vencimiento y dejaría de bloquearse.
//
//   dashboard_config/versiones_historial  solo lo usa el dashboard.
//       { registros: { v_1_0_0: { version, lanzamiento, vencimiento,
//                                  archivadoEn } }, actualizadoEn }
//       Al abrir esta pestaña, las versiones vencidas que todavía no están
//       acá se archivan solas.
//
// Acciones por fila:
//   Editar    carga la fila en el formulario (la versión no se puede
//             cambiar; si te equivocaste de número, eliminá y creá de nuevo).
//   Eliminar  pide confirmación. Quita la versión de `versiones` y su
//             registro de `versiones_historial`. OJO: la app instalada con
//             esa versión deja de tener vencimiento y NO se bloquea.
//             Si solo te equivocaste en una fecha, usá Editar.
//
// Fechas en formato AAAA-MM-DD (el mismo que lee la app).

import {
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";

import { db } from "../firebase";

const REF_VERSIONES = doc(db, "dashboard_config", "versiones");
const REF_HISTORIAL = doc(db, "dashboard_config", "versiones_historial");

const DIA = 24 * 60 * 60 * 1000;
const MAX_VERSIONES = 200;

// ------------------------------------------------------------
// FECHAS
// ------------------------------------------------------------

const dos = (n) => String(n).padStart(2, "0");

const hoyTexto = () => {
  const d = new Date();
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
};

const fechaValida = (texto) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;

  const [a, m, d] = texto.split("-").map(Number);
  const f = new Date(a, m - 1, d);

  return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d;
};

// Días que faltan para el vencimiento (<= 0 significa vencida: igual que
// la app, que bloquea desde el mismo día del vencimiento)
const diasHasta = (texto) => {
  const [a, m, d] = texto.split("-").map(Number);
  const vence = new Date(a, m - 1, d);
  const hoy = new Date();

  hoy.setHours(0, 0, 0, 0);

  return Math.round((vence.getTime() - hoy.getTime()) / DIA);
};

const estadoDe = (vencimiento) => {
  const dias = diasHasta(vencimiento);

  if (dias <= 0) return { texto: "Vencida", clase: "vencida" };

  if (dias <= 60) {
    return {
      texto: dias === 1 ? "Vence en 1 día" : `Vence en ${dias} días`,
      clase: "por-vencer",
    };
  }

  return { texto: "Vigente", clase: "vigente" };
};

// ------------------------------------------------------------
// DATOS
// ------------------------------------------------------------

// Clave del mapa del historial: "1.3.0" -> "v_1_3_0"
const claveDe = (version) => `v_${version.replace(/\./g, "_")}`;

const entradaValida = (v) =>
  v &&
  typeof v.version === "string" &&
  typeof v.lanzamiento === "string" &&
  typeof v.vencimiento === "string" &&
  fechaValida(v.vencimiento);

const porVersion = (a, b) =>
  a.version.localeCompare(b.version, undefined, { numeric: true });

const FORM_VACIO = { version: "", lanzamiento: "", vencimiento: "" };

// ------------------------------------------------------------
// TABLA
// ------------------------------------------------------------

function TablaVersiones({
  filas,
  vacio,
  editando,
  confirmando,
  borrando,
  onEditar,
  onPedirEliminar,
  onCancelar,
  onEliminar,
}) {
  const hayConfirmacion = filas.some((v) => v.version === confirmando);

  return (
    <div className="scroll" style={{ maxHeight: "50vh" }}>
      <table className="lista">
        <thead>
          <tr>
            <th className="left">Versión</th>
            <th className="left">Lanzamiento</th>
            <th className="left">Vencimiento</th>
            <th className="left">Estado</th>
            <th className="right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filas.map((v) => {
            const estado = estadoDe(v.vencimiento);
            const pidiendo = confirmando === v.version;
            const ocupada = borrando === v.version;

            return (
              <tr key={v.version}>
                <td className="left">{v.version}</td>
                <td className="left">{v.lanzamiento}</td>
                <td className="left">{v.vencimiento}</td>
                <td className="left">
                  <span className={`etiqueta ${estado.clase}`}>
                    {estado.texto}
                  </span>
                </td>
                <td className="right">
                  <div className="fila-acciones">
                    {pidiendo ? (
                      <>
                        <span className="confirmar-texto">¿Eliminar?</span>

                        <button
                          type="button"
                          className="btn-eliminar"
                          disabled={ocupada}
                          onClick={() => onEliminar(v.version)}
                        >
                          {ocupada ? "Eliminando…" : "Sí, eliminar"}
                        </button>

                        <button
                          type="button"
                          className="btn-claro"
                          disabled={ocupada}
                          onClick={onCancelar}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-claro"
                          disabled={borrando !== null}
                          onClick={() => onEditar(v)}
                        >
                          {editando === v.version ? "Editando…" : "Editar"}
                        </button>

                        <button
                          type="button"
                          className="btn-eliminar"
                          disabled={borrando !== null}
                          onClick={() => onPedirEliminar(v.version)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filas.length === 0 && <p className="vacio">{vacio}</p>}

      {hayConfirmacion && (
        <p className="peligro-aviso" style={{ margin: "12px 18px" }}>
          Si la eliminás, la app instalada con esa versión deja de tener fecha
          de vencimiento y <strong>no se bloquea</strong>. Si solo te
          equivocaste en una fecha, usá Editar.
        </p>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// SECCIÓN
// ------------------------------------------------------------

export default function Versiones() {
  const [lista, setLista] = useState(null); // null = todavía cargando
  const [registros, setRegistros] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState(FORM_VACIO);
  const [editando, setEditando] = useState(null); // versión que se edita
  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(null); // versión a eliminar
  const [borrando, setBorrando] = useState(null); // versión eliminándose
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "error", texto }

  const archivando = useRef(false);
  const formRef = useRef(null);

  const irAlFormulario = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Lectura en tiempo real de los dos documentos
  useEffect(() => {
    const dejarVersiones = onSnapshot(
      REF_VERSIONES,
      (snap) => {
        const datos = snap.exists() ? snap.data().versiones : [];
        setLista(Array.isArray(datos) ? datos.filter(entradaValida) : []);
      },
      (err) => setError(err.message)
    );

    const dejarHistorial = onSnapshot(
      REF_HISTORIAL,
      (snap) => {
        const datos = snap.exists() ? snap.data().registros : {};
        setRegistros(datos && typeof datos === "object" ? datos : {});
      },
      (err) => setError(err.message)
    );

    return () => {
      dejarVersiones();
      dejarHistorial();
    };
  }, []);

  // Archiva solas las versiones que ya vencieron
  useEffect(() => {
    if (!lista || !registros || archivando.current) return;

    const pendientes = lista.filter(
      (v) =>
        diasHasta(v.vencimiento) <= 0 &&
        registros[claveDe(v.version)]?.vencimiento !== v.vencimiento
    );

    if (pendientes.length === 0) return;

    archivando.current = true;

    const nuevos = Object.fromEntries(
      pendientes.map((v) => [
        claveDe(v.version),
        {
          version: v.version,
          lanzamiento: v.lanzamiento,
          vencimiento: v.vencimiento,
          archivadoEn: hoyTexto(),
        },
      ])
    );

    setDoc(
      REF_HISTORIAL,
      { registros: nuevos, actualizadoEn: serverTimestamp() },
      { merge: true }
    )
      .catch((err) => console.error("No se pudo archivar el historial:", err))
      .finally(() => {
        archivando.current = false;
      });
  }, [lista, registros]);

  // Vigentes arriba
  const vigentes = useMemo(
    () => (lista ?? []).filter((v) => diasHasta(v.vencimiento) > 0).sort(porVersion),
    [lista]
  );

  // Historial abajo: lo archivado + lo que ya venció y todavía no se archivó
  const historial = useMemo(() => {
    const mapa = new Map();

    Object.values(registros ?? {})
      .filter(entradaValida)
      .forEach((r) => mapa.set(r.version, r));

    (lista ?? []).forEach((v) => {
      if (diasHasta(v.vencimiento) <= 0) mapa.set(v.version, v);
      else mapa.delete(v.version); // se alargó el vencimiento: ya no es historial
    });

    return Array.from(mapa.values()).sort((a, b) => porVersion(b, a));
  }, [lista, registros]);

  const cambiar = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  // ---- Editar ------------------------------------------------

  const editar = (v) => {
    setConfirmando(null);
    setMensaje(null);
    setForm({
      version: v.version,
      lanzamiento: v.lanzamiento,
      vencimiento: v.vencimiento,
    });
    setEditando(v.version);
    irAlFormulario();
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setMensaje(null);
  };

  // ---- Crear / guardar cambios -------------------------------

  const guardar = async (e) => {
    e.preventDefault();
    setMensaje(null);

    const version = form.version.trim();
    const lanzamiento = form.lanzamiento.trim();
    const vencimiento = form.vencimiento.trim();

    const fallo = (texto) => setMensaje({ tipo: "error", texto });

    if (!/^\d+(\.\d+){1,3}$/.test(version)) {
      return fallo("La versión debe verse así: 1.4.0 (solo números y puntos).");
    }

    if (!fechaValida(lanzamiento)) {
      return fallo("La fecha de creación debe ser AAAA-MM-DD, por ejemplo 2026-11-01.");
    }

    if (!fechaValida(vencimiento)) {
      return fallo("La fecha de vencimiento debe ser AAAA-MM-DD, por ejemplo 2027-10-31.");
    }

    if (vencimiento <= lanzamiento) {
      return fallo("El vencimiento tiene que ser posterior a la fecha de creación.");
    }

    const resto = (lista ?? []).filter((v) => v.version !== version);
    const existia = resto.length !== (lista ?? []).length;

    if (resto.length + 1 > MAX_VERSIONES) {
      return fallo(`No se pueden guardar más de ${MAX_VERSIONES} versiones.`);
    }

    setGuardando(true);

    try {
      await setDoc(REF_VERSIONES, {
        versiones: [...resto, { version, lanzamiento, vencimiento }],
        actualizadoEn: serverTimestamp(),
      });

      // Si estaba en el historial y ahora vuelve a ser vigente, se saca de ahí
      if (registros?.[claveDe(version)] && diasHasta(vencimiento) > 0) {
        await updateDoc(REF_HISTORIAL, {
          [`registros.${claveDe(version)}`]: deleteField(),
          actualizadoEn: serverTimestamp(),
        });
      }

      setForm(FORM_VACIO);
      setEditando(null);
      setMensaje({
        tipo: "ok",
        texto: existia
          ? `Versión ${version} actualizada.`
          : `Versión ${version} creada.`,
      });
    } catch (err) {
      fallo(`No se pudo guardar: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // ---- Eliminar ----------------------------------------------

  const eliminar = async (version) => {
    setMensaje(null);
    setBorrando(version);

    try {
      const estaba = (lista ?? []).some((v) => v.version === version);

      if (estaba) {
        await setDoc(REF_VERSIONES, {
          versiones: (lista ?? []).filter((v) => v.version !== version),
          actualizadoEn: serverTimestamp(),
        });
      }

      if (registros?.[claveDe(version)]) {
        await updateDoc(REF_HISTORIAL, {
          [`registros.${claveDe(version)}`]: deleteField(),
          actualizadoEn: serverTimestamp(),
        });
      }

      if (editando === version) {
        setEditando(null);
        setForm(FORM_VACIO);
      }

      setConfirmando(null);
      setMensaje({ tipo: "ok", texto: `Versión ${version} eliminada.` });
    } catch (err) {
      setMensaje({ tipo: "error", texto: `No se pudo eliminar: ${err.message}` });
      irAlFormulario();
    } finally {
      setBorrando(null);
    }
  };

  const propsTabla = {
    editando,
    confirmando,
    borrando,
    onEditar: editar,
    onPedirEliminar: setConfirmando,
    onCancelar: () => setConfirmando(null),
    onEliminar: eliminar,
  };

  const cargando = !error && (lista === null || registros === null);

  return (
    <>
      <section className="panel" ref={formRef}>
        <div className="panel-head">
          <h2>{editando ? `Editar versión ${editando}` : "Nueva versión"}</h2>
        </div>

        <form className="form-version" onSubmit={guardar}>
          <label className="campo">
            <span>Versión</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 1.4.0"
              value={form.version}
              onChange={cambiar("version")}
              readOnly={editando !== null}
              autoComplete="off"
            />
          </label>

          <label className="campo">
            <span>Fecha de creación</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="AAAA-MM-DD  (ej: 2026-11-01)"
              value={form.lanzamiento}
              onChange={cambiar("lanzamiento")}
              autoComplete="off"
            />
          </label>

          <label className="campo">
            <span>Fecha de vencimiento</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="AAAA-MM-DD  (ej: 2027-10-31)"
              value={form.vencimiento}
              onChange={cambiar("vencimiento")}
              autoComplete="off"
            />
          </label>

          <div className="form-botones">
            <button type="submit" disabled={guardando}>
              {guardando
                ? "Guardando…"
                : editando
                  ? "Guardar cambios"
                  : "Crear"}
            </button>

            {editando && (
              <button
                type="button"
                className="btn-claro"
                disabled={guardando}
                onClick={cancelarEdicion}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <p className="form-nota">
          La versión tiene que ser igual a la de app.json. Si ya existe, se
          actualiza (así alargás su vencimiento). Para corregir una fecha, tocá
          Editar en la fila.
        </p>

        {mensaje && (
          <p className={`form-msg ${mensaje.tipo === "ok" ? "ok" : "error"}`}>
            {mensaje.texto}
          </p>
        )}
      </section>

      {error && <p className="error">Error: {error}</p>}
      {cargando && <p className="estado-carga">Cargando…</p>}

      {!cargando && !error && (
        <>
          <section className="panel">
            <div className="panel-head">
              <h2>
                Versiones <span className="contador">{vigentes.length}</span>
              </h2>
            </div>

            <TablaVersiones
              filas={vigentes}
              vacio="No hay versiones vigentes. Creá una arriba."
              {...propsTabla}
            />
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>
                Historial <span className="contador">{historial.length}</span>
              </h2>
            </div>

            <TablaVersiones
              filas={historial}
              vacio="Todavía no venció ninguna versión."
              {...propsTabla}
            />
          </section>
        </>
      )}
    </>
  );
}