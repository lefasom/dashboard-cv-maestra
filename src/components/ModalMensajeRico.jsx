// src/components/ModalMensajeRico.jsx
//
// Editor + envío de mensajes personalizados (texto, tarjeta, video,
// encuesta 👍/👎, encuesta ranking).
//
//   Pestaña "Crear / editar":
//     - Elegís el modo, completás los campos (con barra de formato) y ves la
//       vista previa a la derecha, igual que en la app.
//     - "Guardar" lo deja en tu lista con un nombre (dashboard_mensajes_plantillas).
//     - Abajo elegís a quién se envía: este chat, todos los chats o varios
//       chats elegidos. Lo que va a varios chats queda REGISTRADO en la
//       pestaña "Enviados" para poder borrarlo de todos juntos.
//   Pestaña "Guardados":
//     - Tu lista de mensajes con nombre. "Cargar" lo abre en el editor
//       (para editarlo o enviarlo). "Borrar" lo elimina de la lista (no toca
//       los mensajes que ya enviaste).
//   Pestaña "Enviados":
//     - Los mensajes que mandaste a varios chats. "Eliminar de todos" lo
//       borra de cada chat; "Quitar de la lista" saca solo el registro.
//
// Props:
//   chats            lista de useChats (para elegir destinos)
//   chatActual       chat abierto en el Chat (o null)
//   nombres          { [chatId]: nombre } (opcional)
//   modoInicial      "texto" | "tarjeta" | "video" | "encuesta_likes" | "encuesta_top"
//   destinoInicial   "este" | "todos" | "elegir"
//   plantillaInicial { id, nombre, rico } para abrir un guardado
//   pestanaInicial   "crear" | "guardados" | "enviados"
//   soloGuardar      true: no muestra el envío (sección de administración)
//   onClose

import { useEffect, useMemo, useState } from "react";

import { MODOS_MENSAJE } from "../config";
import { useEnvios, usePlantillas } from "../hooks/useMensajesRicos";
import {
  borrarPlantilla,
  completarRico,
  enviarRico,
  guardarPlantilla,
  limpiarRico,
  resumenDe,
  ricoEstaVacio,
  ricoVacio,
  validarRico,
} from "../servicios/mensajesRicos";
import FormularioMensaje from "./FormularioMensaje";
import GuiaFormatos from "./GuiaFormatos";
import ListaEnvios from "./ListaEnvios";
import PreviewMensaje from "./PreviewMensaje";
import "../estilos-mensajes.css";

const etiquetaModo = (id) =>
  MODOS_MENSAJE.find((m) => m.id === id)?.etiqueta ?? id;

