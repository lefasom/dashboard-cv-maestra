// src/components/PreviewMensaje.jsx
//
// Dibuja un mensaje rico (texto, tarjeta, video, encuestas) parecido a como
// lo ve el usuario en la app. Se usa en la vista previa del editor, en la
// conversación del Chat y en la sección "Mensajes personalizados".
//
// Las reglas de formato son las MISMAS que TextoFormateado de la app:
//   *negrita*   **negrita grande**   ~cursiva~   {color:texto}

import "../estilos-mensajes.css";

export const COLORES_FORMATO = {
  rojo: "#DC2626",
  azul: "#2563EB",
  verde: "#16A34A",
  naranja: "#EA580C",
  morado: "#7C3AED",
};

const RX = /(\*\*[^*]+\*\*|\*[^*]+\*|~[^~]+~|\{[a-z]+:[^}]+\})/g;

function partes(texto, clave) {
  return String(texto ?? "")
    .split(RX)
    .filter((p) => p.length > 0)
    .map((p, i) => {
      const k = `${clave}-${i}`;

      if (p.startsWith("**") && p.endsWith("**") && p.length > 4) {
        return (
          <span key={k} className="fmt-grande">
            {partes(p.slice(2, -2), k)}
          </span>
        );
      }

      if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
        return <strong key={k}>{partes(p.slice(1, -1), k)}</strong>;
      }

      if (p.startsWith("~") && p.endsWith("~") && p.length > 2) {
        return <em key={k}>{partes(p.slice(1, -1), k)}</em>;
      }

      const c = p.match(/^\{([a-z]+):([^}]+)\}$/);

      if (c && COLORES_FORMATO[c[1]]) {
        return (
          <span
            key={k}
            style={{ color: COLORES_FORMATO[c[1]], fontWeight: 700 }}
          >
            {partes(c[2], k)}
          </span>
        );
      }

      return <span key={k}>{p}</span>;
    });
}

export function TextoFormato({ texto, className = "" }) {
  return <span className={`fmt ${className}`}>{partes(texto, "t")}</span>;
}

// ------------------------------------------------------------
// VIDEO
// ------------------------------------------------------------

const idYoutube = (url) => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    let id = null;

    if (host === "youtu.be") {
      id = u.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      id =
        u.searchParams.get("v") ??
        u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ??
        null;
    }

    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

const dominio = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

function Video({ rico }) {
  const id = idYoutube(rico.url);

  return (
    <div className="mr-media mr-video">
      <div className="mr-video-mini">
        {id ? (
          <img
            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
          />
        ) : (
          <span>Vista previa no disponible</span>
        )}
        {id && <span className="mr-play">▶</span>}
      </div>

      <div className="mr-video-info">
        <strong>{rico.titulo || "Video"}</strong>
        {rico.descripcion && <p>{rico.descripcion}</p>}
        <small>{dominio(rico.url)}</small>

        <div className="mr-video-botones">
          {id && <span className="mr-chip mr-chip-acento">Ver aquí</span>}
          <span className="mr-chip">Abrir enlace</span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// ENCUESTAS (solo lectura: valores iniciales)
// ------------------------------------------------------------

function EncuestaLikes({ rico }) {
  const v = Array.isArray(rico.votos) ? rico.votos : [0, 0];
  const total = (v[0] || 0) + (v[1] || 0);
  const pct = (n) => (total === 0 ? 0 : Math.round(((n || 0) / total) * 100));

  return (
    <div className="mr-media mr-encuesta">
      <strong className="mr-pregunta">
        <TextoFormato texto={rico.pregunta} />
      </strong>

      <div className="mr-likes">
        <div className="mr-like">
          <span style={{ color: "#16A34A" }}>👍</span>
          <b style={{ color: "#16A34A" }}>{pct(v[0])}%</b>
          <small>Me gusta</small>
        </div>
        <div className="mr-like">
          <span style={{ color: "#DC2626" }}>👎</span>
          <b style={{ color: "#DC2626" }}>{pct(v[1])}%</b>
          <small>No me gusta</small>
        </div>
      </div>

      <div className="mr-barra-likes">
        <div style={{ width: `${pct(v[0])}%`, background: "#16A34A" }} />
        <div style={{ flex: 1, background: total ? "#DC2626" : "transparent" }} />
      </div>

      <small className="mr-total">
        {total} {total === 1 ? "voto" : "votos"}
      </small>
    </div>
  );
}

function EncuestaTop({ rico }) {
  const opciones = Array.isArray(rico.opciones) ? rico.opciones : [];
  const total = opciones.reduce((a, o) => a + (o.votos || 0), 0);
  const pct = (n) => (total === 0 ? 0 : Math.round(((n || 0) / total) * 100));
  const ranking = [...opciones].sort((a, b) => (b.votos || 0) - (a.votos || 0));
  const maximo = ranking[0]?.votos ?? 0;

  return (
    <div className="mr-media mr-encuesta">
      <strong className="mr-pregunta">
        <TextoFormato texto={rico.pregunta} />
      </strong>

      {ranking.map((o, i) => {
        const lider = i === 0 && maximo > 0;

        return (
          <div key={o.id ?? i} className={`mr-op${lider ? " lider" : ""}`}>
            <span
              className="mr-op-relleno"
              style={{ width: `${pct(o.votos)}%` }}
            />
            <span className="mr-op-pos">{i + 1}</span>
            <span className="mr-op-texto">{o.texto}</span>
            {lider && <span>🏆</span>}
            <b className="mr-op-pct">{pct(o.votos)}%</b>
          </div>
        );
      })}

      <small className="mr-total">
        {total} {total === 1 ? "voto" : "votos"}
      </small>
    </div>
  );
}

// ------------------------------------------------------------
// COMPONENTES
// ------------------------------------------------------------

// Contenido solo (sin globo)
export function ContenidoMensaje({ rico }) {
  if (!rico) return null;

  switch (rico.tipo) {
    case "texto":
      return (
        <div className="mr-texto">
          <TextoFormato texto={rico.texto} />
        </div>
      );

    case "tarjeta":
      return (
        <div className="mr-media">
          {rico.imagen ? (
            <img className="mr-img" src={rico.imagen} alt="" loading="lazy" />
          ) : (
            <div className="mr-img mr-img-vacia">Sin imagen</div>
          )}
          {rico.texto && (
            <div className="mr-tarjeta-texto">
              <TextoFormato texto={rico.texto} />
            </div>
          )}
        </div>
      );

    case "video":
      return <Video rico={rico} />;

    case "encuesta_likes":
      return <EncuestaLikes rico={rico} />;

    case "encuesta_top":
      return <EncuestaTop rico={rico} />;

    default:
      return null;
  }
}

// Con globo gris claro y pico, como en la app
export default function PreviewMensaje({ rico, conAvatar = false }) {
  if (!rico) return null;

  return (
    <div className="mr-fila">
      {conAvatar && <span className="mr-avatar">CV</span>}

      <div
        className={`mr-globo${rico.tipo === "texto" ? " mr-globo-texto" : ""}`}
      >
        <ContenidoMensaje rico={rico} />
      </div>
    </div>
  );
}
