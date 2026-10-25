# CV Maestra — Prompt 2 (DASHBOARD Vite + React): Estadísticas y Onboarding

> Para pegar en otra conversación de Claude, **después** de terminar el Prompt 1 (app). Primero la lista de archivos a adjuntar y después el prompt.
> Alcance: **solo el dashboard "Dash CV Master"** (Vite + React + Firebase). La app nativa se hace con el Prompt 1.
> Adjuntar también `CV_Maestra_Dashboard_Estadisticas.md` (especificación) y `CV_Maestra_Flujo_32_Registro_Eventos_Dashboard.md`.

---

## PARTE A — Archivos que hay que adjuntar

### A.1 Documentación

| # | Archivo | Para qué |
|---|---------|----------|
| 1 | `CV_Maestra_Dashboard_Estadisticas.md` | Especificación de las tablas y los indicadores |
| 2 | `CV_Maestra_Flujo_32_Registro_Eventos_Dashboard.md` | Eventos que manda la app, campos, tablas de catálogos y reglas |
| 3 | `CV_Maestra_Prompt_1_App_v3.md` | Qué eventos y campos deja listos la app (para no pedir datos que no existen) |

### A.2 Código del dashboard ya revisado (hay que volver a pasarlo)

| # | Archivo | Ruta | Papel |
|---|---------|------|-------|
| 4 | `App.jsx` | `src/App.jsx` | Lista de secciones y pestañas |
| 5 | `Estadisticas.jsx` | `src/secciones/Estadisticas.jsx` | Tarjetas y tablas de Estadísticas |
| 6 | `Onboarding.jsx` | `src/secciones/Onboarding.jsx` | Tarjetas y tablas de Onboarding |
| 7 | `TablaDatos.jsx` | `src/components/TablaDatos.jsx` | Tabla genérica (filtro, orden, menú de propiedades) |
| 8 | `columnas.js` | `src/columnas.js` | Definición de columnas de todas las tablas |
| 9 | `datosApp.js` | `src/datosApp.js` | `agruparOnboarding`, `agruparPerfiles`, `agruparUso` |
| 10 | `config.js` | `src/config.js` | Colecciones, tipos de evento, `modoDe` |
| 11 | `useColeccion.js` | `src/hooks/useColeccion.js` | Lectura en tiempo real (últimos 5000 eventos) |

### A.3 Archivos que TODAVÍA NO se vieron y son necesarios

| # | Archivo | Por qué |
|---|---------|---------|
| 12 | **`src/datos.js`** | **Crítico.** Tiene `agruparPlantillas`, `agruparFamilias`, `calcularTotales` y `claveDe`: la lógica que cuenta las descargas, separa PDF familia / PDF ATS / PDF colección y arma las filas. Casi todo el trabajo de Estadísticas pasa por acá |
| 13 | **`src/catalogo.js`** | **Crítico.** Tiene `ETAPAS`, `EXTRAS`, `PROFESIONES`, `etiqueta` y `etiquetaFamilia`, y (por las capturas, que muestran plantillas con 0 descargas) probablemente el catálogo de plantillas. Hay que agregar etiquetas (`sin_familia`, `coleccion`) y confirmar que el catálogo coincide con el de la app (Family 1 a 66, Library 100 a 112) |
| 14 | `src/components/Resumen.jsx` | Tarjetas de resumen (se cambian las etiquetas y el orden) |
| 15 | `src/components/EstadoCarga.jsx` | Aviso de carga y cantidad de eventos |
| 16 | `src/hooks/useColumnas.js` | Guarda qué columnas están activas en `localStorage` por `claveStorage`. Hay que subir la versión de la clave para que las columnas nuevas se vean |
| 17 | `src/components/MenuPropiedades.jsx` | Menú para activar/desactivar columnas |
| 18 | `src/secciones/Uso.jsx` y `src/secciones/Perfiles.jsx` | Para confirmar que **no se rompen**: leen `extra.familia` de otros eventos |
| 19 | `src/estilos.css` (opcional) | Solo si hay que ajustar la grilla (`rejilla`) por tener tres tablas en Onboarding o tarjetas nuevas |

