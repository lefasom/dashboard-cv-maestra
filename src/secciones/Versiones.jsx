// src/secciones/Versiones.jsx
// Datos hardcodeados por ahora. Después vendrán de una base de datos nueva.

const VERSIONES = [
  { version: "1.0.0", lanzamiento: "2026-01-15", vence: "2026-06-30" },
  { version: "1.1.0", lanzamiento: "2026-04-02", vence: "2026-12-31" },
  { version: "1.2.0", lanzamiento: "2026-07-20", vence: "2027-03-31" },
  { version: "1.3.0", lanzamiento: "2026-10-01", vence: "2027-09-30" },
];

const DIA = 24 * 60 * 60 * 1000;

const estadoDe = (vence) => {
  const dias = Math.ceil((new Date(vence).getTime() - Date.now()) / DIA);

  if (dias < 0) return { texto: "Vencida", clase: "vencida" };
  if (dias <= 60) return { texto: `Vence en ${dias} días`, clase: "por-vencer" };
  return { texto: "Vigente", clase: "vigente" };
};

export default function Versiones() {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>
          Versiones <span className="contador">{VERSIONES.length}</span>
        </h2>
      </div>

      <div className="scroll" style={{ maxHeight: "50vh" }}>
        <table className="lista">
          <thead>
            <tr>
              <th className="left">Versión</th>
              <th className="left">Lanzamiento</th>
              <th className="left">Vencimiento</th>
              <th className="left">Estado</th>
            </tr>
          </thead>

          <tbody>
            {VERSIONES.map((v) => {
              const estado = estadoDe(v.vence);

              return (
                <tr key={v.version}>
                  <td className="left">{v.version}</td>
                  <td className="left">{v.lanzamiento}</td>
                  <td className="left">{v.vence}</td>
                  <td className="left">
                    <span className={`etiqueta ${estado.clase}`}>
                      {estado.texto}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
