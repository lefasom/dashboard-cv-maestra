// src/secciones/Modos.jsx  (Vite + React — Dashboard CV Master)
//
// GESTOR DE MODOS FIREBASE (App-de-cv: Tarea 43, tarea 3 · Tarea 42 §0).
//
// Interruptores de ahorro y de emergencia de la app. Todos viven en UN
// documento:  dashboard_config/app
//
//   metricasActivas   métricas de uso y eventos
//   chatActivo        enviar mensajes al chat de Ayuda
//   chatMensajesDia   tope diario por persona (1 a 10)
//   encuestasActivas  encuestas del chat y "¿Te gustó el diseño?"
//   tiendaDisponible  la tienda vende (se conecta con las compras)
//   iaDisponible      "Analizar y potenciar" con IA (planes pagos)
//   iaRegalo          regalo de IA para gratuitos
//   modoEmergencia    apaga todo lo opcional de un toque
//   actualizadoEn     marca de tiempo del servidor
//
// La app lo lee UNA vez al arrancar (y otra si vuelve de segundo plano
// después de 12 horas). Los cambios llegan en el próximo arranque.
//
// Esta pantalla lee el documento una sola vez (getDoc, sin listener) y
// guarda con merge. Requiere la regla de dashboard_config/app (L4 del lote,
// App-de-cv/firestore_lote.rules). Hasta que se publique, Firebase responde
// "sin permiso".

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

import { db } from "../firebase";

const REF = () => doc(db, "dashboard_config", "app");

// Mismos valores por defecto que la app (services/modos/gestorModos.ts)
const POR_DEFECTO = {
  metricasActivas: false,
  chatActivo: true,
  chatMensajesDia: 10,
  encuestasActivas: true,
  tiendaDisponible: false,
  iaDisponible: false,
  iaRegalo: false,
  modoEmergencia: false,
};

const INTERRUPTORES = [
  {
    id: "modoEmergencia",
    titulo: "Modo emergencia",
    detalle:
      "Apaga de un toque métricas, encuestas y regalo de IA, y baja el chat a 3 mensajes por día. Lo esencial sigue andando: crear el CV, el PDF, el control de versiones y las compras.",
    peligro: true,
  },
  {
    id: "metricasActivas",
    titulo: "Métricas de uso",
    detalle:
      "Apagadas, la app no envía métricas ni eventos y descarta lo que tenía pendiente. Los datos ya guardados no se borran.",
  },
  {
    id: "chatActivo",
    titulo: "Chat de Ayuda",
    detalle:
      "Apagado, la gente puede leer lo que ya recibió pero no enviar mensajes. Ve \"El chat está en pausa\" y puede usar el correo.",
  },
  {
    id: "encuestasActivas",
    titulo: "Encuestas",
    detalle:
      "Encuestas del chat y \"¿Te gustó el diseño?\". Apagadas, no se preguntan ni se leen (0 lecturas).",
  },
  {
    id: "tiendaDisponible",
    titulo: "Tienda (vender planes)",
    detalle:
      "Se conecta cuando estén las compras reales (Tarea 43, tarea 5). Hoy no cambia nada en la app.",
  },
  {
    id: "iaDisponible",
    titulo: "IA para planes pagos",
    detalle: "Se conecta con la IA. Hoy no cambia nada en la app.",
  },
  {
    id: "iaRegalo",
    titulo: "Regalo de IA para gratuitos",
    detalle:
      "Se conecta con la IA. La Cloud Function también lo va a respetar.",
  },
];

const ESTILOS = `
.modos-lista { display: flex; flex-direction: column; gap: 10px; padding: 16px 18px 20px; }
.modos-fila {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px; border: 1px solid var(--borde); border-radius: 14px;
  background: var(--superficie-alt);
}
.modos-fila.peligro { border-color: var(--error); }
.modos-texto { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.modos-texto strong { font-size: 14px; color: var(--texto); }
.modos-texto small { font-size: 12px; color: var(--gris); }
.modos-switch {
  min-width: 96px; padding: 8px 12px; border-radius: 999px;
  border: 1px solid var(--borde); font-weight: 800; cursor: pointer;
  background: var(--superficie); color: var(--gris);
}
.modos-switch.on { background: var(--acento); border-color: var(--acento); color: #fff; }
.modos-switch.on.peligro { background: var(--error); border-color: var(--error); }
.modos-num { width: 80px; padding: 8px 10px; border: 1px solid var(--borde); border-radius: 10px; background: var(--superficie); }
.modos-acciones { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 0 18px 20px; }
.modos-ok { color: var(--acento); font-weight: 700; margin: 0; }
.modos-pendiente { color: var(--gris); margin: 0; }
`;

