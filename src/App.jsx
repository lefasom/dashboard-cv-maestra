// src/App.jsx
// Vite + React — Dashboard CV Master

import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";

import Login from "./components/Login";
import { auth } from "./firebase";
import useChats from "./hooks/useChats";
import Chat from "./secciones/Chat";
import Datos from "./secciones/Datos";
import Distribucion from "./secciones/Distribucion";
import Estadisticas from "./secciones/Estadisticas";
import Onboarding from "./secciones/Onboarding";
import Perfiles from "./secciones/Perfiles";
import Resenas from "./secciones/Resenas";
import Uso from "./secciones/Uso";
import Valoracion from "./secciones/Valoracion";
import Versiones from "./secciones/Versiones";
import "./estilos.css";

const SECCIONES = [
  { id: "estadisticas", label: "Estadísticas", componente: Estadisticas },
  { id: "uso", label: "Uso", componente: Uso },
  { id: "onboarding", label: "Onboarding", componente: Onboarding },
  { id: "perfiles", label: "Perfiles", componente: Perfiles },
  { id: "resenas", label: "Reseñas", componente: Resenas },
  { id: "chat", label: "Chat", componente: Chat },
  { id: "versiones", label: "Versiones", componente: Versiones },
  { id: "distribucion", label: "Distribución", componente: Distribucion },
  { id: "datos", label: "Datos", componente: Datos },
  { id: "valoracion", label: "Valoracion", componente: Valoracion },
];

function Dashboard({ usuario }) {
  const [seccion, setSeccion] = useState("estadisticas");
  const Actual = SECCIONES.find((s) => s.id === seccion).componente;

  // La lista de chats vive acá para que la pestaña "Chat" muestre el
  // globito de "sin responder" aunque estés en otra sección
  const chats = useChats();
  const sinResponder = chats.resumen.sinResponder;

  return (
    <div className="app">
      <header className="encabezado">
        <div className="encabezado-in">
          <h1>Dash CV Master</h1>

          <div className="usuario-caja">
            <span className="usuario">{usuario.email}</span>
            <button
              type="button"
              className="btn-header"
              onClick={() => signOut(auth)}
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="contenedor">
        <nav className="menu">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={seccion === s.id ? "tab activa" : "tab"}
              onClick={() => setSeccion(s.id)}
            >
              {s.label}

              {s.id === "chat" && sinResponder > 0 && (
                <span className="tab-badge">
                  {sinResponder > 99 ? "99+" : sinResponder}
                </span>
              )}
            </button>
          ))}
        </nav>

        <main className="contenido">
          <Actual chats={chats} />
        </main>
      </div>
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