---

## PARTE B — Prompt completo

Copiá desde acá hacia abajo.

---

### Contexto del proyecto

Trabajás sobre el **dashboard "Dash CV Master"** de la app CV Maestra. Es una aplicación **Vite + React** (JavaScript) con **Firebase Auth** y **Firestore** en tiempo real. La app nativa (React Native) escribe eventos en colecciones de Firestore y este dashboard los lee. Idioma de trabajo: español rioplatense (voseo); comentarios en español.

Estructura que ya se vio:

- `App.jsx`: pestañas Estadísticas, Uso, Onboarding, Perfiles, Reseñas, Chat, Versiones, Distribución, Datos y Valoración.
- Cada sección usa `useColeccion(COLECCIONES.X)` (lee los **5000 eventos más recientes**, `orderBy createdAt desc`), agrupa con funciones de `datos.js` / `datosApp.js` y muestra tarjetas (`Resumen`) y tablas (`TablaDatos`).
- `TablaDatos` recibe `columnas` (cada una con `key`, `label`, `align`, `inicial`, `valor(f)` y `render(f)` opcional), `claveStorage` (columnas activas guardadas en `localStorage`), `filtro`, `menu`, `altura` y `ordenInicial`. El filtro busca en `nombre` y `familiaLabel`.
- `config.js` define colecciones, tipos de evento y `modoDe(e)`, que clasifica un PDF como `"coleccion"` o `"familia"` mirando `extra.modo`, `extra.catalogo` o `extra.familia === "new_design"` (así reconoce también los eventos viejos).

**Etapa del trabajo:** primero se hace la app (Prompt 1), donde se agregan campos y un evento nuevo. Este prompt deja el dashboard leyéndolos. **El dashboard debe tolerar que todavía no existan los eventos nuevos** (mostrar 0 o "sin dato", nunca romperse).

### Eventos que deja listos la app (Prompt 1)

**Descarga de PDF** — `plantilla_descargada` (colección `dashboard_events`). `nombre` y `plantillaId` van al nivel principal; **todo lo demás va dentro de `extra`**:

| Campo | Tipo | Desde cuándo | Significado |
|-------|------|--------------|-------------|
| `nombre` | string | Siempre | `name` del catálogo (**no es único**: hay 11 "ATS") |
| `plantillaId` | string | Siempre | Id del registro del catálogo (**único**) |
| `familia` | string | Siempre; **cambia de significado** | Eventos viejos: familia del diseño. Eventos nuevos: `"sin_familia"` si no hubo experiencia mejorada, si no la familia real |
| `familiaPlantilla` | string | 🆕 | Familia real del diseño (siempre) |
| `catalogo` | string | Siempre | `"family"` / `"library"` |
| `modo` | string | Siempre | `"familia"` / `"coleccion"` |
| `categoria`, `desplazamiento`, `perfilPrueba` | — | Siempre | Otros datos |
| `experienciaMejorada` | boolean | 🆕 | Si estaba activa la experiencia mejorada |
| `esAts` | boolean | 🆕 | Si es una plantilla ATS (cualquier catálogo) |
| `careerStage`, `sector`, `focus`, `extras` | string | 🆕 | Configuración, listas separadas por coma |
| `audienceMetrics` | boolean | 🆕 | Métricas de audiencia seleccionadas |

**Descarga colección** — `plantilla_biblioteca` (`dashboard_events`): se registra cuando la persona baja un diseño de la biblioteca. Mismos campos de contexto.

**Onboarding** (colección `dashboard_onboarding`):

| Tipo | Campos en `extra` | Para qué |
|------|-------------------|----------|
| `onboarding_completado` | `careerStage`, `sector`, `focus`, `extras` (strings por coma), `audienceMetrics` | Tablas Áreas elegidas, Extras más seleccionados y Momento laboral |
| 🆕 `onboarding_admin_uso` | `accion` = `abrir_admin` / `editar_momento` / `editar_area` / `editar_extras` | Tarjetas de uso del Admin |
| `onboarding_editado`, `onboarding_desactivado` | (sin cambios) | **El dashboard ya no los muestra** |

