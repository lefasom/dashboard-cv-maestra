// src/secciones/MensajesPersonalizados.jsx  (Vite + React — Dashboard CV Master)
//
// Gestor de mensajes personalizados del chat.
//
//   1) MIS MENSAJES: lista de mensajes guardados con nombre. Se crean,
//      editan, borran o COMPARTEN desde acá:
//        - Editar     abre el editor.
//        - Compartir  lo envía a TODOS los chats (pide confirmación). Queda
//                     anotado en "Enviados a varios chats".
//        - Borrar     lo saca de tu lista (no toca lo ya enviado).
//      Para mandarlo a un solo chat o a varios elegidos, usá "＋ Agregar
//      mensaje" en la pestaña Chat.
//   2) ENVIADOS A VARIOS CHATS: registro de todo lo que mandaste a todos o a
//      varios chats. Desde acá lo borrás de todos los chats con un botón,
//      aunque ya no lo tengas guardado.
//   3) Cartel con las reglas de formato.
//
// (Se sacó el panel "Qué se muestra en la app" con los interruptores de
// módulos y demos.)
//
// Props: chats (de useChats) — destinos de "Compartir" y nombre de los chats.

import { useState } from "react";

import GuiaFormatos from "../components/GuiaFormatos";
import ListaEnvios from "../components/ListaEnvios";
import ModalMensajeRico from "../components/ModalMensajeRico";
import PreviewMensaje from "../components/PreviewMensaje";
import { MODOS_MENSAJE } from "../config";
import { useEnvios, usePlantillas } from "../hooks/useMensajesRicos";
import {
  borrarPlantilla,
  DEMOS_MENSAJE,
  enviarRico,
  guardarPlantilla,
} from "../servicios/mensajesRicos";
import "../estilos-mensajes.css";

