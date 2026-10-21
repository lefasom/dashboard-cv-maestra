// src/secciones/Chat.jsx  (Vite + React — Dashboard CV Master)
//
// Chat de ayuda con los usuarios de la app.
//
//   - Izquierda: un chat por usuario (Chat 1, Chat 2…), con su ID corto,
//     si está en el chat ahora, el último mensaje y si hay algo sin leer.
//   - Derecha: la conversación, estilo WhatsApp. Escribís y respondés.
//
// Al abrir un chat se escribe chats/{id}.soporteLeyoHasta: la app lo usa
// para mostrarle al usuario el doble tilde de "leído".
//
// Requiere sesión iniciada y las reglas nuevas de firestore.rules.

import {
  addDoc,
  collection,
  doc,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";

import Resumen from "../components/Resumen";
import {
  COLECCIONES,
  LIMITE_MENSAJES_CHAT,
  LIMITE_TEXTO_RESPUESTA,
} from "../config";
import { db } from "../firebase";

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

  const finRef = useRef(null);

  const seleccionado = useMemo(
    () => lista.find((c) => c.id === seleccionId) ?? null,
    [lista, seleccionId]
  );

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

  // Baja solo hasta el último mensaje
  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes, seleccionId]);

  // Marcar como leído: el usuario ve el doble tilde en su app.
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

  const enviar = async () => {
    const limpio = texto.trim().slice(0, LIMITE_TEXTO_RESPUESTA);
    if (!limpio || !seleccionId || enviando) return;

    setEnviando(true);
    setErrorEnvio(null);

    try {
      await addDoc(collection(db, COLECCIONES.CHATS, seleccionId, "messages"), {
        de: "soporte",
        texto: limpio,
        enviadoEn: Date.now(),
        createdAt: serverTimestamp(),
      });

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

  return (
    <>
      {cargando && <p className="estado-carga">Cargando…</p>}
      {error && <p className="error">Error: {error}</p>}

      <Resumen
        tarjetas={[
          { label: "En el chat ahora", valor: resumen?.activos ?? 0 },
          { label: "Chats", valor: resumen?.total ?? 0 },
          { label: "Sin responder", valor: resumen?.sinLeer ?? 0 },
        ]}
      />

      <section
        className={`panel chat-panel${seleccionId ? " con-seleccion" : ""}`}
      >
        {/* ---------------- LISTA DE CHATS ---------------- */}
        <aside className="chat-lista">
          <div className="panel-head">
            <h2>
              Chats <span className="contador">{lista.length}</span>
            </h2>
          </div>

          <div className="scroll chat-lista-scroll">
            {!cargando && lista.length === 0 && (
              <p className="vacio">Todavía no hay chats.</p>
            )}

            {lista.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chat-item${c.id === seleccionId ? " activo" : ""}`}
                onClick={() => setSeleccionId(c.id)}
              >
                <span className="chat-avatar">
                  {c.numero}
                  {c.activo && <span className="punto-en-linea" />}
                </span>

                <span className="chat-item-texto">
                  <span className="chat-item-fila">
                    <strong>Chat {c.numero}</strong>
                    <span
                      className={`chat-item-hora${c.sinLeer ? " nuevo" : ""}`}
                    >
                      {formatoLista(c.actividad)}
                    </span>
                  </span>

                  <span className="chat-item-fila">
                    <span className="chat-item-preview">
                      {c.ultimoMensaje ||
                        (c.activo ? "En el chat ahora" : `ID …${c.idCorto}`)}
                    </span>
                    {c.sinLeer && <span className="chat-nuevo">1</span>}
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
                  {seleccionado.activo && <span className="punto-en-linea" />}
                </div>

                <div className="chat-cab-texto">
                  <strong>Chat {seleccionado.numero}</strong>
                  <span>
                    {seleccionado.activo
                      ? "En el chat ahora"
                      : `Última vez ${hace(seleccionado.ultimaVez)}`}
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

                {items.map((item) =>
                  item.tipo === "fecha" ? (
                    <div className="chat-fecha" key={item.key}>
                      <span>{item.texto}</span>
                    </div>
                  ) : (
                    <div
                      key={item.key}
                      className={`burbuja-fila ${item.mensaje.de}`}
                    >
                      <div className={`burbuja ${item.mensaje.de}`}>
                        <p>{item.mensaje.texto}</p>
                        <span className="burbuja-hora">
                          {formatoHora(item.mensaje.enviadoEn)}
                          {item.mensaje.de === "soporte" &&
                            (item.mensaje.pendiente ? " 🕓" : " ✓")}
                        </span>
                      </div>
                    </div>
                  )
                )}

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
    </>
  );
}