### Catálogos de la app (referencia exacta)

**Family** (ids 1 a 66, `category: "free"`): una ATS por familia + 5 diseños.

| Familia (`templateFamily`) | ATS | Otros ids |
|---|---|---|
| `customer_service` | 1 | 2 a 6 |
| `administration` | 7 | 8 a 12 |
| `technology` | 13 | 14 a 18 |
| `marketing_design` | 19 | 20 a 24 |
| `trades_services` | 25 | 26 a 30 |
| `logistics_transport` | 31 | 32 a 36 |
| `health_education` | 37 | 38 a 42 |
| `sports` | 43 | 44 a 48 |
| `influencers` | 49 | 50 a 54 |
| `hospitality_gastronomy` | 55 | 56 a 60 |
| `other` | 61 | 62 a 66 |

**Library / colección** (familia `new_design`, ids **100, 102, 103, 104, 105, 106, 107, 108, 109, 110, 112** = **11 diseños**): `CV-57`, `CV-69`, `CV-60`, `CV-61`, `CV-58`, `CV-62`, `CV-63`, `CV-64`, `CV-67`, `CV-65`, `CV-68` (en ese orden de ids). **No hay ATS en Library.**

### Hallazgos ya confirmados en el código del dashboard

1. **Las tarjetas de Estadísticas están en otro orden y con definiciones dudosas.** Hoy: Colección, Descargas familia, Descargas colección, Descargas ATS. La tarjeta "Descargas colección" muestra `totales.pdfColeccion` (los **PDF** de diseños de colección), pero según la especificación **"Descargas colección" = veces que se bajó un diseño de la biblioteca** (`plantilla_biblioteca`), y los PDF de colección van en otra columna. Y la tarjeta "Colección" muestra `totales.coleccion` (probablemente un conteo de eventos), pero debe ser **la cantidad de diseños que pertenecen a la colección (11)**. **Verificalo en `datos.js` antes de tocar.**
2. **La tabla Plantillas** tiene hoy: Nombre, Familia, Colección, PDF familia, PDF colección, Total PDF (visibles) y Última descarga, Android, iOS, Perfil prueba, Tiempo PDF y Seg. hasta descargar (ocultas, activables). **La tabla Familias** tiene hoy: Familia, Plantillas, Colección, PDF familia, PDF colección, PDF ATS (visibles).
3. **El Onboarding hoy** muestra 4 tarjetas (Completados, Editados, Desactivados, Cambios de área) y 4 tablas (Áreas elegidas, Extras más seleccionados, Momento laboral, Cambios de área). `agruparOnboarding` lee `extra.sector`, `extra.careerStage` y `extra.extras` (este último separado por coma, y lo parte), pero para `sector` y `careerStage` usa **un solo valor por evento**: si la app manda varios separados por coma, `etiquetaFamilia` / `etiqueta` recibirán el string entero.
4. **Hoy el Onboarding muestra todo en cero** (la app todavía no manda los eventos correctos; ver Prompt 1).
5. **`LIMITE_EVENTOS = 5000`**: todo se calcula sobre los 5000 eventos más recientes. Cuando haya más, los contadores **bajarán** en lugar de crecer. No se resuelve en este trabajo, pero hay que dejarlo señalado como riesgo.
6. **`useColumnas` guarda las columnas activas en `localStorage` por `claveStorage`** (`...-v2`). Si no se cambia la clave, quien ya abrió el dashboard seguirá viendo las columnas viejas y **las nuevas no aparecerán**.
7. `agruparUso` y `agruparPerfiles` leen `extra.familia` de **otros eventos** (`dashboard_interactions`, `dashboard_profiles`). **No los toques**: la redefinición de `familia` solo aplica a `plantilla_descargada` y `plantilla_biblioteca`.

