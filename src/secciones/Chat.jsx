// src/secciones/Chat.jsx  (Vite + React — Dashboard CV Master)
//
// Chat de ayuda con los usuarios de la app.
//
//   - Arriba, 4 tarjetas:
//       · En la app ahora   (y cuántos están en el chat)
//       · Chats             (total)
//       · Sin responder     (tocala para ver solo esos)
//       · Historial         (abre "Gestionar historial" para borrar)
//   - Izquierda: un chat por usuario (Chat 1, Chat 2…). Los SIN RESPONDER
//     siempre van primero. Punto verde = en el chat; punto ámbar = en la
//     app pero fuera del chat.
//     Si el usuario dejó una reseña, al lado del número se muestra el
//     nombre que puso en ella: "Chat 1 (Nombre)".
//   - Derecha: la conversación, estilo WhatsApp. Escribís y respondés.
//     En la cabecera, el botón "★ Reseña" abre un modal con la reseña de
//     ese usuario (se busca por chatId en dashboard_reviews).
//     Junto a él, "👍 Sus me gusta" y "👎 Sus no me gusta" abren un modal con
//     los NOMBRES de los diseños de CV que ese usuario votó (se busca por
//     userId en dashboard_design_feedback; es el mismo id que el chat).
//
// NOMBRE ENTRE PARÉNTESIS
//   Se escuchan las reseñas (dashboard_reviews) y se arma un mapa
//   chatId -> nombre. Si el usuario cambia su reseña desde la app, el
//   nombre se actualiza solo. Si hay más de una reseña del mismo chat, se
//   usa la más nueva.
//
// MENÚ DE CADA MENSAJE (tres puntitos ⋯):
//   - Eliminar: cualquier mensaje (tuyo o del usuario). Pide confirmación.
//     Al borrar se recalcula la ficha del chat (último mensaje y si quedó
//     sin responder).
//   - Editar: solo los TUYOS. Se edita en el mismo globo y queda marcado
//     como "editado". Requiere la regla de update de mensajes en
//     firestore.rules (ver el aviso que aparece si falta).
//
// Al abrir un chat se escribe chats/{id}.soporteLeyoHasta. Al responder se
// escribe chats/{id}.ultimaRespuestaEn.
//
// Requiere sesión iniciada y las reglas de firestore.rules.

import {
  collection,
  doc,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";

import ModalDisenos from "../components/ModalDisenos";
import ModalHistorial from "../components/ModalHistorial";
import ModalResena from "../components/ModalResena";
import {
  COLECCIONES,
  LIMITE_MENSAJES_CHAT,
  LIMITE_RESENAS,
  LIMITE_TEXTO_RESPUESTA,
} from "../config";
import { db } from "../firebase";
import "../estilos-historial.css";

// ------------------------------------------------------------
// ESTILOS DEL MENÚ DE MENSAJES, DEL BOTÓN DE RESEÑA Y DEL NOMBRE
// (van en este mismo archivo)
// ------------------------------------------------------------

const ESTILOS_MENU = `
.burbuja.con-menu {
  position: relative;
  padding-right: 30px;
}

.menu-puntos {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font-size: 16px;
  font-weight: 900;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
}

.burbuja:hover .menu-puntos,
.menu-puntos.abierto,
.menu-puntos:focus-visible {
  opacity: 0.85;
}

.menu-puntos:hover {
  background: rgba(127, 127, 127, 0.25);
  filter: none;
}

@media (hover: none) {
  .menu-puntos {
    opacity: 0.7;
  }
}

.menu-msg-fondo {
  position: fixed;
  inset: 0;
  z-index: 40;
}

.menu-msg {
  position: fixed;
  z-index: 41;
  width: 150px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 27, 76, 0.22);
}

.menu-msg button {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  background: transparent;
  color: var(--texto);
  font-size: 13px;
  font-weight: 700;
  text-align: left;
}

.menu-msg button:hover {
  background: var(--superficie-alt);
  filter: none;
}

.menu-msg button.peligro-op {
  color: var(--error);
}

.msg-edicion {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: min(320px, 60vw);
}

.msg-edicion textarea {
  width: 100%;
  min-height: 60px;
  max-height: 160px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  resize: vertical;
  outline: none;
}

.msg-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 4px;
}

.msg-acciones button {
  padding: 4px 12px;
  border: 0;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.msg-acciones button.principal {
  background: #fff;
  color: var(--acento);
}

.msg-acciones button:disabled {
  opacity: 0.5;
  cursor: default;
}

.burbuja.usuario .msg-acciones button {
  background: var(--superficie-alt);
  color: var(--texto);
}

.burbuja.usuario .msg-acciones button.peligro-op,
.burbuja.soporte .msg-acciones button.peligro-op {
  background: var(--error);
  color: #fff;
}

.msg-confirmar {
  margin: 6px 0 2px;
  padding-top: 6px;
  border-top: 1px solid rgba(127, 127, 127, 0.35);
  font-size: 12px;
  font-weight: 700;
}

.burbuja-editado {
  margin-right: 4px;
  font-style: italic;
}

.btn-resena {
  padding: 4px 12px;
  border: 1px solid var(--borde);
  border-radius: 999px;
  background: var(--superficie-alt);
  color: var(--texto);
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.chat-titulo {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-nombre {
  font-weight: 600;
  opacity: 0.75;
}
`;

// ------------------------------------------------------------
// FORMATO DE HORA Y FECHA (igual que WhatsApp en Argentina)
// ------------------------------------------------------------

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const dos = (n) => String(n).padStart(2, "0");

const diaClave = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
};

