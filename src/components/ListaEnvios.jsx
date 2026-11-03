// src/components/ListaEnvios.jsx
//
// Lista de mensajes enviados a VARIOS chats (registro en
// dashboard_mensajes_envios). Se usa en el modal de mensajes (pestaña
// "Enviados") y en la sección "Mensajes personalizados".
//
//   "Eliminar de todos"  borra el mensaje de cada chat al que se envió (por
//                        id, sin leer nada). El registro queda en la lista
//                        marcado como eliminado.
//   "Quitar de la lista" borra solo el registro (no toca los chats).
//
// Props:
//   envios          lista de useEnvios()
//   cargando, error de useEnvios()
//   verId           id del envío seleccionado (opcional)
//   onVer(id)       si se pasa, tocar un envío lo selecciona (para la vista previa)
//   conVistaPrevia  true: muestra el mensaje dibujado dentro de cada envío

import { useState } from "react";

import { MODOS_MENSAJE } from "../config";
import { borrarEnvio, quitarRegistroEnvio } from "../servicios/mensajesRicos";
import PreviewMensaje from "./PreviewMensaje";
import "../estilos-mensajes.css";

const etiquetaModo = (id) =>
  MODOS_MENSAJE.find((m) => m.id === id)?.etiqueta ?? id;

const fecha = (ms) =>
  ms
    ? new Date(ms).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const estadoTexto = (e) => {
  if (e.estado === "eliminado") return `Eliminado de todos · ${fecha(e.eliminadoEn)}`;
  if (e.estado === "parcial")
    return `Incompleto: llegó a ${e.enviados} de ${e.total} chats`;
  if (e.estado === "enviando") return "Enviando…";
  return "Activo en los chats";
};

export default function ListaEnvios({
  envios = [],
  cargando = false,
  error = null,
  verId = null,
  onVer,
  conVistaPrevia = false,
}) {
  const [trabajandoId, setTrabajandoId] = useState(null);
  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "error", texto }

  const eliminarDeTodos = async (e) => {
    const n = e.chats.length;

    if (
      !window.confirm(
        `Se borra "${e.nombre}" de ${n} ${n === 1 ? "chat" : "chats"}. No se puede deshacer. ¿Seguir?`
      )
    ) {
      return;
    }

    setTrabajandoId(e.id);
    setAviso(null);

    try {
      const total = await borrarEnvio(e);
      setAviso({ tipo: "ok", texto: `Borrado de ${total} chats.` });
    } catch (err) {
      console.error("[mensajes] No se pudo borrar el envío:", err);
      setAviso({
        tipo: "error",
        texto:
          err?.code === "permission-denied"
            ? "Sin permiso para borrar. Iniciá sesión y publicá las reglas."
            : "No se pudo borrar. Podés intentarlo de nuevo (no pasa nada si se repite).",
      });
    } finally {
      setTrabajandoId(null);
    }
  };

  const quitarDeLista = async (e) => {
    const aviso2 =
      e.estado === "eliminado"
        ? `¿Quitar "${e.nombre}" de la lista?`
        : `¿Quitar "${e.nombre}" de la lista? El mensaje SIGUE en los chats y después no vas a poder borrarlo de todos juntos.`;

    if (!window.confirm(aviso2)) return;

    setTrabajandoId(e.id);
    setAviso(null);

    try {
      await quitarRegistroEnvio(e.id);
    } catch (err) {
      console.error("[mensajes] No se pudo quitar el registro:", err);
      setAviso({ tipo: "error", texto: "No se pudo quitar de la lista." });
    } finally {
      setTrabajandoId(null);
    }
  };

  return (
    <>
      {cargando && <p>Cargando…</p>}
      {error && <p className="mr-msg error">{error}</p>}

      {!cargando && envios.length === 0 && !error && (
        <p style={{ opacity: 0.7 }}>
          Todavía no hay envíos masivos. Cada mensaje que mandes a todos los
          chats o a varios elegidos queda anotado acá.
        </p>
      )}

      <div className="mr-guardados">
        {envios.map((e) => {
          const ocupado = trabajandoId === e.id;
          const eliminado = e.estado === "eliminado";

          return (
            <div
              key={e.id}
              className={`mr-guardado${e.id === verId ? " elegido" : ""}`}
              style={{ flexDirection: "column" }}
              onClick={onVer ? () => onVer(e.id) : undefined}
              role={onVer ? "button" : undefined}
              tabIndex={onVer ? 0 : undefined}
              onKeyDown={
                onVer
                  ? (ev) => {
                      if (ev.key === "Enter") onVer(e.id);
                    }
                  : undefined
              }
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div className="mr-guardado-info">
                  <strong>{e.nombre || "(sin nombre)"}</strong>
                  <small>
                    {etiquetaModo(e.modo)} · {e.chats.length}{" "}
                    {e.chats.length === 1 ? "chat" : "chats"} ·{" "}
                    {fecha(e.enviadoEn)}
                  </small>
                  <small style={{ display: "block", opacity: eliminado ? 0.6 : 0.85 }}>
                    {estadoTexto(e)}
                  </small>
                </div>

                <div className="mr-guardado-acciones">
                  {!eliminado && (
                    <button
                      type="button"
                      className="mr-btn mr-btn-chico mr-btn-peligro"
                      disabled={ocupado}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        eliminarDeTodos(e);
                      }}
                    >
                      {ocupado ? "Eliminando…" : "Eliminar de todos"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="mr-btn mr-btn-chico"
                    disabled={ocupado}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      quitarDeLista(e);
                    }}
                  >
                    Quitar de la lista
                  </button>
                </div>
              </div>

              {conVistaPrevia && e.rico && (
                <div style={{ opacity: eliminado ? 0.5 : 1 }}>
                  <PreviewMensaje rico={e.rico} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {aviso && <p className={`mr-msg ${aviso.tipo}`}>{aviso.texto}</p>}
    </>
  );
}