### Tareas

#### Tarea 1 — Pestaña Onboarding

Lo que pidió el dueño del proyecto: **mostrar el área elegida, los extras elegidos y el momento laboral** (lo que tiene la configuración de la experiencia mejorada) y **medir cuánto se usa el Admin**. **No le interesa qué cambió ni por qué.**

- **Sacar** las 4 tarjetas actuales (Completados, Editados, Desactivados, Cambios de área) **y** la tabla "Cambios de área".
- **Poner 4 tarjetas nuevas** (conteos de `onboarding_admin_uso` por `accion`):

| Tarjeta | Cuenta |
|---------|--------|
| **Uso del Admin** | `accion = "abrir_admin"` |
| **Cambio de área** | `accion = "editar_area"` |
| **Cambio de momento laboral** | `accion = "editar_momento"` |
| **Cambio de extras** | `accion = "editar_extras"` |

  (El dueño dijo "cambio de input" para la tercera pregunta; usá "Cambio de extras" salvo que prefiera otro texto.)
- **Dejar 3 tablas**: Áreas elegidas, Extras más seleccionados y Momento laboral, alimentadas por `onboarding_completado`. Mantener `cantidad` y `%`.
- Para `sector` y `careerStage`, **partir por coma y contar cada valor** (igual que ya se hace con `extras`), para no mostrar una etiqueta rota si hay varios.
- Agregar en `config.js` la constante del tipo nuevo (`ONB_ADMIN = "onboarding_admin_uso"`).
- Reescribir `agruparOnboarding` en `datosApp.js` para devolver `{ areas, etapas, extras, admin }` (con `admin = { abrir, area, momento, extras }`). Quitar lo de `cambios`. Sacar `COLUMNAS_CAMBIOS` de `Onboarding.jsx` (podés borrarla de `columnas.js` si ya nadie la usa; confirmalo).
- Con tres tablas en una grilla de dos columnas queda un hueco: proponé una solución simple (por ejemplo, que la tercera ocupe el ancho completo) o dejalo y avisame.
- Sin eventos, todo en 0 / "Todavía no hay datos.", sin errores.

> ⚠️ **Decisión abierta:** las tablas se alimentan **solo de `onboarding_completado`** (lo que eligieron al activar). Si alguien cambia luego su área desde el Admin, la tabla no lo refleja (porque no se guarda qué cambió). Es lo que se pidió; solo avisá que las tablas significan "elegido al activar".

#### Tarea 2 — Pestaña Estadísticas: tarjetas

Orden y definición final (de izquierda a derecha):

| # | Tarjeta | Qué cuenta |
|---|---------|------------|
| 1 | **Descargas familia** | PDF (`plantilla_descargada`) de diseños de familias profesionales, **sin ATS** y **sin colección** |
| 2 | **Descargas ATS** | PDF de plantillas ATS, **de cualquier origen** |
| 3 | **Descargas colección** | `plantilla_biblioteca` (veces que se bajó un diseño de la biblioteca) |
| 4 | **Colección** | Cantidad de diseños de la colección (**11**, desde el catálogo; no desde eventos) |

- Si `datos.js` ya separa PDF familia / ATS de otra forma, **respetá la lógica existente y explicame las diferencias** antes de cambiarla.
- Antes de implementar, **comprobá que cada contador mide exactamente su evento**: una descarga de la biblioteca y un PDF no son lo mismo.

#### Tarea 3 — Estadísticas: tabla Familias

Debe mostrar **solo** información de familias profesionales.

| Columna | Información |
|---------|-------------|
| **Familia** | Nombre de la familia |
| **PDF familia** | PDF de diseños de esa familia (sin ATS) |
| **PDF ATS** | PDF de plantillas ATS de esa familia |

