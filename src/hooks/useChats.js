// src/hooks/useChats.js
//
// Escucha en tiempo real la lista de chats (uno por usuario de la app).
//
// Cada chat trae:
//   id, numero (Chat 1, Chat 2… por orden de aparición), idCorto,
//   plataforma, idioma, ultimoMensaje, ultimoMensajeEn,
//   ultimaVez / ultimaVezApp,
//   activo       -> está en la pestaña Ayuda ahora (enChat)
//   enApp        -> está dentro de la app ahora (en cualquier pantalla)
//   enLinea      -> enApp o activo
//   sinResponder -> el usuario escribió y vos todavía no respondiste
//   sinLeer      -> el usuario escribió y vos todavía no abriste el chat
//
// Sin WebSocket: la app avisa presencia cada 60 s mientras está abierta.
// Un usuario cuenta como "ahora" si el aviso tiene menos de ACTIVO_MS y la
// app no avisó que salió (enChat / enApp = false).
//
// Orden de la lista: primero los SIN RESPONDER, después el resto por
// actividad (último mensaje o respuesta).

import { collection, limit, onSnapshot, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { ACTIVO_MS, COLECCIONES, LIMITE_CHATS } from "../config";
import { db } from "../firebase";

const aMs = (valor) =>
  typeof valor?.toMillis === "function" ? valor.toMillis() : 0;

const aNumero = (valor) => {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export default function useChats() {
  const [docs, setDocs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Para que "ahora" se actualice solo aunque no llegue ningún dato nuevo
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 15000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    // Sin orderBy: los usuarios que solo están en la app todavía no tienen
    // `ultimaVez` y quedarían afuera. El orden se arma abajo.
    const consulta = query(
      collection(db, COLECCIONES.CHATS),
      limit(LIMITE_CHATS)
    );

    return onSnapshot(
      consulta,
      (snapshot) => {
        setDocs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setError(null);
        setCargando(false);
      },
      (err) => {
        console.error("[chats] Error leyendo Firestore:", err);

        setError(
          err?.code === "permission-denied"
            ? "No tenés permiso para ver los chats. Publicá las reglas nuevas e iniciá sesión."
            : "No se pudieron cargar los chats."
        );
        setCargando(false);
      }
    );
  }, []);

  const chats = useMemo(() => {
    const base = docs.map((d) => {
      const ultimaVez = aMs(d.ultimaVez);
      const ultimaVezApp = aMs(d.ultimaVezApp);
      const creadoEn = aMs(d.creadoEn) || ultimaVez || ultimaVezApp;
      const ultimoMensajeEn = aNumero(d.ultimoMensajeEn);
      const leyoHasta = aNumero(d.soporteLeyoHasta);
      const respondioEn = aNumero(d.ultimaRespuestaEn);

      const enChat =
        ultimaVez > 0 && ahora - ultimaVez <= ACTIVO_MS && d.enChat !== false;

      const enApp =
        ultimaVezApp > 0 &&
        ahora - ultimaVezApp <= ACTIVO_MS &&
        d.enApp !== false;

      return {
        id: d.id,
        idCorto: d.id.slice(-6),
        plataforma: d.plataforma ?? "",
        idioma: d.idioma ?? "",
        ultimoMensaje: d.ultimoMensaje ?? "",
        ultimoMensajeEn,
        ultimaVez,
        ultimaVezApp,
        ultimaConexion: Math.max(ultimaVez, ultimaVezApp),
        creadoEn,
        activo: enChat,
        enApp: enApp || enChat,
        enLinea: enApp || enChat,
        sinLeer: ultimoMensajeEn > leyoHasta,
        sinResponder: ultimoMensajeEn > respondioEn,
        actividad: Math.max(ultimoMensajeEn, respondioEn, creadoEn),
      };
    });

    // Numeración estable: Chat 1 es el primer usuario que apareció
    [...base]
      .sort((a, b) => a.creadoEn - b.creadoEn)
      .forEach((c, i) => {
        c.numero = i + 1;
      });

    // Sin responder primero; después, lo más reciente
    return base.sort(
      (a, b) =>
        Number(b.sinResponder) - Number(a.sinResponder) ||
        b.actividad - a.actividad
    );
  }, [docs, ahora]);

  const resumen = useMemo(
    () => ({
      total: chats.length,
      activos: chats.filter((c) => c.activo).length,
      enLinea: chats.filter((c) => c.enLinea).length,
      sinLeer: chats.filter((c) => c.sinLeer).length,
      sinResponder: chats.filter((c) => c.sinResponder).length,
    }),
    [chats]
  );

  return { chats, resumen, cargando, error };
}