const formatoHora = (ms) => {
  const d = new Date(ms);
  return `${dos(d.getHours())}:${dos(d.getMinutes())}`;
};

const formatoFecha = (ms) => {
  const ahora = Date.now();

  if (diaClave(ms) === diaClave(ahora)) return "Hoy";
  if (diaClave(ms) === diaClave(ahora - 24 * 60 * 60 * 1000)) return "Ayer";

  const d = new Date(ms);
  const otroAnio = d.getFullYear() !== new Date(ahora).getFullYear();

  return `${d.getDate()} de ${MESES[d.getMonth()]}${
    otroAnio ? ` de ${d.getFullYear()}` : ""
  }`;
};

// Para la lista: hora si es de hoy, "Ayer" o dd/mm/aaaa
const formatoLista = (ms) => {
  if (!ms) return "";

  const ahora = Date.now();
  if (diaClave(ms) === diaClave(ahora)) return formatoHora(ms);
  if (diaClave(ms) === diaClave(ahora - 24 * 60 * 60 * 1000)) return "Ayer";

  const d = new Date(ms);
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const hace = (ms) => {
  if (!ms) return "sin actividad";

  const seg = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (seg < 60) return "hace instantes";

  const min = Math.round(seg / 60);
  if (min < 60) return `hace ${min} min`;

  const horas = Math.round(min / 60);
  if (horas < 24) return `hace ${horas} h`;

  return `hace ${Math.round(horas / 24)} d`;
};

// Texto de estado de un chat
const estadoDe = (c) => {
  if (c.activo) return "En el chat ahora";
  if (c.enApp) return "En la app ahora";
  return `Última vez ${hace(c.ultimaConexion)}`;
};

// Datos de la ficha según los mensajes que quedan (lista cronológica):
// último mensaje del usuario y si quedó respondido
const fichaSegunMensajes = (lista) => {
  let indiceUsuario = -1;
  let indiceSoporte = -1;

  lista.forEach((m, i) => {
    if (m.de === "usuario") indiceUsuario = i;
    else indiceSoporte = i;
  });

  const usuario = indiceUsuario >= 0 ? lista[indiceUsuario] : null;
  const soporte = indiceSoporte >= 0 ? lista[indiceSoporte] : null;

  const usuarioEn = usuario?.enviadoEn ?? 0;
  const soporteEn = soporte?.enviadoEn ?? 0;

  return {
    ultimoMensaje: usuario ? usuario.texto.slice(0, 100) : "",
    ultimoMensajeEn: usuarioEn,
    // Si tu último mensaje es posterior al del usuario, quedó respondido
    ultimaRespuestaEn:
      soporte && indiceSoporte > indiceUsuario
        ? Math.max(soporteEn, usuarioEn)
        : soporteEn,
  };
};

// ------------------------------------------------------------
// COMPONENTE
// ------------------------------------------------------------

export default function Chat({ chats }) {
  const { chats: lista = [], resumen, cargando, error } = chats ?? {};

  const [seleccionId, setSeleccionId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  // Filtro "solo sin responder", modal de historial y modal de reseña
  const [soloSinResponder, setSoloSinResponder] = useState(false);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [resenaAbierta, setResenaAbierta] = useState(false);

  // Modal de diseños votados: null, "like" o "dislike"
  const [disenosAbierto, setDisenosAbierto] = useState(null);

  // Nombre ficticio de cada chat, tomado de su reseña: { [chatId]: nombre }
  const [nombres, setNombres] = useState({});

  // Menú ⋯ de un mensaje: { id, de, top, left }
  const [menu, setMenu] = useState(null);
  // Mensaje que se está editando y su texto
  const [editandoId, setEditandoId] = useState(null);
  const [textoEdicion, setTextoEdicion] = useState("");
  // Mensaje que espera confirmación para eliminarse
  const [confirmandoId, setConfirmandoId] = useState(null);
  // Operación en curso sobre un mensaje (editar / eliminar)
  const [trabajando, setTrabajando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState(null);

  const finRef = useRef(null);

  const seleccionado = useMemo(
    () => lista.find((c) => c.id === seleccionId) ?? null,
    [lista, seleccionId]
  );

  // La lista ya viene con los sin responder primero (useChats)
  const visibles = useMemo(
    () => (soloSinResponder ? lista.filter((c) => c.sinResponder) : lista),
    [lista, soloSinResponder]
  );

  // Nombres ficticios: se escuchan las reseñas (la más nueva primero) y se
  // guarda, por cada chatId, el nombre de su reseña más reciente
  useEffect(() => {
    const consulta = query(
      collection(db, COLECCIONES.RESENAS),
      orderBy("createdAt", "desc"),
      limit(LIMITE_RESENAS)
    );

    return onSnapshot(
      consulta,
      (snapshot) => {
        const mapa = {};

        snapshot.docs.forEach((d) => {
          const data = d.data();
          const chatId = typeof data.chatId === "string" ? data.chatId : "";
          const nombre = String(data.nombre ?? "").trim();

          if (chatId && nombre && !(chatId in mapa)) {
            mapa[chatId] = nombre;
          }
        });

        setNombres(mapa);
      },
      (err) => {
        // Si falla, la lista sigue funcionando, solo sin los nombres
        console.warn("[chat] No se pudieron leer los nombres:", err);
      }
    );
  }, []);

  // Al cambiar de chat se cierra cualquier menú / edición / modal pendiente
  useEffect(() => {
    setMenu(null);
    setEditandoId(null);
    setConfirmandoId(null);
    setErrorMensaje(null);
    setResenaAbierta(false);
    setDisenosAbierto(null);
  }, [seleccionId]);

  // Conversación del chat abierto
  useEffect(() => {
    if (!seleccionId) {
      setMensajes([]);
      return;
    }

    setCargandoMensajes(true);
    setMensajes([]);
    setErrorEnvio(null);

    const consulta = query(
      collection(db, COLECCIONES.CHATS, seleccionId, "messages"),
      orderBy("enviadoEn", "asc"),
      limitToLast(LIMITE_MENSAJES_CHAT)
    );

    return onSnapshot(
      consulta,
      { includeMetadataChanges: true },
      (snapshot) => {
        setMensajes(
          snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              de: data.de === "soporte" ? "soporte" : "usuario",
              texto: String(data.texto ?? ""),
              enviadoEn: Number(data.enviadoEn) || 0,
              editadoEn: Number(data.editadoEn) || 0,
              pendiente: d.metadata.hasPendingWrites,
            };
          })
        );
        setCargandoMensajes(false);
      },
      (err) => {
        console.error("[chat] Error leyendo mensajes:", err);
        setCargandoMensajes(false);
      }
    );
  }, [seleccionId]);

  // Baja solo hasta el último mensaje cuando llegan mensajes nuevos
  // (no cuando editás o borrás uno del medio)
  const totalMensajes = mensajes.length;

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [totalMensajes, seleccionId]);

  // Marcar como leído al abrir el chat.
  // Se usa el mayor entre "ahora" y el último mensaje del usuario, así un
  // reloj de teléfono adelantado no deja el chat "sin leer" para siempre.
  const sinLeerSeleccionado = seleccionado?.sinLeer;
  const ultimoDelUsuario = seleccionado?.ultimoMensajeEn ?? 0;

  useEffect(() => {
    if (!seleccionId || !sinLeerSeleccionado) return;

    updateDoc(doc(db, COLECCIONES.CHATS, seleccionId), {
      soporteLeyoHasta: Math.max(Date.now(), ultimoDelUsuario),
    }).catch((err) => console.warn("[chat] No se pudo marcar leído:", err));
  }, [seleccionId, sinLeerSeleccionado, ultimoDelUsuario]);

  // Mensajes + separadores de fecha
  const items = useMemo(() => {
    const resultado = [];
    let diaAnterior = "";

    mensajes.forEach((m) => {
      const dia = diaClave(m.enviadoEn);

      if (dia !== diaAnterior) {
        resultado.push({
          tipo: "fecha",
          key: `fecha-${dia}`,
          texto: formatoFecha(m.enviadoEn),
        });
        diaAnterior = dia;
      }

      resultado.push({ tipo: "mensaje", key: m.id, mensaje: m });
    });

    return resultado;
  }, [mensajes]);

  // Enviar respuesta: crea el mensaje y marca el chat como respondido, todo
  // en una sola operación.
  // ultimaRespuestaEn usa el mayor entre "ahora" y el último mensaje del
  // usuario (por si el reloj de su teléfono está adelantado).
  const enviar = async () => {
    const limpio = texto.trim().slice(0, LIMITE_TEXTO_RESPUESTA);
    if (!limpio || !seleccionId || enviando) return;

    setEnviando(true);
    setErrorEnvio(null);

    try {
      const fichaRef = doc(db, COLECCIONES.CHATS, seleccionId);
      const mensajeRef = doc(collection(fichaRef, "messages"));
      const ahora = Date.now();

      const batch = writeBatch(db);

      batch.set(mensajeRef, {
        de: "soporte",
        texto: limpio,
        enviadoEn: ahora,
        createdAt: serverTimestamp(),
      });

      batch.update(fichaRef, {
        ultimaRespuestaEn: Math.max(ahora, seleccionado?.ultimoMensajeEn ?? 0),
      });

      await batch.commit();

      setTexto("");
    } catch (err) {
      console.error("[chat] No se pudo enviar:", err);
      setErrorEnvio("No se pudo enviar el mensaje. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const alTeclear = (e) => {
    // Enter envía; Shift+Enter hace un salto de línea
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  // ------------------------------------------------------------
  // MENÚ ⋯ DE UN MENSAJE
  // ------------------------------------------------------------

  const ANCHO_MENU = 150;
  const ALTO_MENU = 90;

  const abrirMenu = (evento, m) => {
    evento.stopPropagation();

    // El mismo botón vuelve a cerrar el menú
    if (menu?.id === m.id) {
      setMenu(null);
      return;
    }

    const caja = evento.currentTarget.getBoundingClientRect();

    // Si abajo no hay lugar, se abre hacia arriba
    const hayLugarAbajo = window.innerHeight - caja.bottom > ALTO_MENU + 12;
    const top = hayLugarAbajo ? caja.bottom + 4 : caja.top - ALTO_MENU - 4;

    const left = Math.max(
      8,
      Math.min(caja.right - ANCHO_MENU, window.innerWidth - ANCHO_MENU - 8)
    );

    setMenu({ id: m.id, de: m.de, top, left });
  };

  const empezarEdicion = (m) => {
    setMenu(null);
    setConfirmandoId(null);
    setErrorMensaje(null);
    setEditandoId(m.id);
    setTextoEdicion(m.texto);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTextoEdicion("");
    setErrorMensaje(null);
  };

  const guardarEdicion = async (m) => {
    const limpio = textoEdicion.trim().slice(0, LIMITE_TEXTO_RESPUESTA);
    if (!limpio || !seleccionId || trabajando) return;

    // Sin cambios: solo se cierra
    if (limpio === m.texto) {
      cancelarEdicion();
      return;
    }

    setTrabajando(true);
    setErrorMensaje(null);

    try {
      await updateDoc(
        doc(db, COLECCIONES.CHATS, seleccionId, "messages", m.id),
        { texto: limpio, editadoEn: Date.now() }
      );

      cancelarEdicion();
    } catch (err) {
      console.error("[chat] No se pudo editar el mensaje:", err);

      setErrorMensaje(
        err?.code === "permission-denied"
          ? "No se pudo editar: falta publicar la regla de edición de mensajes en firestore.rules."
          : "No se pudo editar el mensaje. Intentá de nuevo."
      );
    } finally {
      setTrabajando(false);
    }
  };

  const pedirEliminar = (m) => {
    setMenu(null);
    setEditandoId(null);
    setErrorMensaje(null);
    setConfirmandoId(m.id);
  };

  // Borra el mensaje y deja la ficha del chat coherente con lo que queda
  // (último mensaje del usuario, si está respondido), en una sola operación.
  const eliminar = async (m) => {
    if (!seleccionId || trabajando) return;

    setTrabajando(true);
    setErrorMensaje(null);

    try {
      const fichaRef = doc(db, COLECCIONES.CHATS, seleccionId);
      const restantes = mensajes.filter((x) => x.id !== m.id);

      const batch = writeBatch(db);

      batch.delete(doc(fichaRef, "messages", m.id));
      batch.update(fichaRef, fichaSegunMensajes(restantes));

      await batch.commit();

      setConfirmandoId(null);
    } catch (err) {
      console.error("[chat] No se pudo eliminar el mensaje:", err);

      setErrorMensaje(
        err?.code === "permission-denied"
          ? "No se pudo eliminar: sin permiso. Iniciá sesión y publicá las reglas."
          : "No se pudo eliminar el mensaje. Intentá de nuevo."
      );
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <>
      <style>{ESTILOS_MENU}</style>

      {cargando && <p className="estado-carga">Cargando…</p>}
      {error && <p className="error">Error: {error}</p>}

      {/* ---------------- TARJETAS ---------------- */}
      <div className="resumen">
        <div className="card">
          <span>En la app ahora</span>
          <strong>{resumen?.enLinea ?? 0}</strong>
          <small className="card-sub">
            {resumen?.activos ?? 0} en el chat
          </small>
        </div>

        <div className="card">
          <span>Chats</span>
          <strong>{resumen?.total ?? 0}</strong>
        </div>

        <button
          type="button"
          className={`card card-clicable${soloSinResponder ? " card-activa" : ""}`}
          onClick={() => setSoloSinResponder((v) => !v)}
          aria-pressed={soloSinResponder}
        >
          <span>Sin responder</span>
          <strong>{resumen?.sinResponder ?? 0}</strong>
          <small className="card-sub">
            {soloSinResponder ? "Mostrando solo estos" : "Tocá para filtrar"}
          </small>
        </button>

        <button
          type="button"
          className="card card-boton"
          onClick={() => setHistorialAbierto(true)}
        >
          <span>Historial</span>
          <strong>Gestionar</strong>
          <small className="card-sub">Borrar por antigüedad</small>
        </button>
      </div>

      <section
        className={`panel chat-panel${seleccionId ? " con-seleccion" : ""}`}
      >
        {/* ---------------- LISTA DE CHATS ---------------- */}
        <aside className="chat-lista">
          <div className="panel-head">
            <h2>
              Chats <span className="contador">{visibles.length}</span>
            </h2>
          </div>

          {soloSinResponder && (
            <div className="chat-filtro">
              <span>Solo sin responder</span>
              <button type="button" onClick={() => setSoloSinResponder(false)}>
                Ver todos
              </button>
            </div>
          )}

          <div className="scroll chat-lista-scroll">
            {!cargando && lista.length === 0 && (
              <p className="vacio">Todavía no hay chats.</p>
            )}

            {!cargando && lista.length > 0 && visibles.length === 0 && (
              <p className="vacio">No hay chats sin responder.</p>
            )}

            {visibles.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chat-item${c.id === seleccionId ? " activo" : ""}`}
                onClick={() => setSeleccionId(c.id)}
              >
                <span className="chat-avatar">
                  {c.numero}
                  {c.enLinea && (
                    <span
                      className={`punto-en-linea${c.activo ? "" : " app"}`}
                    />
                  )}
                </span>

                <span className="chat-item-texto">
                  <span className="chat-item-fila">
                    <span className="chat-titulo">
                      <strong>Chat {c.numero}</strong>
                      {nombres[c.id] && (
                        <span className="chat-nombre"> ({nombres[c.id]})</span>
                      )}
                    </span>
                    <span
                      className={`chat-item-hora${
                        c.sinResponder ? " nuevo" : ""
                      }`}
                    >
                      {formatoLista(c.actividad)}
                    </span>
                  </span>

                  <span className="chat-item-fila">
                    <span className="chat-item-preview">
                      {c.ultimoMensaje ||
                        (c.enLinea ? estadoDe(c) : `ID …${c.idCorto}`)}
                    </span>
                    {c.sinResponder && <span className="chat-nuevo">1</span>}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* ---------------- CONVERSACIÓN ---------------- */}
        <div className="chat-conv">
          {!seleccionado ? (
            <div className="chat-vacio">
              <p>Elegí un chat para ver la conversación.</p>
            </div>
          ) : (
            <>
              <div className="chat-cab">
                <button
                  type="button"
                  className="btn-claro chat-volver"
                  onClick={() => setSeleccionId(null)}
                >
                  ← Chats
                </button>

                <div className="chat-avatar">
                  {seleccionado.numero}
                  {seleccionado.enLinea && (
                    <span
                      className={`punto-en-linea${
                        seleccionado.activo ? "" : " app"
                      }`}
                    />
                  )}
                </div>

                <div className="chat-cab-texto">
                  <strong>
                    Chat {seleccionado.numero}
                    {nombres[seleccionado.id] && (
                      <span className="chat-nombre">
                        {" "}
                        ({nombres[seleccionado.id]})
                      </span>
                    )}
                  </strong>
                  <span>
                    {estadoDe(seleccionado)}
                    {" · "}
                    <span className="chat-id">ID …{seleccionado.idCorto}</span>
                  </span>
                </div>

                <div className="chat-etiquetas">
                  {seleccionado.plataforma && (
                    <span className="etiqueta">{seleccionado.plataforma}</span>
                  )}
                  {seleccionado.idioma && (
                    <span className="etiqueta">{seleccionado.idioma}</span>
                  )}
                  <button
                    type="button"
                    className="btn-resena"
                    onClick={() => setResenaAbierta(true)}
                  >
                    ★ Reseña
                  </button>
                  <button
                    type="button"
                    className="btn-resena"
                    onClick={() => setDisenosAbierto("like")}
                  >
                    👍 Sus me gusta
                  </button>
                  <button
                    type="button"
                    className="btn-resena"
                    onClick={() => setDisenosAbierto("dislike")}
                  >
                    👎 Sus no me gusta
                  </button>
                </div>
              </div>

              <div className="chat-mensajes">
                {cargandoMensajes && (
                  <p className="estado-carga">Cargando mensajes…</p>
                )}

                {!cargandoMensajes && items.length === 0 && (
                  <p className="vacio">
                    Este usuario todavía no escribió. Puedes saludarlo
                    primero.
                  </p>
                )}

                {items.map((item) => {
                  if (item.tipo === "fecha") {
                    return (
                      <div className="chat-fecha" key={item.key}>
                        <span>{item.texto}</span>
                      </div>
                    );
                  }

                  const m = item.mensaje;
                  const editando = editandoId === m.id;
                  const confirmando = confirmandoId === m.id;

                  return (
                    <div key={item.key} className={`burbuja-fila ${m.de}`}>
                      <div
                        className={`burbuja ${m.de}${
                          m.pendiente || editando ? "" : " con-menu"
                        }`}
                      >
                        {/* Tres puntitos */}
                        {!m.pendiente && !editando && (
                          <button
                            type="button"
                            className={`menu-puntos${
                              menu?.id === m.id ? " abierto" : ""
                            }`}
                            onClick={(e) => abrirMenu(e, m)}
                            aria-label="Opciones del mensaje"
                            aria-haspopup="menu"
                            aria-expanded={menu?.id === m.id}
                          >
                            ⋯
                          </button>
                        )}

                        {editando ? (
                          <div className="msg-edicion">
                            <textarea
                              value={textoEdicion}
                              onChange={(e) => setTextoEdicion(e.target.value)}
                              maxLength={LIMITE_TEXTO_RESPUESTA}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Escape") cancelarEdicion();
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  guardarEdicion(m);
                                }
                              }}
                            />

                            <div className="msg-acciones">
                              <button
                                type="button"
                                onClick={cancelarEdicion}
                                disabled={trabajando}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="principal"
                                onClick={() => guardarEdicion(m)}
                                disabled={
                                  trabajando || textoEdicion.trim().length === 0
                                }
                              >
                                {trabajando ? "Guardando…" : "Guardar"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p>{m.texto}</p>
                        )}

                        {confirmando && (
                          <div className="msg-confirmar">
                            ¿Eliminar este mensaje? No se puede deshacer.
                            <div className="msg-acciones">
                              <button
                                type="button"
                                onClick={() => setConfirmandoId(null)}
                                disabled={trabajando}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="peligro-op"
                                onClick={() => eliminar(m)}
                                disabled={trabajando}
                              >
                                {trabajando ? "Eliminando…" : "Eliminar"}
                              </button>
                            </div>
                          </div>
                        )}

                        {(editando || confirmando) && errorMensaje && (
                          <div className="msg-confirmar">{errorMensaje}</div>
                        )}

                        <span className="burbuja-hora">
                          {m.editadoEn > 0 && (
                            <span className="burbuja-editado">editado</span>
                          )}
                          {formatoHora(m.enviadoEn)}
                          {m.de === "soporte" &&
                            (m.pendiente ? " 🕓" : " ✓")}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div ref={finRef} />
              </div>

              {errorEnvio && <p className="error chat-error">{errorEnvio}</p>}

              <div className="chat-barra">
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={alTeclear}
                  placeholder="Escribe una respuesta (Enter para enviar)"
                  maxLength={LIMITE_TEXTO_RESPUESTA}
                  rows={1}
                />

                <button
                  type="button"
                  className="chat-enviar"
                  onClick={enviar}
                  disabled={enviando || texto.trim().length === 0}
                  aria-label="Enviar"
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ---------------- MENÚ ⋯ (flotante) ---------------- */}
      {menu && (
        <>
          <div
            className="menu-msg-fondo"
            onClick={() => setMenu(null)}
            role="presentation"
          />

          <div
            className="menu-msg"
            role="menu"
            style={{ top: menu.top, left: menu.left }}
          >
            {menu.de === "soporte" && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  const m = mensajes.find((x) => x.id === menu.id);
                  if (m) empezarEdicion(m);
                }}
              >
                ✎ Editar
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              className="peligro-op"
              onClick={() => {
                const m = mensajes.find((x) => x.id === menu.id);
                if (m) pedirEliminar(m);
              }}
            >
              🗑 Eliminar
            </button>
          </div>
        </>
      )}

      {historialAbierto && (
        <ModalHistorial
          chats={lista}
          onClose={() => setHistorialAbierto(false)}
        />
      )}

      {resenaAbierta && seleccionado && (
        <ModalResena
          chatId={seleccionado.id}
          numero={seleccionado.numero}
          onClose={() => setResenaAbierta(false)}
        />
      )}

      {disenosAbierto && seleccionado && (
        <ModalDisenos
          chatId={seleccionado.id}
          numero={seleccionado.numero}
          valorInicial={disenosAbierto}
          onClose={() => setDisenosAbierto(null)}
        />
      )}
    </>
  );
}