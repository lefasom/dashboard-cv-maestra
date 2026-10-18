// src/hooks/useEventos.js
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

export default function useEventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const consulta = query(
      collection(db, "dashboard_events"),
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
  }, []);

  return { eventos, cargando, error };
}