const normalizar = (datos) => {
  const m = { ...POR_DEFECTO };
  if (!datos) return m;
  Object.keys(POR_DEFECTO).forEach((k) => {
    if (k === "chatMensajesDia") {
      if (Number.isInteger(datos[k])) m[k] = Math.max(1, Math.min(10, datos[k]));
    } else if (typeof datos[k] === "boolean") {
      m[k] = datos[k];
    }
  });
  return m;
};

const formatoFecha = (ts) => {
  try {
    return ts?.toDate ? ts.toDate().toLocaleString("es-AR") : "—";
  } catch {
    return "—";
  }
};

export default function Modos() {
  const [remoto, setRemoto] = useState(null);
  const [existe, setExiste] = useState(false);
  const [form, setForm] = useState(POR_DEFECTO);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [editado, setEditado] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const snap = await getDoc(REF());
      const datos = snap.exists() ? snap.data() : null;
      setExiste(snap.exists());
      setRemoto(datos);
      setForm(normalizar(datos));
      setEditado(false);
    } catch (err) {
      console.error("[modos] Error leyendo Firestore:", err);
      setError(
        err?.code === "permission-denied"
          ? "Sin permiso para leer dashboard_config/app. Falta publicar el lote de reglas (App-de-cv/firestore_lote.rules)."
          : "No se pudo cargar la configuración."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setEditado(true);
    setGuardadoOk(false);
  };

  const guardar = async () => {
    if (guardando || !editado) return;

    const antes = normalizar(remoto);
    if (form.modoEmergencia && !antes.modoEmergencia) {
      if (!window.confirm("¿Prender el MODO EMERGENCIA? Se apaga todo lo opcional en el próximo arranque de cada teléfono.")) return;
    }
    if (!form.metricasActivas && antes.metricasActivas) {
      if (!window.confirm("¿Apagar las métricas? Los teléfonos descartan lo que tenían pendiente.")) return;
    }

    setGuardando(true);
    setError("");
    try {
      await setDoc(REF(), { ...form, actualizadoEn: serverTimestamp() }, { merge: true });
      setGuardadoOk(true);
      await cargar();
    } catch (err) {
      console.error("[modos] No se pudo guardar:", err);
      setError(
        err?.code === "permission-denied"
          ? "No se pudo guardar: sin permiso. Falta publicar el lote de reglas."
          : "No se pudo guardar. Intentá de nuevo."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <style>{ESTILOS}</style>

      {cargando && <p className="estado-carga">Cargando…</p>}
      {error && <p className="error">Error: {error}</p>}

      {!cargando && !error && !existe && (
        <p className="aviso">
          Todavía no hay modos guardados. La app usa los valores por defecto
          (métricas apagadas, chat y encuestas prendidos). Tocá Guardar para
          tomar el control desde acá.
        </p>
      )}

      <div className="resumen">
        <div className="card">
          <span>Modo emergencia</span>
          <strong>{normalizar(remoto).modoEmergencia ? "PRENDIDO" : "Apagado"}</strong>
        </div>
        <div className="card">
          <span>Métricas</span>
          <strong>{normalizar(remoto).metricasActivas ? "Activas" : "Apagadas"}</strong>
        </div>
        <div className="card">
          <span>Última actualización</span>
          <strong>{formatoFecha(remoto?.actualizadoEn)}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Administrador general: modos de la app</h2>
        </div>

        <div className="modos-lista">
          {INTERRUPTORES.map((i) => (
            <div key={i.id} className={`modos-fila${i.peligro ? " peligro" : ""}`}>
              <div className="modos-texto">
                <strong>{i.titulo}</strong>
                <small>{i.detalle}</small>
              </div>
              <button
                type="button"
                className={`modos-switch${form[i.id] ? " on" : ""}${i.peligro ? " peligro" : ""}`}
                onClick={() => cambiar(i.id, !form[i.id])}
                aria-pressed={form[i.id]}
              >
                {form[i.id] ? "Prendido" : "Apagado"}
              </button>
            </div>
          ))}

          <div className="modos-fila">
            <div className="modos-texto">
              <strong>Mensajes del chat por día</strong>
              <small>Tope por persona, de 1 a 10. Con el modo emergencia baja a 3.</small>
            </div>
            <input
              className="modos-num"
              type="number"
              min={1}
              max={10}
              value={form.chatMensajesDia}
              onChange={(e) =>
                cambiar(
                  "chatMensajesDia",
                  Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1))
                )
              }
            />
          </div>
        </div>

        <div className="modos-acciones">
          <button type="button" onClick={guardar} disabled={guardando || !editado}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            className="btn-claro"
            onClick={() => {
              setForm(normalizar(remoto));
              setEditado(false);
            }}
            disabled={guardando || !editado}
          >
            Descartar cambios
          </button>
          {editado && !guardando && <p className="modos-pendiente">Hay cambios sin guardar</p>}
          {guardadoOk && !editado && (
            <p className="modos-ok">Guardado. Cada teléfono lo toma en su próximo arranque.</p>
          )}
        </div>
      </section>
    </>
  );
}
