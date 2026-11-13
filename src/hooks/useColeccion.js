// src/hooks/useColeccion.js
// Lee una colección de eventos en tiempo real (los más recientes primero).
//
// AHORRO DE LECTURAS:
//   - Cada colección se escucha UNA sola vez por sesión. Antes, cada vez que
//     cambiabas de pestaña el componente se volvía a montar y se releían hasta
//     LIMITE_EVENTOS documentos. Ahora el listener queda abierto y todas las
//     pestañas comparten los mismos datos.
//   - Después de la carga inicial, Firestore solo cobra los documentos nuevos
//     o modificados (no vuelve a leer los 5000).
//   - Al cerrar sesión se cierran todos los listeners y se limpia la memoria.
//   - Total real (doc 49, punto 3.2): solo si la colección llega al tope de
//     LIMITE_EVENTOS se pide UNA vez getCountFromServer (1 lectura cada 1.000
//     documentos, sin bajarlos). Por debajo del tope cuesta 0 lecturas.
import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { LIMITE_EVENTOS } from "../config";

// total: cantidad real en el servidor (null mientras no se llegó al tope)
const ESTADO_INICIAL = { eventos: [], cargando: true, error: "", total: null };

// nombre de colección -> { estado, oyentes, cancelar }
const almacen = new Map();

const entradaDe = (nombre) => {
  if (!almacen.has(nombre)) {
    almacen.set(nombre, {
      estado: ESTADO_INICIAL,
      oyentes: new Set(),
      cancelar: null,
    });
  }

  return almacen.get(nombre);
};

const publicar = (entrada, cambios) => {
  entrada.estado = { ...entrada.estado, ...cambios };
  entrada.oyentes.forEach((aviso) => aviso());
};

// Abre el listener de la colección si todavía no está abierto
const iniciar = (nombre) => {
  const entrada = entradaDe(nombre);

  if (entrada.cancelar) return;

  const consulta = query(
    collection(db, nombre),
    orderBy("createdAt", "desc"),
    limit(LIMITE_EVENTOS)
  );

  entrada.cancelar = onSnapshot(
    consulta,
    (snap) => {
      publicar(entrada, {
        eventos: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
        cargando: false,
        error: "",
      });

      // Llegó al tope: se cuenta el total real una sola vez por sesión.
      if (snap.size >= LIMITE_EVENTOS && entrada.estado.total === null && !entrada.contando) {
        entrada.contando = true;
        getCountFromServer(collection(db, nombre))
          .then((res) => publicar(entrada, { total: res.data().count }))
          .catch((err) => console.error(`[${nombre}] No se pudo contar:`, err))
          .finally(() => {
            entrada.contando = false;
          });
      }
    },
    (err) => {
      // Si falla, se cierra para que se reintente al volver a abrir la pestaña
      publicar(entrada, { cargando: false, error: err.message });
      entrada.cancelar?.();
      entrada.cancelar = null;
    }
  );
};

// Al cerrar sesión: se cortan los listeners y se borran los datos de memoria
onAuthStateChanged(auth, (usuario) => {
  if (usuario) return;

  almacen.forEach((entrada) => {
    entrada.cancelar?.();
    entrada.cancelar = null;
    publicar(entrada, ESTADO_INICIAL);
  });
});

export default function useColeccion(nombreColeccion) {
  const entrada = entradaDe(nombreColeccion);

  // Funciones estables por colección (si no, React se resuscribe en cada render)
  const suscribir = useMemo(
    () => (aviso) => {
      entrada.oyentes.add(aviso);
      return () => entrada.oyentes.delete(aviso);
    },
    [entrada]
  );

  const leer = useMemo(() => () => entrada.estado, [entrada]);

  // Arranca el listener la primera vez; las siguientes no hace nada
  useEffect(() => {
    iniciar(nombreColeccion);
  }, [nombreColeccion]);

  return useSyncExternalStore(suscribir, leer);
}