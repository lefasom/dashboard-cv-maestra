// src/hooks/useColeccion.js
// Lee una colección de eventos en tiempo real (los más recientes primero).
import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import { LIMITE_EVENTOS } from "../config";

export default function useColeccion(nombreColeccion) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    setError("");

    const consulta = query(
      collection(db, nombreColeccion),
      orderBy("createdAt", "desc"),
      limit(LIMITE_EVENTOS)
    );

    return onSnapshot(
      consulta,
      (snap) => {
        setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setCargando(false);
      },
      (err) => {
        setError(err.message);
        setCargando(false);
      }
    );
  }, [nombreColeccion]);

  return { eventos, cargando, error };
}