export default function MensajesPersonalizados({ chats }) {
  const lista = chats?.chats ?? [];

  const { plantillas, cargando, error } = usePlantillas();
  const { envios, cargando: cargandoEnvios, error: errorEnvios } = useEnvios();

  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "error", texto }
  const [compartiendoId, setCompartiendoId] = useState(null);

  const [modal, setModal] = useState(null); // null | { plantilla?, modo? }

  // Carga las 5 demos como mensajes guardados (para probarlas o reenviarlas)
  const cargarDemos = async () => {
    if (!window.confirm("Se guardan 5 mensajes de ejemplo en tu lista. ¿Seguir?")) {
      return;
    }

    setAviso(null);

    try {
      for (const d of DEMOS_MENSAJE) {
        // eslint-disable-next-line no-await-in-loop
        await guardarPlantilla({ nombre: d.nombre, rico: d.rico });
      }
      setAviso({ tipo: "ok", texto: "Ejemplos guardados en tu lista." });
    } catch (err) {
      console.error("[mensajes] No se pudieron guardar los ejemplos:", err);
      setAviso({ tipo: "error", texto: "No se pudieron guardar los ejemplos." });
    }
  };

  const borrar = async (p) => {
    if (!window.confirm(`¿Borrar "${p.nombre}"? Los mensajes ya enviados no se tocan.`)) {
      return;
    }

    setAviso(null);

    try {
      await borrarPlantilla(p.id);
    } catch (err) {
      console.error("[mensajes] No se pudo borrar:", err);
      setAviso({ tipo: "error", texto: "No se pudo borrar." });
    }
  };

  // Envía el mensaje guardado a TODOS los chats. Queda registrado en
  // "Enviados a varios chats" para poder borrarlo de todos después.
  const compartir = async (p) => {
    if (!p.rico) return;

    if (lista.length === 0) {
      setAviso({ tipo: "error", texto: "Todavía no hay chats a los que enviar." });
      return;
    }

    if (
      !window.confirm(
        `Vas a compartir "${p.nombre}" con TODOS los chats (${lista.length}). ¿Enviar?`
      )
    ) {
      return;
    }

    setCompartiendoId(p.id);
    setAviso(null);

    try {
      const enviados = await enviarRico({
        destinos: lista.map((c) => ({
          id: c.id,
          ultimoMensajeEn: c.ultimoMensajeEn,
        })),
        rico: p.rico,
        registrar: true,
        nombre: p.nombre,
      });

      setAviso({
        tipo: "ok",
        texto: `"${p.nombre}" enviado a ${enviados} chats. Lo ves abajo en "Enviados a varios chats".`,
      });
    } catch (err) {
      console.error("[mensajes] No se pudo compartir:", err);
      setAviso({
        tipo: "error",
        texto:
          err?.code === "permission-denied"
            ? "Sin permiso para enviar. Publicá las reglas nuevas (firestore.rules) e iniciá sesión."
            : err?.message || "No se pudo compartir el mensaje.",
      });
    } finally {
      setCompartiendoId(null);
    }
  };

  const etiquetaModo = (id) =>
    MODOS_MENSAJE.find((m) => m.id === id)?.etiqueta ?? id;

  return (
    <div className="mr-seccion">
      {/* ---------------- MIS MENSAJES ---------------- */}
      <section className="mr-panel">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <h3 style={{ margin: 0 }}>Mis mensajes ({plantillas.length})</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="mr-btn"
              onClick={cargarDemos}
            >
              Guardar los 5 ejemplos
            </button>

            <button
              type="button"
              className="mr-btn mr-btn-principal"
              onClick={() => setModal({})}
            >
              ＋ Crear mensaje
            </button>
          </div>
        </div>

        <p>
          "Compartir" envía el mensaje a todos los chats. Para mandarlo a un
          solo chat o a varios elegidos, usá "＋ Agregar mensaje" en la pestaña{" "}
          <b>Chat</b>.
        </p>

        {cargando && <p>Cargando…</p>}
        {error && <p className="mr-msg error">{error}</p>}

        {!cargando && plantillas.length === 0 && !error && (
          <p>Todavía no guardaste ninguno.</p>
        )}

        <div className="mr-guardados">
          {plantillas.map((p) => {
            const ocupado = compartiendoId === p.id;

            return (
              <div className="mr-guardado" key={p.id} style={{ flexDirection: "column" }}>
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
                    <strong>{p.nombre || "(sin nombre)"}</strong>
                    <small>{etiquetaModo(p.modo)}</small>
                  </div>

                  <div className="mr-guardado-acciones">
                    <button
                      type="button"
                      className="mr-btn mr-btn-chico mr-btn-principal"
                      onClick={() => compartir(p)}
                      disabled={ocupado || compartiendoId !== null}
                    >
                      {ocupado ? "Enviando…" : "Compartir"}
                    </button>
                    <button
                      type="button"
                      className="mr-btn mr-btn-chico"
                      onClick={() => setModal({ plantilla: p })}
                      disabled={compartiendoId !== null}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="mr-btn mr-btn-chico mr-btn-peligro"
                      onClick={() => borrar(p)}
                      disabled={compartiendoId !== null}
                    >
                      Borrar
                    </button>
                  </div>
                </div>

                {p.rico && <PreviewMensaje rico={p.rico} />}
              </div>
            );
          })}
        </div>

        {aviso && <p className={`mr-msg ${aviso.tipo}`}>{aviso.texto}</p>}
      </section>

      {/* ---------------- ENVIADOS A VARIOS CHATS ---------------- */}
      <section className="mr-panel">
        <h3>Enviados a varios chats ({envios.length})</h3>
        <p>
          Cada mensaje que mandás a todos los chats o a varios elegidos queda
          anotado acá, aunque ya no lo tengas guardado. "Eliminar de todos" lo
          borra de cada chat al que se envió.
        </p>

        <ListaEnvios
          envios={envios}
          cargando={cargandoEnvios}
          error={errorEnvios}
          conVistaPrevia
        />
      </section>

      {/* ---------------- REGLAS ---------------- */}
      <section className="mr-panel">
        <h3>Reglas de formato</h3>
        <p>Valen para los textos de mensajes, tarjetas y preguntas de encuestas.</p>
        <GuiaFormatos abierta />
      </section>

      {modal && (
        <ModalMensajeRico
          chats={lista}
          soloGuardar
          modoInicial={modal.modo ?? "texto"}
          plantillaInicial={modal.plantilla ?? null}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}