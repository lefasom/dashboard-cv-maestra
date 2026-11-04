
// src/App.jsx
// Vite + React — CV Belgrano
//
// RUTAS:
//   /                  -> Sitio público (Landing Page)
//   /administrador     -> Panel administrativo
//
// El administrador conserva Firebase Authentication
// y todas las secciones existentes.
//
// No requiere react-router-dom.

import { onAuthStateChanged, signOut } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

import Login from "./components/Login";
import LandingPage from "../LandingPage";

import { auth } from "./firebase";
import useChats from "./hooks/useChats";

import Chat from "./secciones/Chat";
import Datos from "./secciones/Datos";
import Distribucion from "./secciones/Distribucion";
import MensajesPersonalizados from "./secciones/MensajesPersonalizados";
import Estadisticas from "./secciones/Estadisticas";
import Onboarding from "./secciones/Onboarding";
import Resenas from "./secciones/Resenas";
import Uso from "./secciones/Uso";
import Valoracion from "./secciones/Valoracion";
import Versiones from "./secciones/Versiones";

import "./estilos.css";

// --------------------------------------------------
// CONFIGURACIÓN DE RUTAS
// --------------------------------------------------

const RUTA_PUBLICA = "/";
const RUTA_ADMIN = "/administrador";

function obtenerRuta() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  return pathname.toLowerCase();
}

// --------------------------------------------------
// DASHBOARD ADMINISTRATIVO
// --------------------------------------------------

const SECCIONES = [
  { id: "estadisticas", label: "Estadísticas", componente: Estadisticas },
  { id: "uso", label: "Uso", componente: Uso },
  { id: "onboarding", label: "Onboarding", componente: Onboarding },
  { id: "resenas", label: "Reseñas", componente: Resenas },
  { id: "chat", label: "Chat", componente: Chat },
  {
    id: "mensajes",
    label: "Mensajes personalizados",
    componente: MensajesPersonalizados,
  },
  { id: "versiones", label: "Versiones", componente: Versiones },
  { id: "distribucion", label: "Distribución", componente: Distribucion },
  { id: "valoracion", label: "Valoración", componente: Valoracion },
  { id: "historial", label: "Historial", componente: Datos },
];

function Dashboard({ usuario, navegar }) {
  const [seccion, setSeccion] = useState("estadisticas");
  const [chatIdAbrir, setChatIdAbrir] = useState(null);

  const Actual =
    SECCIONES.find((s) => s.id === seccion)?.componente ?? Estadisticas;

  const chats = useChats();
  const sinResponder = chats.resumen.sinResponder;

  const irAlChat = useCallback((chatId) => {
    setChatIdAbrir(chatId);
    setSeccion("chat");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const alChatAbierto = useCallback(() => {
    setChatIdAbrir(null);
  }, []);

  return (
    <div className="app">
      <header className="encabezado">
        <div className="encabezado-in">
          <h1>Dashboard CV Belgrano</h1>

          <div className="usuario-caja">
            <button
              type="button"
              className="btn-header"
              onClick={() => navegar(RUTA_PUBLICA)}
            >
              Ver sitio web
            </button>

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
          <Actual
            chats={chats}
            onIrAlChat={irAlChat}
            chatIdAbrir={chatIdAbrir}
            onChatAbierto={alChatAbierto}
          />
        </main>
      </div>
    </div>
  );
}

// --------------------------------------------------
// APLICACIÓN PRINCIPAL / ROUTER
// --------------------------------------------------

export default function App() {
  const [ruta, setRuta] = useState(obtenerRuta);
  const [usuario, setUsuario] = useState(undefined);

  // Navegación interna sin recargar la página.
  const navegar = useCallback((destino) => {
    window.history.pushState({}, "", destino);
    setRuta(obtenerRuta());
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Detectar atrás / adelante del navegador.
  useEffect(() => {
    const manejarHistorial = () => {
      setRuta(obtenerRuta());
    };

    window.addEventListener("popstate", manejarHistorial);

    return () => {
      window.removeEventListener("popstate", manejarHistorial);
    };
  }, []);

  // Mantener Firebase Authentication.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUsuario(u);
    });

    return unsubscribe;
  }, []);

  // Cualquier ruta desconocida vuelve al sitio público.
  useEffect(() => {
    if (ruta !== RUTA_PUBLICA && ruta !== RUTA_ADMIN) {
      window.history.replaceState({}, "", RUTA_PUBLICA);
      setRuta(RUTA_PUBLICA);
    }
  }, [ruta]);

  // ------------------------------------------------
  // SITIO PÚBLICO
  // ------------------------------------------------

  if (ruta === RUTA_PUBLICA) {
    return <LandingPage />;
  }

  // ------------------------------------------------
  // ADMINISTRADOR
  // ------------------------------------------------

  if (ruta === RUTA_ADMIN) {
    if (usuario === undefined) {
      return <p className="cargando-app">Cargando administrador…</p>;
    }

    if (!usuario) {
      return <Login />;
    }

    return <Dashboard usuario={usuario} navegar={navegar} />;
  }

  return null;
}