export default function ModalMensajeRico({
  chats = [],
  chatActual = null,
  nombres = {},
  modoInicial = "texto",
  destinoInicial,
  plantillaInicial = null,
  pestanaInicial = "crear",
  soloGuardar = false,
  onClose,
}) {
  const { plantillas, cargando: cargandoPlantillas, error: errorPlantillas } =
    usePlantillas();
  const { envios, cargando: cargandoEnvios, error: errorEnvios } = useEnvios();

  const [pestana, setPestana] = useState(pestanaInicial);

  const [rico, setRico] = useState(() =>
    plantillaInicial?.rico
      ? completarRico(plantillaInicial.rico)
      : ricoVacio(modoInicial)
  );
  const [nombre, setNombre] = useState(plantillaInicial?.nombre ?? "");
  const [plantillaId, setPlantillaId] = useState(plantillaInicial?.id ?? null);

  const [destino, setDestino] = useState(
    destinoInicial ?? (chatActual ? "este" : "todos")
  );
  const [elegidos, setElegidos] = useState(() => new Set());
  const [busqueda, setBusqueda] = useState("");
  const [marcarRespondido, setMarcarRespondido] = useState(true);

  const [trabajando, setTrabajando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "error", texto }

  // Vista previa en las pestañas Guardados / Enviados
  const [vistaId, setVistaId] = useState(null);
  const [vistaEnvioId, setVistaEnvioId] = useState(null);

  // Escape cierra
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === "Escape" && !trabajando) onClose?.();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [onClose, trabajando]);

  // Si no hay chat abierto, "este chat" no existe
  useEffect(() => {
    if (!chatActual && destino === "este") setDestino("todos");
  }, [chatActual, destino]);

  const etiquetaChat = (c) =>
    `Chat ${c.numero}${nombres[c.id] ? ` (${nombres[c.id]})` : ""}`;

  const chatsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => etiquetaChat(c).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, busqueda, nombres]);

  const problema = validarRico(rico);
  const vacio = ricoEstaVacio(rico);

  const destinosElegidos = useMemo(() => {
    if (destino === "este") return chatActual ? [chatActual] : [];
    if (destino === "todos") return chats;
    return chats.filter((c) => elegidos.has(c.id));
  }, [destino, chatActual, chats, elegidos]);

  // ------------------------------------------------------------
  // Acciones
  // ------------------------------------------------------------

  const cambiarModo = (id) => {
    if (id === rico.tipo) return;

    if (!vacio && !window.confirm("Cambiar de modo borra lo que escribiste. ¿Seguir?")) {
      return;
    }

    setRico(ricoVacio(id));
    setPlantillaId(null);
    setNombre("");
    setAviso(null);
  };

  const cargar = (p) => {
    setRico(completarRico(p.rico));
    setNombre(p.nombre);
    setPlantillaId(p.id);
    setPestana("crear");
    setAviso(null);
  };

  const nuevo = () => {
    setRico(ricoVacio(rico.tipo));
    setPlantillaId(null);
    setNombre("");
    setAviso(null);
  };

  const guardar = async (comoNuevo = false) => {
    setAviso(null);
    setTrabajando(true);

    try {
      const id = await guardarPlantilla({
        id: comoNuevo ? null : plantillaId,
        nombre,
        rico,
      });

      setPlantillaId(id);
      setAviso({ tipo: "ok", texto: "Guardado en tu lista." });
    } catch (err) {
      console.error("[mensajes] No se pudo guardar:", err);
      setAviso({
        tipo: "error",
        texto:
          err?.code === "permission-denied"
            ? "Sin permiso para guardar. Publicá las reglas nuevas (firestore.rules)."
            : err?.message || "No se pudo guardar.",
      });
    } finally {
      setTrabajando(false);
    }
  };

  const borrar = async (p) => {
    if (!window.confirm(`¿Borrar "${p.nombre}" de tu lista? Los mensajes ya enviados no se tocan.`)) {
      return;
    }

    try {
      await borrarPlantilla(p.id);
      if (p.id === plantillaId) setPlantillaId(null);
      if (p.id === vistaId) setVistaId(null);
    } catch (err) {
      console.error("[mensajes] No se pudo borrar:", err);
      setAviso({ tipo: "error", texto: "No se pudo borrar el mensaje guardado." });
    }
  };

  const enviar = async () => {
    setAviso(null);

    const n = destinosElegidos.length;
    if (n === 0) {
      setAviso({ tipo: "error", texto: "Elegí al menos un chat." });
      return;
    }

    if (
      n > 1 &&
      !window.confirm(
        `Vas a enviar este mensaje (${etiquetaModo(rico.tipo)}) a ${n} chats. ¿Enviar?`
      )
    ) {
      return;
    }

    setTrabajando(true);

    try {
      const enviados = await enviarRico({
        destinos: destinosElegidos.map((c) => ({
          id: c.id,
          ultimoMensajeEn: c.ultimoMensajeEn,
        })),
        rico,
        marcarRespondido: destino === "este" && marcarRespondido,
        // Todo lo que no es "este chat" queda anotado en la pestaña Enviados
        registrar: destino !== "este",
        nombre: nombre.trim(),
      });

      setAviso({
        tipo: "ok",
        texto:
          enviados === 1
            ? "Mensaje enviado."
            : `Mensaje enviado a ${enviados} chats. Quedó anotado en "Enviados".`,
      });
    } catch (err) {
      console.error("[mensajes] No se pudo enviar:", err);
      setAviso({
        tipo: "error",
        texto:
          err?.code === "permission-denied"
            ? "Sin permiso para enviar. Publicá las reglas nuevas e iniciá sesión."
            : err?.message || "No se pudo enviar el mensaje.",
      });
    } finally {
      setTrabajando(false);
    }
  };

  const alternarElegido = (id) =>
    setElegidos((prev) => {
      const sig = new Set(prev);
      if (sig.has(id)) sig.delete(id);
      else sig.add(id);
      return sig;
    });

  // Qué se dibuja a la derecha según la pestaña
  const vistaGuardado =
    pestana === "guardados" && vistaId
      ? plantillas.find((p) => p.id === vistaId)?.rico ?? null
      : null;

  const vistaEnvio =
    pestana === "enviados" && vistaEnvioId
      ? envios.find((e) => e.id === vistaEnvioId)?.rico ?? null
      : null;

  const vista = vistaGuardado ?? vistaEnvio;
  const ricoVista = vista ? completarRico(vista) : limpiarRico(rico);

  const hayVista = pestana === "crear" ? !vacio : !!vista;

  const textoSinVista =
    pestana === "crear"
      ? "Completá los campos para ver la vista previa."
      : pestana === "guardados"
      ? "Elegí un mensaje guardado."
      : "Elegí un envío para ver cómo quedó.";

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <div
      className="mr-fondo"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !trabajando) onClose?.();
      }}
    >
      <div className="mr-modal" role="dialog" aria-modal="true" aria-label="Mensaje personalizado">
        <div className="mr-modal-cab">
          <h2>
            {soloGuardar ? "Mensajes personalizados" : "Mensaje personalizado"}
          </h2>
          <button type="button" className="mr-cerrar" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="mr-tabs">
          <button
            type="button"
            className={`mr-tab${pestana === "crear" ? " activa" : ""}`}
            onClick={() => setPestana("crear")}
          >
            Crear / editar
          </button>
          <button
            type="button"
            className={`mr-tab${pestana === "guardados" ? " activa" : ""}`}
            onClick={() => setPestana("guardados")}
          >
            Guardados ({plantillas.length})
          </button>
          <button
            type="button"
            className={`mr-tab${pestana === "enviados" ? " activa" : ""}`}
            onClick={() => setPestana("enviados")}
          >
            Enviados ({envios.length})
          </button>
        </div>

        <div className="mr-modal-cuerpo">
          {/* ---------------- IZQUIERDA ---------------- */}
          <div className="mr-col">
            {pestana === "crear" && (
              <>
                <GuiaFormatos />

                <div className="mr-modos">
                  {MODOS_MENSAJE.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`mr-modo${rico.tipo === m.id ? " activo" : ""}`}
                      onClick={() => cambiarModo(m.id)}
                    >
                      {m.icono} {m.etiqueta}
                    </button>
                  ))}
                </div>

                <p className="mr-modo-ayuda">
                  {MODOS_MENSAJE.find((m) => m.id === rico.tipo)?.ayuda}
                </p>

                <FormularioMensaje rico={rico} onChange={setRico} />

                <h4 className="mr-seccion-titulo">Guardar en mi lista</h4>

                <label className="mr-campo">
                  <span className="mr-campo-etiqueta">
                    Nombre (también es el título en "Enviados")
                  </span>
                  <input
                    type="text"
                    className="mr-input"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej.: ¿Te resulta fácil crear tu currículum?"
                    maxLength={80}
                  />
                </label>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  <button
                    type="button"
                    className="mr-btn"
                    onClick={() => guardar(false)}
                    disabled={trabajando || !!problema || !nombre.trim()}
                  >
                    {plantillaId ? "Guardar cambios" : "Guardar"}
                  </button>

                  {plantillaId && (
                    <button
                      type="button"
                      className="mr-btn"
                      onClick={() => guardar(true)}
                      disabled={trabajando || !!problema || !nombre.trim()}
                    >
                      Guardar como nuevo
                    </button>
                  )}

                  <button
                    type="button"
                    className="mr-btn"
                    onClick={nuevo}
                    disabled={trabajando}
                  >
                    Vaciar
                  </button>
                </div>

                {!soloGuardar && (
                  <>
                    <h4 className="mr-seccion-titulo">Enviar a</h4>

                    <div className="mr-destinos">
                      {chatActual && (
                        <label className="mr-radio">
                          <input
                            type="radio"
                            name="destino"
                            checked={destino === "este"}
                            onChange={() => setDestino("este")}
                          />
                          Este chat ({etiquetaChat(chatActual)})
                        </label>
                      )}

                      <label className="mr-radio">
                        <input
                          type="radio"
                          name="destino"
                          checked={destino === "todos"}
                          onChange={() => setDestino("todos")}
                        />
                        Todos los chats ({chats.length})
                      </label>

                      <label className="mr-radio">
                        <input
                          type="radio"
                          name="destino"
                          checked={destino === "elegir"}
                          onChange={() => setDestino("elegir")}
                        />
                        Elegir chats ({elegidos.size} elegidos)
                      </label>
                    </div>

                    {destino === "elegir" && (
                      <>
                        <input
                          type="search"
                          className="mr-input"
                          style={{ marginBottom: 6 }}
                          placeholder="Buscar chat o nombre…"
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                        />

                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                          <button
                            type="button"
                            className="mr-btn mr-btn-chico"
                            onClick={() =>
                              setElegidos(new Set(chatsFiltrados.map((c) => c.id)))
                            }
                          >
                            Marcar visibles
                          </button>
                          <button
                            type="button"
                            className="mr-btn mr-btn-chico"
                            onClick={() => setElegidos(new Set())}
                          >
                            Quitar todos
                          </button>
                        </div>

                        <div className="mr-lista-chats">
                          {chatsFiltrados.length === 0 && (
                            <p style={{ margin: 6, fontSize: 13, opacity: 0.7 }}>
                              No hay chats.
                            </p>
                          )}

                          {chatsFiltrados.map((c) => (
                            <label key={c.id}>
                              <input
                                type="checkbox"
                                checked={elegidos.has(c.id)}
                                onChange={() => alternarElegido(c.id)}
                              />
                              {etiquetaChat(c)}
                              {c.enLinea ? " 🟢" : ""}
                            </label>
                          ))}
                        </div>
                      </>
                    )}

                    {destino === "este" && (
                      <label className="mr-radio" style={{ marginTop: 6 }}>
                        <input
                          type="checkbox"
                          checked={marcarRespondido}
                          onChange={(e) => setMarcarRespondido(e.target.checked)}
                        />
                        Marcar el chat como respondido
                      </label>
                    )}

                    {destino !== "este" && (
                      <p className="mr-modo-ayuda" style={{ margin: "8px 0 0" }}>
                        Este envío queda anotado en la pestaña "Enviados" para
                        poder borrarlo de todos los chats después.
                      </p>
                    )}
                  </>
                )}
              </>
            )}

            {pestana === "guardados" && (
              <>
                <p className="mr-modo-ayuda" style={{ margin: "0 0 10px" }}>
                  Tus mensajes guardados. Tocá uno para ver cómo queda.
                </p>

                {cargandoPlantillas && <p>Cargando…</p>}
                {errorPlantillas && <p className="mr-msg error">{errorPlantillas}</p>}

                {!cargandoPlantillas && plantillas.length === 0 && !errorPlantillas && (
                  <p style={{ opacity: 0.7 }}>
                    Todavía no guardaste ninguno. Creá uno en "Crear / editar".
                  </p>
                )}

                <div className="mr-guardados">
                  {plantillas.map((p) => (
                    <div
                      key={p.id}
                      className={`mr-guardado${p.id === vistaId ? " elegido" : ""}`}
                      onClick={() => setVistaId(p.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setVistaId(p.id);
                      }}
                    >
                      <div className="mr-guardado-info">
                        <strong>{p.nombre || "(sin nombre)"}</strong>
                        <small>
                          {etiquetaModo(p.modo)} · {p.rico ? resumenDe(p.rico).slice(0, 60) : ""}
                        </small>
                      </div>

                      <div className="mr-guardado-acciones">
                        <button
                          type="button"
                          className="mr-btn mr-btn-chico mr-btn-principal"
                          onClick={(e) => {
                            e.stopPropagation();
                            cargar(p);
                          }}
                        >
                          {soloGuardar ? "Editar" : "Cargar"}
                        </button>
                        <button
                          type="button"
                          className="mr-btn mr-btn-chico mr-btn-peligro"
                          onClick={(e) => {
                            e.stopPropagation();
                            borrar(p);
                          }}
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {pestana === "enviados" && (
              <>
                <p className="mr-modo-ayuda" style={{ margin: "0 0 10px" }}>
                  Mensajes que mandaste a varios chats. Tocá uno para ver cómo
                  quedó.
                </p>

                <ListaEnvios
                  envios={envios}
                  cargando={cargandoEnvios}
                  error={errorEnvios}
                  verId={vistaEnvioId}
                  onVer={setVistaEnvioId}
                />
              </>
            )}
          </div>

          {/* ---------------- DERECHA: VISTA PREVIA ---------------- */}
          <div className="mr-col">
            <h4 className="mr-seccion-titulo">Así se ve en la app</h4>

            {hayVista ? (
              <PreviewMensaje rico={ricoVista} conAvatar />
            ) : (
              <p style={{ fontSize: 13, opacity: 0.7 }}>{textoSinVista}</p>
            )}

            {pestana === "crear" && problema && !vacio && (
              <p className="mr-msg error">{problema}</p>
            )}

            <p style={{ fontSize: 11.5, opacity: 0.65, marginTop: 14 }}>
              Las encuestas arrancan con los votos iniciales que pongas; cada
              usuario suma sus votos en su teléfono.
            </p>
          </div>
        </div>

        <div className="mr-modal-pie">
          <div style={{ flex: 1, minWidth: 0 }}>
            {aviso && (
              <p className={`mr-msg ${aviso.tipo}`} style={{ margin: 0 }}>
                {aviso.texto}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="mr-btn" onClick={onClose} disabled={trabajando}>
              Cerrar
            </button>

            {!soloGuardar && pestana === "crear" && (
              <button
                type="button"
                className="mr-btn mr-btn-principal"
                onClick={enviar}
                disabled={trabajando || !!problema || destinosElegidos.length === 0}
              >
                {trabajando
                  ? "Enviando…"
                  : destinosElegidos.length > 1
                  ? `Enviar a ${destinosElegidos.length} chats`
                  : "Enviar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
