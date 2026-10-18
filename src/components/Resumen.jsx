// src/components/Resumen.jsx
// tarjetas: [{ label, valor }]

export default function Resumen({ tarjetas }) {
  return (
    <div className="resumen">
      {tarjetas.map((t) => (
        <div className="card" key={t.label}>
          <span>{t.label}</span>
          <strong>{t.valor}</strong>
        </div>
      ))}
    </div>
  );
}