- **Sacar** de esta tabla: Plantillas, Colección y PDF colección (no van; el dueño conoce la cantidad de plantillas por familia).
- **No agregar fila de "ATS totales"** (ya está arriba en Descargas ATS).
- Si `datos.js` ya tiene una función de detección de ATS, **reutilizala**; si no, detectá ATS así, en este orden: `extra.esAts === true`; si falta (eventos viejos), `nombre === "ATS"` o `plantillaId` entre 1, 7, 13, 19, 25, 31, 37, 43, 49, 55 y 61.
- Para que las descargas sin experiencia mejorada no desaparezcan de la tabla, agregar **una fila final "Sin familia"** con los eventos cuya `familia` sea `"sin_familia"`. **(Decisión abierta: proponelo, pero esperá mi respuesta antes de implementarlo.)**
- Las columnas técnicas opcionales que ya existían (Total PDF, Última descarga) pueden quedar **ocultas** en el menú de propiedades.

#### Tarea 4 — Estadísticas: tabla Plantillas

Todas las plantillas disponibles (Family + Library), con:

| Columna | Información |
|---------|-------------|
| **Nombre** | Nombre del diseño (`CV-06`, `ATS`...) |
| **Familia** | Familia del diseño; **"Sin familia"** para descargas sin experiencia mejorada |
| **PDF familia** | PDF registrados desde el flujo de familia |
| **Total PDF** | Total de descargas de PDF efectivas de esa plantilla |

- **Sacar** de las columnas visibles: Colección y PDF colección.
- Se **conservan como opcionales (ocultas)** las columnas técnicas que ya existían (Última descarga, Android, iOS, Perfil prueba, Tiempo PDF, Seg. hasta descargar).
- Agregar **3 columnas opcionales ocultas** para responder "¿qué descargas vienen de la experiencia mejorada?": **Con exp. mejorada**, **Sin exp. mejorada** y **Sin dato** (eventos viejos sin `experienciaMejorada`).
- **Agrupar por `plantillaId`**, nunca por `nombre` (hay 11 "ATS"). Los eventos históricos ya traen `plantillaId` al nivel principal. Si `claveDe(nombre, familia)` en `datos.js` agrupa por nombre y familia, evaluá si hay que migrarlo; cuidado de no partir en dos filas una misma plantilla cuya `familia` cambió de significado (por eso conviene `plantillaId`).
- La familia que se muestra de una plantilla debe ser la **del catálogo** (`familiaPlantilla` o el catálogo del dashboard), **no** el valor `"sin_familia"`. El "Sin familia" va en una columna/etiqueta aparte de las descargas sin experiencia mejorada, no pisa la familia de la plantilla. Proponé cómo mostrarlo y esperá mi confirmación si no está claro.
- La tabla debe mostrar **también las plantillas sin descargas** (en 0), como hoy.

#### Tarea 5 — Estadísticas: tabla Colección (nueva)

Solo los **11 diseños** de la biblioteca:

| Columna | Información |
|---------|-------------|
| **Plantilla** | Nombre (`CV-57`, `CV-69`...) |
| **Descargas colección** | Cantidad de `plantilla_biblioteca` de ese diseño |
| **PDF** | Cantidad de `plantilla_descargada` de ese diseño (`modoDe(e) === "coleccion"`) |

- Mostrar los 11 aunque tengan 0.
- Distinguir **uso de la biblioteca** de **descarga real del PDF**.
- Agregar una constante `COLUMNAS_COLECCION` en `columnas.js` y una función `agruparColeccion` (en `datos.js`).
- Orden de las tablas en la página: **Familias → Plantillas → Colección**.

#### Tarea 6 — Mantenimiento

- **Subir la versión de las `claveStorage`** de las tablas cambiadas (por ejemplo `...-v3`) para que se apliquen las columnas nuevas.
- **Actualizar `catalogo.js`** si le falta algo: etiqueta para `sin_familia` ("Sin familia"), `new_design` ("Colección") y los 11 diseños con sus ids; confirmar que Family tiene los 66.
- **No tocar** las pestañas Uso, Perfiles, Reseñas, Chat, Versiones, Distribución, Datos y Valoración.
- **Eventos históricos**: sin los campos nuevos, se muestran como "sin dato", nunca como "sin experiencia mejorada". No se borra ni se reescribe nada.

