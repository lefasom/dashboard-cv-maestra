// src/hooks/escuchaCompartida.js
//
// Una sola suscripción de Firestore compartida por todos los componentes que
// la usan. Se cierra recién `gracia` ms después de que nadie la usa, así que
// si abrís y cerrás un modal o cambiás de pestaña no se vuelven a leer los
// documentos (0 lecturas dentro de ese tiempo).
//
//   suscribir(emitir, caido) -> debe devolver la función para darse de baja.
//     emitir(valor)  publica un valor nuevo a todos los componentes
//     caido()        avisar si la suscripción falló (se reintenta al volver a usar)

import { useEffect, useState } from "react";

export function crearEscuchaCompartida(
  suscribir,
  inicial,
  gracia = 5 * 60 * 1000
) {
  let estado = inicial;
  let usos = 0;
  let baja = null;
  let temporizador = null;
  const oyentes = new Set();

  const emitir = (nuevo) => {
    estado = nuevo;
    oyentes.forEach((f) => f(estado));
  };

  const iniciar = () => {
    if (!baja) {
      baja = suscribir(emitir, () => {
        baja = null;
      });
    }
  };

  const detener = () => {
    baja?.();
    baja = null;
    estado = inicial;
  };

  return function useEscucha() {
    const [valor, setValor] = useState(estado);

    useEffect(() => {
      clearTimeout(temporizador);
      usos += 1;
      oyentes.add(setValor);
      iniciar();
      setValor(estado);

      return () => {
        oyentes.delete(setValor);
        usos -= 1;
        if (usos === 0) temporizador = setTimeout(detener, gracia);
      };
    }, []);

    return valor;
  };
}
