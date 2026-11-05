# CV Belgrano · Sitio público (landing page)

Landing page de **CV Belgrano**, la aplicación para crear, mantener y mejorar tu currículum desde el celular. Este documento explica qué es el sitio, cómo está armado, qué valoración tiene hoy, qué falta para lanzarlo y qué decisión de producto quedó abierta (la de "comunidad").

> Estado: versión de trabajo. Se rediseñó en una sola sesión corta y está lista para revisar, pero **todavía no está lista para publicar** (ver [Pendientes antes de lanzar](#pendientes-antes-de-lanzar)).

---

## 1. La idea que comunica la landing

> **Tené tu CV siempre preparado para cuando llegue la oportunidad.**

El mensaje central es que el CV no se hace una sola vez: se mantiene **disponible**, **actualizado** y se va **mejorando paso a paso**. Todo el sitio gira alrededor de esa idea.

---

## 2. Estructura de la página

Orden actual de las secciones:

| # | Sección | Qué cuenta |
|---|---------|-----------|
| 1 | Presentación | Logo, mensaje principal y dos capturas de la app |
| 2 | Franja de beneficios y descarga | 4 beneficios + botón "Descargar aplicación" |
| 3 | La idea de CV Belgrano | Siempre disponible · siempre actualizado · siempre mejorando |
| 4 | Experiencia mejorada | Las 3 preguntas de selección, con una captura por pregunta |
| 5 | Formularios | Panel de experiencia mejorada y formulario de datos personales |
| 6 | Comunidad y modo oscuro | Chat, encuestas y modo oscuro |
| 7 | Accesibilidad | Compatibilidad con lectores de pantalla |
| 8 | Cierre | Llamado final y botón de descarga |

### Decisiones de diseño

- **Tema azul oscuro en toda la página**, igual al modo oscuro de la app, para que las capturas claras resalten.
- **Hero limpio:** solo el mensaje y las capturas. Los beneficios y la descarga viven en una franja aparte.
- **Galerías que nunca quedan pegadas:** 3 teléfonos por fila en pantallas grandes, 2 + 1 en tablet y uno debajo del otro en celular, con imágenes grandes.
- **Responsive centrado** en móvil.
- **Ícono de accesibilidad** estándar de Android (Material Design).
- **Ícono de descarga:** flecha gruesa dentro de un círculo.

---

## 3. Archivos

```
LandingPage.jsx     → estructura y textos de la página
LandingPage.css     → estilos y responsive (tema azul oscuro)
src/assets/         → logo y capturas de la app
```

### Imágenes necesarias en `src/assets`

Ya existentes:

- `cvbelgrano.png` (logo)
- `pantalla_app.png`
- `pantalla_plantillas.png`
- `pantalla_plantillas_oscuro.png`
- `pantalla_chat.png`

Capturas de la experiencia mejorada (solo la pantalla, sin marco del celular, **724 × 1610 px**):

- `pantalla_pregunta_momento.png`
- `pantalla_pregunta_area.png`
- `pantalla_pregunta_extras.png`
- `pantalla_panel_experiencia.png`
- `pantalla_datos_personales.png`

Estas cinco se cargan con `import.meta.glob`: si alguna falta, la página **no se rompe** y muestra un recuadro punteado con el nombre del archivo pendiente.

### Link de descarga

En `LandingPage.jsx`:

```js
const URL_DESCARGA_APK = "";
```

Mientras esté vacío, el botón principal se muestra sin acción y el botón del cierre no aparece. Pegá acá el enlace real del APK.

---

## 4. Cómo correrlo

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

---

## 5. Valoración del sitio

### Lo que funciona

- **El mensaje se entiende rápido.** "Tené tu CV siempre preparado" es claro y memorable.
- **Coherencia visual** con la app: el azul oscuro unifica todo.
- **Muestra el producto real.** El paso a paso usa capturas auténticas, no promesas vagas.
- **Se adapta bien a celular**, que es desde donde probablemente la va a ver la mayoría.
- **Informa sin saturar:** el hero es limpio y el detalle está más abajo.

### Lo que todavía no está resuelto

- El botón de descarga **no tiene destino**.
- Faltan los datos básicos de una página pública (ver pendientes).
- Algunas frases prometen más de lo que hoy se puede demostrar (ver [comunidad](#7-decisión-abierta-es-una-comunidad-o-no)).

---

## 6. Valoración de la aplicación

> Aclaración: esta valoración se hizo a partir de **capturas de pantalla**, no usando la app en un dispositivo. Conviene validarla con uso real.

### Fortalezas

- **Las 3 preguntas de selección** personalizan la experiencia y bajan la fricción de empezar un CV desde cero. Es la idea más fuerte del producto.
- **Formularios ordenados** en secciones desplegables.
- **Accesibilidad real** con lectores de pantalla: es un diferenciador poco común en este tipo de apps.
- **Modo oscuro consistente** y una interfaz cuidada.
- **Más de 60 plantillas**: mucha variedad (verificar que la cifra sea exacta y que todas mantengan la misma calidad).

### Riesgo principal: la retención

La landing promete un CV **siempre preparado y mejorándose**. Pero una app pensada para crear un CV una sola vez no le da motivos a nadie para volver. Para sostener esa promesa, la app necesita algo que haga volver a la persona. Ideas a evaluar:

- Recordatorios para actualizar el CV (por ejemplo, cada cierto tiempo o después de sumar un curso).
- Un indicador de qué tan completo está el CV.
- Sugerencias de mejora por sección, apoyadas en los ejemplos que ya existen.
- Historial de versiones o de CV descargados, con sensación de progreso.

Si algo de esto ya existe, hay que **mostrarlo en la landing**. Si no existe, es probablemente el siguiente paso de mayor valor para el producto.

---

## 7. Decisión abierta: ¿es una comunidad o no?

La landing hoy habla de "comunidad" en dos lugares: la sección *La idea de CV Belgrano* y la sección *Comunidad y modo oscuro*. Lo que existe hoy en la app es:

- un chat con mensajes del equipo,
- encuestas cortas,
- reseñas.

Eso es un **canal directo entre el equipo y los usuarios**, algo valioso, pero todavía no es una comunidad en el sentido de que las personas interactúen entre sí. Hay que decidir qué hacer con la palabra.

### Opción A · Ajustar el lenguaje a lo que existe

Reemplazar "comunidad" por formulaciones como "un equipo que te escucha", "participá en las decisiones de la app" o "votá qué funciones querés ver". Es honesto, no requiere desarrollo nuevo y igual refuerza el vínculo.

### Opción B · Construir una comunidad real

Mantener la palabra y construir lo que la respalde. Ideas para discutir:

- **Roadmap público** con votación de funciones (las encuestas ya son el primer paso).
- **Canal externo** de usuarios (WhatsApp, Telegram o Discord) para compartir consejos y dudas.
- **Reseñas y testimonios visibles** en la landing.
- **Plantillas o ejemplos sugeridos** por la gente.
- **Retos o hitos** para mantener el CV al día (se conecta con el problema de retención).

### Cómo decidir

- ¿Hay capacidad del equipo para moderar y animar una comunidad?
- ¿Cuántos usuarios activos hay hoy? Una comunidad vacía perjudica más que no tenerla.
- ¿La comunidad ayudaría a resolver la retención, o es una distracción?

**Sugerencia:** empezar por la Opción A en la landing y construir hacia la B de forma gradual, empezando por el roadmap con votos y el canal externo, que son baratos de probar.

---

## Pendientes antes de lanzar

### Imprescindibles

- [ ] Pegar el **link real del APK** en `URL_DESCARGA_APK`.
- [ ] Subir a `src/assets` las **5 capturas nuevas** de la experiencia mejorada.
- [ ] Probar la página en **un celular real** (no solo reduciendo la ventana del navegador).
- [ ] Revisar y confirmar los **textos que prometen funciones** ("siempre disponible", "siempre actualizado", "siempre mejorando") y la cifra "más de 60 plantillas".
- [ ] Decidir qué se hace con la palabra **"comunidad"** (sección 7).

### Datos de la página (`index.html`)

- [ ] `<html lang="es">`
- [ ] Título y descripción de la página.
- [ ] **Etiquetas para compartir** (Open Graph / Twitter) con imagen de vista previa. Es lo que se ve al pasar el link por WhatsApp, y probablemente sea el canal principal.
- [ ] Favicon con el logo de CV Belgrano.

### Confianza y legales

- [ ] **Footer** con contacto.
- [ ] **Política de privacidad**: la app maneja datos personales de currículum, así que es importante que esté a la vista.
- [ ] Términos y condiciones, si corresponde.

### Distribución

- [ ] Considerar la **Play Store** (aunque sea en prueba cerrada). Un APK suelto muestra advertencias de Android y genera desconfianza.
- [ ] Mientras tanto, aclarar en la página cómo instalar un APK de forma segura.

### Calidad y rendimiento

- [ ] Optimizar el peso de las imágenes (por ejemplo, convertir a WebP) para que cargue rápido con datos móviles.
- [ ] Revisar contraste y navegación por teclado, coherente con el valor de accesibilidad que promueve la app.
- [ ] Definir el **despliegue** y, si corresponde, el dominio.
- [ ] Opcional: medición básica de visitas y de clics en el botón de descarga, para saber si la página funciona.

---

## Próximos pasos sugeridos

1. Cerrar los imprescindibles y publicar una primera versión.
2. Decidir el enfoque de "comunidad" (Opción A o B).
3. Definir qué mecanismo de **retención** va a tener la app, porque de eso depende que la promesa "siempre preparado" sea cierta.
4. Volver a revisar la landing con esos cambios y con feedback de usuarios reales.
