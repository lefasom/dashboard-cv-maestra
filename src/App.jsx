// src/App.jsx
// Vite + React — Dashboard CV Master

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./components/Login";
import Estadisticas from "./secciones/Estadisticas";
import Uso from "./secciones/Uso";
import Onboarding from "./secciones/Onboarding";
import Perfiles from "./secciones/Perfiles";
import Resenas from "./secciones/Resenas";
import Versiones from "./secciones/Versiones";
import "./estilos.css";

const SECCIONES = [
  { id: "estadisticas", label: "Estadísticas", componente: Estadisticas },
  { id: "uso", label: "Uso", componente: Uso },
  { id: "onboarding", label: "Onboarding", componente: Onboarding },
  { id: "perfiles", label: "Perfiles", componente: Perfiles },
  { id: "resenas", label: "Reseñas", componente: Resenas },
  { id: "versiones", label: "Versiones", componente: Versiones },
];

function Dashboard({ usuario }) {
  const [seccion, setSeccion] = useState("estadisticas");
  const Actual = SECCIONES.find((s) => s.id === seccion).componente;

  return (
    <div className="contenedor">
      <header>
        <h1>Dash CV Master</h1>

        <nav className="menu">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={seccion === s.id ? "tab activa" : "tab"}
              onClick={() => setSeccion(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="usuario-caja">
          <span className="usuario">{usuario.email}</span>
          <button type="button" className="btn-claro" onClick={() => signOut(auth)}>
            Salir
          </button>
        </div>
      </header>

      <Actual />
    </div>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(undefined);

  useEffect(() => onAuthStateChanged(auth, (u) => setUsuario(u)), []);

  if (usuario === undefined) return <p className="cargando-app">Cargando…</p>;
  if (!usuario) return <Login />;

  return <Dashboard usuario={usuario} />;
}