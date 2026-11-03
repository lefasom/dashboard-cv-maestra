// src/hooks/useMensajesRicos.js
//
// usePlantillas -> mensajes guardados con nombre (dashboard_mensajes_plantillas)
// useEnvios     -> registro de envíos masivos (dashboard_mensajes_envios)
// useModulos    -> interruptores de módulos y de demostración
//                  (dashboard_config/mensajes_modulos)
//
// usePlantillas y useEnvios usan una escucha COMPARTIDA (ver
// escuchaCompartida.js): se lee una sola vez aunque varios componentes las
// usen, y se mantiene 5 minutos después de cerrar el modal.

import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import {
  COLECCIONES,
  DOC_MENSAJES_MODULOS,
  LIMITE_ENVIOS,
  LIMITE_PLANTILLAS,
  MODULOS_POR_DEFECTO,
} from "../config";
import { db } from "../firebase";
import { crearEscuchaCompartida } from "./escuchaCompartida";

const mensajeError = (err, queLee) =>
  err?.code === "permission-denied"
    ? `Sin permiso para leer ${queLee}. Publicá las reglas nuevas e iniciá sesión.`
    : `No se pudieron cargar ${queLee}.`;

// ------------------------------------------------------------
// GUARDADOS
// ------------------------------------------------------------

const usePlantillasStore = crearEscuchaCompartida(
  (emitir, caido) => {
    const consulta = query(
      collection(db, COLECCIONES.MENSAJES_PLANTILLAS),
      orderBy("actualizadoEn", "desc"),
      limit(LIMITE_PLANTILLAS)
    );

    return onSnapshot(
      consulta,
      (snapshot) =>
        emitir({
          plantillas: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              nombre: String(data.nombre ?? ""),
              modo: String(data.modo ?? data.rico?.tipo ?? "texto"),
              rico: data.rico ?? null,
              actualizadoEn: Number(data.actualizadoEn) || 0,
            };
          }),
          cargando: false,
          error: null,
        }),
      (err) => {
        console.error("[mensajes] Error leyendo guardados:", err);
        emitir({
          plantillas: [],
          cargando: false,
          error: mensajeError(err, "los mensajes guardados"),
        });
        caido();
      }
    );
  },
  { plantillas: [], cargando: true, error: null }
);

export function usePlantillas() {
  return usePlantillasStore();
}

// ------------------------------------------------------------
// ENVÍOS MASIVOS
// ------------------------------------------------------------

const useEnviosStore = crearEscuchaCompartida(
  (emitir, caido) => {
    const consulta = query(
      collection(db, COLECCIONES.MENSAJES_ENVIOS),
      orderBy("enviadoEn", "desc"),
      limit(LIMITE_ENVIOS)
    );

    return onSnapshot(
      consulta,
      (snapshot) =>
        emitir({
          envios: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              nombre: String(data.nombre ?? ""),
              modo: String(data.modo ?? data.rico?.tipo ?? "texto"),
              rico: data.rico ?? null,
              chats: Array.isArray(data.chats) ? data.chats : [],
              total: Number(data.total) || 0,
              enviados: Number(data.enviados) || 0,
              estado: String(data.estado ?? "enviado"),
              enviadoEn: Number(data.enviadoEn) || 0,
              eliminadoEn: Number(data.eliminadoEn) || 0,
            };
          }),
          cargando: false,
          error: null,
        }),
      (err) => {
        console.error("[mensajes] Error leyendo envíos:", err);
        emitir({
          envios: [],
          cargando: false,
          error: mensajeError(err, "los envíos masivos"),
        });
        caido();
      }
    );
  },
  { envios: [], cargando: true, error: null }
);

export function useEnvios() {
  return useEnviosStore();
}

// ------------------------------------------------------------
// MÓDULOS
// ------------------------------------------------------------

export function useModulos() {
  const [estado, setEstado] = useState({
    modulos: MODULOS_POR_DEFECTO,
    mostrarDemo: true,
    actualizadoEn: 0,
    existe: false,
    cargando: true,
    error: null,
  });

  useEffect(() => {
    return onSnapshot(
      doc(db, COLECCIONES.CONFIG, DOC_MENSAJES_MODULOS),
      (snap) => {
        if (!snap.exists()) {
          setEstado((e) => ({
            ...e,
            modulos: MODULOS_POR_DEFECTO,
            mostrarDemo: true,
            actualizadoEn: 0,
            existe: false,
            cargando: false,
            error: null,
          }));
          return;
        }

        const data = snap.data();
        const modulos = {};

        Object.keys(MODULOS_POR_DEFECTO).forEach((k) => {
          const v = data.modulos?.[k];
          modulos[k] =
            v === 0 || v === false
              ? 0
              : v === 1 || v === true
              ? 1
              : MODULOS_POR_DEFECTO[k];
        });

        setEstado({
          modulos,
          mostrarDemo: data.mostrarDemo !== false,
          actualizadoEn: Number(data.actualizadoEn) || 0,
          existe: true,
          cargando: false,
          error: null,
        });
      },
      (err) => {
        console.error("[mensajes] Error leyendo módulos:", err);
        setEstado((e) => ({
          ...e,
          cargando: false,
          error:
            err?.code === "permission-denied"
              ? "Sin permiso para leer la configuración. Publicá las reglas nuevas e iniciá sesión."
              : "No se pudo leer la configuración.",
        }));
      }
    );
  }, []);

  return estado;
}