### Restricciones

- **No inventar cifras.** Si un dato no está en los archivos o en los eventos, mostrar `—` o 0.
- **No cambiar** `firestore.rules`, `dashboard_service.js` ni nada de la app. Este trabajo es solo del dashboard.
- **No romper los contadores existentes** ni perder información histórica.
- Mantener el estilo del código y los nombres breves de las métricas: **"PDF familia"** y **"PDF ATS"** (no nombres largos).
- Cambios puntuales con contexto para ubicarlos; **archivo completo** cuando el cambio sea extenso (se esperan completos: `Onboarding.jsx`, `Estadisticas.jsx`, `columnas.js`, `datosApp.js` y las funciones de `datos.js` que cambien).

### Preguntas abiertas

1. ¿Cómo cuenta hoy `datos.js` PDF familia / PDF ATS / PDF colección, y qué representa hoy `totales.coleccion`? (hallazgo 1)
2. **Decisión:** ¿fila final "Sin familia" en la tabla Familias? Esperá mi respuesta.
3. **Decisión:** ¿cómo mostrar "Sin familia" en la tabla Plantillas sin pisar la familia real del diseño?
4. ¿`catalogo.js` ya tiene el catálogo completo de plantillas (Family 66 + Library 11)? ¿Los ids coinciden con los de la app?
5. ¿`agruparUso` / `agruparPerfiles` quedan intactos con estos cambios? (confirmar leyendo `Uso.jsx` y `Perfiles.jsx`)
6. ¿Conviene mover el contador de "Colección" a una constante del dashboard o leerlo del catálogo?

### Formato de la respuesta

1. **Resumen de hallazgos** (cómo cuenta hoy `datos.js`, qué tiene `catalogo.js`, diferencias con la especificación).
2. **Decisiones abiertas** (2 y 3) con tu recomendación. **Esperá mi respuesta antes del código final.**
3. **Lista de archivos que vas a modificar** y por qué.
4. **El código**, archivo por archivo (completo o puntual, indicándolo).
5. **Tabla final de columnas y tarjetas** de cada tabla (nombre, valor, de dónde sale).
6. **Pruebas manuales** (abajo).
7. **Pendientes y riesgos** (incluido `LIMITE_EVENTOS = 5000`).

### Pruebas manuales esperadas

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 1 | Abrir Onboarding sin eventos nuevos | 4 tarjetas en 0, 3 tablas con "Todavía no hay datos.", sin errores |
| 2 | Activar la experiencia mejorada en la app | Aparece en Áreas elegidas, Extras y Momento laboral |
| 3 | Tocar Admin y los tres Editar en la app | Las 4 tarjetas suben en 1 cada una, y solo la que corresponde |
| 4 | Estadísticas con eventos viejos solamente | Todo se ve (sin errores); "Sin dato" en las columnas de experiencia mejorada |
| 5 | Descargar una ATS con y sin experiencia mejorada | Suma en Descargas ATS en ambos casos; la segunda aparece en "Sin familia" |
| 6 | Descargar un diseño de colección | Suma en la tabla Colección (columna PDF), en Plantillas y no en la tabla Familias |
| 7 | Desbloquear un diseño de la biblioteca | Suma en Descargas colección (tarjeta y tabla) |
| 8 | Abrir el dashboard con una sesión que ya tenía columnas guardadas | Se ven las columnas nuevas (clave de storage nueva) |
| 9 | Revisar Uso y Perfiles | Sin cambios |
| 10 | Ordenar y filtrar cada tabla | Funciona como antes |

---

## PARTE C — Orden de trabajo recomendado

1. Terminar el **Prompt 1 (app)** y probar con el teléfono que los eventos llegan a Firestore (se ven en la consola de Firebase).
2. Hacer este **Prompt 2 (dashboard)**.
3. Actualizar el **Flujo 32** con lo que se haya implementado (la sección 32.14 de estado).