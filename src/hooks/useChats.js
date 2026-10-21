// src/hooks/useChats.js
//
// Escucha en tiempo real la lista de chats (uno por usuario de la app).
//
// Cada chat trae:
//   id, numero (Chat 1, Chat 2… por orden de aparición), idCorto,
//   plataforma, idioma, ultimoMensaje, ultimoMensajeEn, ultimaVez,
//   activo     -> la app avisó presencia hace menos de ACTIVO_MS
//   sinLeer    -> el usuario escribió y vos todavía no abriste el chat
//
// "En el chat ahora" = el usuario tiene abierta la pestaña Ayuda de la app
// (la app avisa presencia cada 60 s solo mientras está ahí).

import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
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

  // Para que "activo" se actualice solo aunque no llegue ningún dato nuevo
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 15000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const consulta = query(
      collection(db, COLECCIONES.CHATS),
      orderBy("ultimaVez", "desc"),
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
      const creadoEn = aMs(d.creadoEn) || ultimaVez;
      const ultimoMensajeEn = aNumero(d.ultimoMensajeEn);
      const leyoHasta = aNumero(d.soporteLeyoHasta);

      return {
        id: d.id,
        idCorto: d.id.slice(-6),
        plataforma: d.plataforma ?? "",
        idioma: d.idioma ?? "",
        ultimoMensaje: d.ultimoMensaje ?? "",
        ultimoMensajeEn,
        ultimaVez,
        creadoEn,
        activo: ultimaVez > 0 && ahora - ultimaVez <= ACTIVO_MS,
        sinLeer: ultimoMensajeEn > leyoHasta,
        actividad: Math.max(ultimoMensajeEn, ultimaVez),
      };
    });

    // Numeración estable: Chat 1 es el primer usuario que apareció
    [...base]
      .sort((a, b) => a.creadoEn - b.creadoEn)
      .forEach((c, i) => {
        c.numero = i + 1;
      });

    return base.sort((a, b) => b.actividad - a.actividad);
  }, [docs, ahora]);

  const resumen = useMemo(
    () => ({
      total: chats.length,
      activos: chats.filter((c) => c.activo).length,
      sinLeer: chats.filter((c) => c.sinLeer).length,
    }),
    [chats]
  );

  return { chats, resumen, cargando, error };
}
