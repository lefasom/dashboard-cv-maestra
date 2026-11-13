/* ------------------------------------------------------------------
   TEXTOS DE LA LANDING (es · en · pt)

   Todo lo que se lee en la página está acá, en arrays y objetos con la
   misma forma en los tres idiomas. Para cambiar un texto, se cambia en
   los tres. Para sumar un ítem a una lista (un paso, una pregunta, un
   plan…), se agrega un elemento al array en los tres idiomas.

   Capturas: cada una tiene `archivo` (el PNG en src/assets). Está en cada
   idioma a propósito: si mañana hay capturas en inglés o en portugués,
   se cambia solo el nombre del archivo de ese idioma.
   Medida ideal: 724 x 1610, solo la pantalla (sin marco del celular).
------------------------------------------------------------------ */

export const IDIOMAS = [
  { codigo: "es", corto: "ES", nombre: "Español" },
  { codigo: "en", corto: "EN", nombre: "English" },
  { codigo: "pt", corto: "PT", nombre: "Português" },
];

/* ============================== ESPAÑOL ============================== */

const es = {
  meta: {
    titulo: "CV Belgrano · Tu CV desde el celular",
  },

  barra: {
    enlacesAria: "Secciones",
    enlaces: [
      { href: "#funciones", texto: "Funciones" },
      { href: "#gratis", texto: "Gratis" },
      { href: "#ia", texto: "IA" },
      { href: "#planes", texto: "Planes" },
      { href: "#preguntas", texto: "Preguntas" },
    ],
    descargar: "Descargar",
    idiomaAria: "Cambiar idioma",
  },

  botones: {
    play: "Descargar gratis en Google Play",
    playDetalle: "Android · Descarga y uso gratis",
    apk: "Descargar el APK",
    apkDetalle: "Instalación directa desde esta página",
  },

  captura: "CAPTURA",

  hero: {
    logoAlt: "Logo de CV Belgrano",
    nombre: "CV Belgrano",
    subtitulo: "Currículum Vitae Belgrano",
    etiqueta: "TU CV PROFESIONAL, DESDE EL CELULAR",
    titulo: "Armá un CV que te represente",
    tituloResalte: "y potencialo con IA.",
    texto:
      "Respondés 3 preguntas, completás tus datos con ejemplos de tu área y elegís entre 77 diseños. La app revisa tu CV, te dice qué mejorar y, con un toque, lo potencia con IA. Lo que ves es exactamente lo que sale en el PDF.",
    chipsAria: "Ventajas principales",
    chips: ["Descargá tu CV gratis", "Sin registro", "Sin publicidad", "Tus datos en tu celular"],
    capturas: [
      { archivo: "pantalla_app.png", titulo: "Inicio · panel principal", detalle: "Los tres pasos para crear tu CV" },
      { archivo: "pantalla_plantillas.png", titulo: "Mis plantillas · modo claro", detalle: "Selección y personalización de plantillas" },
    ],
  },

  numeros: {
    aria: "CV Belgrano en números",
    items: [
      { n: "77", t: "diseños de CV" },
      { n: "11", t: "áreas de trabajo" },
      { n: "3", t: "idiomas: es · en · pt" },
      { n: "+30", t: "plantillas gratis" },
    ],
  },

  problema: {
    etiqueta: "¿TE PASÓ?",
    titulo: "Te piden el CV para mañana y no sabés por dónde empezar.",
    texto:
      "Armar un currículum desde cero cuesta: qué poner, cómo ordenarlo, qué diseño usar y si está bien escrito. CV Belgrano resuelve todo eso desde el celular.",
    columnas: [
      { t: "\"No sé qué escribir\"", d: "Te damos ejemplos pensados para tu área en cada sección." },
      { t: "\"No sé si está bien\"", d: "El analizador te dice qué ya está bien y qué podés sumar." },
      { t: "\"No tengo computadora\"", d: "Lo armás, lo editás y lo descargás en PDF desde el teléfono." },
      { t: "\"Lo tengo desactualizado\"", d: "Tus datos quedan guardados: sumás lo nuevo y lo descargás al día." },
    ],
  },

  pasos: {
    etiqueta: "CÓMO FUNCIONA",
    titulo: "De cero a tu CV en PDF, en 4 pasos.",
    texto: "Sin cuentas, sin vueltas y sin saber de diseño.",
    items: [
      { t: "Contanos de vos", d: "Tu momento laboral, tu área y lo que querés sumar." },
      { t: "Completá tus datos", d: "Solo los campos que te sirven, con ejemplos al lado." },
      { t: "Elegí tu diseño", d: "Probalos con tus datos y mirá cuántas hojas ocupa." },
      { t: "Descargá y potenciá", d: "Tu PDF listo para enviar, analizado y mejorado con IA." },
    ],
  },

  experiencia: {
    etiqueta: "EXPERIENCIA MEJORADA",
    titulo: "Respondé 3 preguntas y la app se adapta a vos.",
    texto:
      "Elegís tu momento laboral, el área en la que querés trabajar y qué más querés sumar a tu CV. Son tres preguntas de selección que se responden en menos de un minuto.",
    galeria: [
      {
        archivo: "pantalla_pregunta_momento.png",
        titulo: "Pregunta 1 · momento laboral",
        detalle: "Tengo experiencia, trabajo independiente o es mi primer CV",
        nombre: "Tu momento laboral",
        texto: "Tengo experiencia, trabajo de forma independiente o es mi primer CV.",
      },
      {
        archivo: "pantalla_pregunta_area.png",
        titulo: "Pregunta 2 · área de trabajo",
        detalle: "Atención al cliente, tecnología, salud, deportes…",
        nombre: "Tu área de trabajo",
        texto: "Atención al cliente, tecnología, salud, gastronomía, oficios y más.",
      },
      {
        archivo: "pantalla_pregunta_extras.png",
        titulo: "Pregunta 3 · ¿tenés alguno de estos?",
        detalle: "Certificaciones, idiomas, licencia, GitHub…",
        nombre: "Lo que querés sumar",
        texto: "Certificaciones, idiomas, licencia de conducir, GitHub y más, según tu área.",
      },
    ],
    desbloqueo: [
      { t: "Ejemplos para tu área", d: "Al responder, desbloqueás ejemplos pensados para lo que vas a completar." },
      { t: "Formularios a tu medida", d: "Ves solo los campos que te sirven, sin completar datos de más." },
      { t: "Menos de un minuto", d: "Tres preguntas rápidas y tu experiencia queda personalizada." },
    ],
  },

  formularios: {
    etiqueta: "COMPLETÁ SOLO LO QUE IMPORTA",
    titulo: "Un formulario ordenado, que se ajusta a tus respuestas.",
    texto:
      "Tus datos se organizan en secciones que se abren y se cierran: contacto, perfil profesional, educación, habilidades, redes e idiomas. Completás una por una, a tu ritmo, con una foto de perfil opcional.",
    lista: [
      "Secciones desplegables para no perderte",
      "Ejemplos que te guían mientras escribís",
      "Listas y tarjetas propias para destacarte",
      "Administrá tu experiencia mejorada cuando quieras",
    ],
    capturas: [
      {
        archivo: "pantalla_panel_experiencia.png",
        titulo: "Panel principal · administrar experiencia mejorada",
        detalle: "Experiencia mejorada activada",
        pie: "Activá y administrá tu experiencia",
      },
      {
        archivo: "pantalla_datos_personales.png",
        titulo: "Datos personales · formulario",
        detalle: "Contacto, perfil, educación, habilidades, redes e idiomas",
        pie: "Datos personales, ordenados por secciones",
      },
    ],
  },

  hojas: {
    etiqueta: "SIN SORPRESAS EN EL PDF",
    titulo: "Lo que ves es exactamente lo que sale.",
    texto:
      "La vista previa marca con una línea dónde termina cada hoja, y el PDF sale igual: si dice \"1 hoja\", tu CV entra en una hoja. Si se pasa, la app te sugiere achicar la letra o reordenar secciones.",
    lista: [
      "Línea de corte de hoja en la vista previa",
      "Misma medida en la vista previa, el modo accesible y el PDF",
      "\"Explorar CV\" con el PDF real de cada descarga",
    ],
    capturas: [
      {
        archivo: "pantalla_vista_hojas.png",
        titulo: "Vista previa · línea de hoja",
        detalle: "La línea roja marca el final de cada hoja",
        pie: "Sabés cuántas hojas ocupa",
      },
      {
        archivo: "pantalla_explorar_pdf.png",
        titulo: "Explorar CV · PDF real",
        detalle: "La estructura arriba y el PDF descargado abajo",
        pie: "Mirá el PDF tal como lo enviaste",
      },
    ],
  },

  plantillas: {
    etiqueta: "DISEÑOS QUE SE NOTAN",
    titulo: "77 plantillas pensadas para cada área de trabajo.",
    texto:
      "Cada una de las 11 áreas tiene su versión ATS y cinco diseños propios, y la biblioteca suma 11 diseños más. Con el uso gratis tenés la versión ATS y dos diseños por área; con Premium se abren todos los que llevan corona.",
    lista: [
      "Cambiás de diseño sin volver a escribir nada",
      "Ordenás y ocultás secciones a tu gusto",
      "Ajustás el tamaño de letra para que entre todo",
      "Versión ATS gratis en todas las áreas",
    ],
    capturas: [
      {
        archivo: "pantalla_editor_plantilla.png",
        titulo: "Editor de plantilla",
        detalle: "Orden de secciones y tamaño de letra",
        pie: "Personalizá cada detalle",
      },
      {
        archivo: "pantalla_premium_corona.png",
        titulo: "Plantillas · gratis y premium",
        detalle: "Los diseños premium llevan una corona",
        pie: "Gratis primero, premium con corona",
      },
    ],
  },

  ia: {
    etiqueta: "ANALIZAR Y POTENCIAR",
    titulo: "Tu CV revisado y mejorado, en un toque.",
    texto:
      "Cada CV que descargás se puede analizar. La app te dice, con palabras simples, qué ya está bien y qué podés sumar. Y con \"Analizar y potenciar con IA\", te propone una versión más fuerte, lista para aplicar.",
    tarjetas: [
      {
        tag: "GRATIS · SIN INTERNET",
        titulo: "Analizador del CV",
        dorada: false,
        lista: [
          "Logros sin números y frases débiles",
          "Verbos de acción y fechas que no cierran",
          "Palabras clave de tu área",
          "Cuántas hojas ocupa tu CV",
        ],
      },
      {
        tag: "PREMIUM · CON IA",
        titulo: "Potenciar con IA",
        dorada: true,
        lista: [
          "Reescribe tu experiencia con logros claros",
          "Suma las palabras clave que buscan las empresas",
          "Aplicás los cambios que te gusten",
          "\"Volver al anterior\" cuando quieras",
        ],
      },
    ],
    nota: "A la IA solo va el texto del CV: nunca tu foto ni tus datos de contacto. Te pedimos permiso antes del primer uso.",
    capturas: [
      {
        archivo: "pantalla_analizador.png",
        titulo: "Analizador del CV",
        detalle: "Lo que ya está bien e ideas para sumar",
        pie: "Ideas claras, sin puntajes",
      },
      {
        archivo: "pantalla_potenciar_ia.png",
        titulo: "Analizar y potenciar con IA",
        detalle: "Antes y después, listo para aplicar",
        pie: "Tu CV potenciado con IA",
      },
    ],
  },

  perfiles: {
    etiqueta: "SIEMPRE PREPARADO",
    titulo: "Que tu CV nunca te agarre desprevenido.",
    texto:
      "Guardá varios perfiles (por ejemplo, uno para atención al cliente y otro para administración) y todos los CV que descargues. Cuando aparece una oportunidad, tu CV ya está ahí, en PDF o en Word.",
    lista: [
      "Varios perfiles en la misma app",
      "Historial de descargas en \"Mis CVs\"",
      "PDF gratis y Word (.docx) con Premium",
      "Respaldo de tus datos para cambiar de teléfono",
    ],
    capturas: [
      {
        archivo: "pantalla_mis_perfiles.png",
        titulo: "Mis perfiles",
        detalle: "Varios perfiles guardados en el celular",
        pie: "Un perfil para cada búsqueda",
      },
      {
        archivo: "pantalla_mis_cvs.png",
        titulo: "Mis CVs · descargas",
        detalle: "Tus PDF con el botón Analizar CV",
        pie: "Tus CV siempre a mano",
      },
    ],
  },

  gratis: {
    etiqueta: "USO GRATIS",
    titulo: "Todo esto lo usás sin pagar.",
    texto:
      "La app y tus CV son gratis. Lo premium es un extra: diseños nuevos y la IA, con pagos chicos, para quien los quiera.",
    items: [
      { t: "Descarga de tus CV", d: "Tus CV en PDF, todas las veces que quieras, sin marcas de agua." },
      { t: "Más de 30 plantillas", d: "La versión ATS y dos diseños por cada una de las 11 áreas, más uno de la biblioteca." },
      { t: "Experiencia mejorada", d: "3 preguntas y la app te muestra solo los campos y ejemplos que te sirven." },
      { t: "Armado y orden automático", d: "Las secciones se acomodan solas y sabés cuántas hojas ocupa tu CV." },
      { t: "Análisis de tu CV", d: "Lo que ya está bien, ideas para sumar y palabras clave de tu área." },
      { t: "Recomendaciones", d: "Consejos concretos con ejemplos: listas, tarjetas, logros y más." },
      { t: "Chat de ayuda", d: "Hablá con el equipo y guardá el historial de recomendaciones y novedades." },
      { t: "Encuestas y comunidad", d: "Votá diseños y opiná sobre lo que viene." },
      { t: "Perfiles y Mis CVs", d: "Varios perfiles y el historial de todo lo que descargaste." },
      { t: "Modo accesible", d: "Pensado para TalkBack, completo y sin costo." },
      { t: "Modo oscuro y 3 idiomas", d: "Español, inglés y portugués, de día o de noche." },
      { t: "Sin registro", d: "Sin cuentas ni contraseñas: tus datos quedan en tu celular." },
    ],
  },

  planes: {
    etiqueta: "PLANES",
    titulo: "Lo esencial es gratis. Premium suma diseños e IA.",
    texto:
      "Sin publicidad y sin letra chica: suscripción mensual por Google Play, con \"Cancelar suscripción\" siempre a la vista.",
    recomendado: "Recomendado",
    items: [
      {
        id: "gratis",
        nombre: "Gratis",
        precio: "Uso gratis",
        periodo: "",
        resumen: "Creás, analizás y descargás tus CV sin pagar.",
        incluye: [
          "Más de 30 plantillas: ATS + 2 diseños por área",
          "Descarga de tus CV en PDF, sin marcas de agua",
          "Análisis y recomendaciones para tu CV",
          "Armado y orden automático de las secciones",
          "Chat de ayuda con historial de recomendaciones",
          "Modo accesible completo",
          "Un análisis con IA de regalo",
        ],
      },
      {
        id: "premium",
        nombre: "Premium",
        precio: "$1.500",
        periodo: "por mes",
        resumen: "Todos los diseños y la IA para pulir tu CV.",
        corona: true,
        destacado: true,
        incluye: [
          "Todos los diseños premium, sin corona",
          "Toda la biblioteca de diseños",
          "5 \"Analizar y potenciar\" con IA por mes",
          "Exportá también en Word (.docx)",
          "Funciona 30 días sin conexión",
        ],
      },
      {
        id: "super",
        nombre: "Super",
        precio: "$2.900",
        periodo: "por mes",
        resumen: "Para quien se postula todas las semanas.",
        corona: true,
        incluye: [
          "Todo lo de Premium",
          "10 \"Analizar y potenciar\" por semana",
          "Hasta 3 por día, para cada postulación",
          "Ideal para adaptar el CV a cada aviso",
        ],
      },
      {
        id: "ultra",
        nombre: "Ultra",
        precio: "Muy pronto",
        periodo: "",
        resumen: "Tu CV en otros idiomas, traducido con IA.",
        corona: true,
        futuro: true,
        incluye: [
          "Todo lo de Super",
          "Traducción del CV con IA (es · en · pt)",
          "Para buscar trabajo fuera del país",
        ],
      },
    ],
    garantiasAria: "Condiciones de los planes",
    garantias: [
      "Cancelás cuando quieras",
      "Los PDF descargados son tuyos",
      "Restaurar compras en otro teléfono",
      "Cupones de descuento",
    ],
    nota:
      "Precios en pesos argentinos, con renovación mensual. El precio final es el que muestra Google Play al suscribirte. Para suscribirte tenés que ser mayor de 18 años o tener permiso de tu madre, padre o tutor.",
  },

  privacidad: {
    etiqueta: "SIMPLE Y PRIVADA",
    titulo: "Tu información es tuya.",
    texto: "Sin cuentas, sin contraseñas y sin publicidad. Tus datos personales se guardan en tu celular.",
    columnas: [
      { t: "Sin registro", d: "Abrís la app y empezás. No te pedimos correo ni contraseña." },
      { t: "En tu celular", d: "Tus perfiles y tus CV quedan guardados en el teléfono." },
      { t: "Sin publicidad", d: "Nada de anuncios entre vos y tu próximo trabajo." },
      { t: "En tu idioma", d: "Usala en español, inglés o portugués, cuando quieras." },
    ],
  },

  comunidad: {
    etiqueta: "COMUNIDAD Y MODO OSCURO",
    titulo: "Una app que crece con vos, de día o de noche.",
    texto:
      "Desde el chat de ayuda hablás con el equipo, recibís novedades y votás en encuestas cortas. Tu conversación vuelve aunque reinstales la app. Y con el modo oscuro, todo se ve cómodo a cualquier hora.",
    lista: [
      "Chat de ayuda en tu idioma",
      "Tu chat se recupera al reinstalar",
      "Encuestas para opinar sobre los diseños",
      "Modo oscuro en toda la aplicación",
    ],
    nota: "Tu opinión nos ayuda a seguir mejorando: la app crece junto con la comunidad.",
    capturas: [
      {
        archivo: "pantalla_plantillas_oscuro.png",
        titulo: "Mis plantillas · modo oscuro",
        detalle: "La misma app, cómoda de noche",
        pie: "Modo oscuro",
      },
      {
        archivo: "pantalla_chat.png",
        titulo: "Chat de ayuda · encuestas",
        detalle: "Mensaje del equipo y encuesta con resultados",
        pie: "Chat con el equipo",
      },
    ],
  },

  accesibilidad: {
    etiqueta: "DISEÑADA PARA TODOS",
    titulo: "La accesibilidad no es una función adicional. Es parte de la experiencia.",
    parrafos: [
      "CV Belgrano tiene un modo accesible pensado para quienes usan lectores de pantalla como TalkBack: podés crear, organizar, analizar y descargar tus currículums sin depender de elementos visuales.",
      "Porque todas las personas merecen las mismas oportunidades para construir su futuro laboral.",
    ],
    lista: [
      "Se activa solo con TalkBack o desde Ajustes",
      "Plantillas en 3 pasos, con el diseño descrito en palabras",
      "\"Explorar CV\": escuchá tu currículum antes de enviarlo",
      "El analizador y los planes se leen por bloques cortos",
      "La accesibilidad no se cobra: es igual en todos los planes",
    ],
    capturas: [
      {
        archivo: "pantalla_accesible_ajustes.png",
        titulo: "Ajustes · Modo accesible",
        detalle: "El interruptor que activa la vista accesible",
        pie: "Se activa en un toque",
      },
      {
        archivo: "pantalla_accesible_plantillas.png",
        titulo: "Modo accesible · Plantillas",
        detalle: "Elegir diseño en 3 pasos, con botones grandes",
        pie: "Plantillas en 3 pasos",
      },
      {
        archivo: "pantalla_accesible_explorar.png",
        titulo: "Modo accesible · Explorar CV",
        detalle: "El CV leído por secciones, sin abrir el PDF",
        pie: "Escuchá tu CV",
      },
    ],
  },

  descarga: {
    etiqueta: "INSTALALA EN 1 MINUTO",
    titulo: "Descargá CV Belgrano en tu Android.",
    texto: "Desde Google Play, en un toque. Si preferís, también podés instalar el archivo APK directo desde esta página.",
    subtitulo: "¿Elegiste el APK? Así se instala:",
    pasos: [
      { t: "Descargá el archivo", d: "Tocá \"Descargar el APK\" desde tu celular." },
      { t: "Abrilo e instalá", d: "Si Android te lo pide, permití instalar apps de esta fuente. Es un paso normal fuera de Google Play." },
      { t: "Creá tu primer CV", d: "Abrí CV Belgrano, respondé las 3 preguntas y empezá." },
    ],
  },

  faq: {
    etiqueta: "PREGUNTAS FRECUENTES",
    titulo: "Lo que todos preguntan.",
    items: [
      {
        p: "¿Qué puedo hacer gratis?",
        r: "Casi todo. Usar la app, armar tus perfiles, descargar tus CV en PDF, más de 30 plantillas (la versión ATS y dos diseños por área), el análisis y las recomendaciones de tu CV, el orden automático de las secciones, el chat de ayuda y todo el modo accesible. Premium suma diseños nuevos y la IA, para quien los quiera.",
      },
      {
        p: "¿Tiene publicidad?",
        r: "No, y no la va a tener. CV Belgrano se sostiene solo con las suscripciones de quienes eligen un plan.",
      },
      {
        p: "¿Tengo que crear una cuenta?",
        r: "No. Abrís la app y empezás. No pedimos correo ni contraseña. Si te suscribís, el plan queda asociado a tu cuenta de Google Play, así lo recuperás con \"Restaurar compras\" en otro teléfono.",
      },
      {
        p: "¿Cómo cancelo la suscripción?",
        r: "Desde Ajustes → CV Belgrano Premium → \"Cancelar suscripción\", o desde Google Play. El botón está siempre a la vista. Los PDF que ya descargaste son tuyos y se quedan en tu celular.",
      },
      {
        p: "¿Qué hace \"Analizar y potenciar con IA\"?",
        r: "Revisa tu CV y te propone una versión mejor redactada: logros con números, verbos de acción y palabras clave de tu área. Vos ves los cambios, los aplicás si te gustan y podés volver a la versión anterior.",
      },
      {
        p: "¿Qué datos se envían a la IA?",
        r: "Solo el texto de tu CV: nunca tu foto ni tus datos de contacto. Te pedimos permiso la primera vez y la app avisa que hace falta internet. El analizador gratis, en cambio, funciona sin conexión y no envía nada.",
      },
      {
        p: "¿Dónde quedan mis datos?",
        r: "En tu celular. Tus perfiles y tus CV se guardan en el teléfono, no en una cuenta en internet. Premium sigue funcionando hasta 30 días sin conexión.",
      },
      {
        p: "¿Los CV pasan los filtros automáticos de las empresas?",
        r: "Cada área tiene una versión ATS, gratis: un diseño simple y limpio, pensado para que los sistemas de selección lean bien tu información.",
      },
      {
        p: "¿Sirve si es mi primer CV?",
        r: "Sí. Elegís \"es mi primer CV\" y la app te muestra solo los campos que te sirven, con ejemplos. El analizador te sugiere listas y tarjetas para destacar cursos, proyectos o voluntariados.",
      },
    ],
  },

  cierre: {
    titulo: "Tu próxima oportunidad puede llegar hoy.",
    texto: "Tené tu CV listo y potenciado. Descargá CV Belgrano gratis y armalo en minutos.",
    boton: "Descargar CV Belgrano",
    pie: "CV Belgrano · Uso gratis · Sin registro · Sin publicidad · Android",
  },
};

/* ============================== ENGLISH ============================== */

const en = {
  meta: {
    titulo: "CV Belgrano · Your résumé from your phone",
  },

  barra: {
    enlacesAria: "Sections",
    enlaces: [
      { href: "#funciones", texto: "Features" },
      { href: "#gratis", texto: "Free" },
      { href: "#ia", texto: "AI" },
      { href: "#planes", texto: "Plans" },
      { href: "#preguntas", texto: "FAQ" },
    ],
    descargar: "Download",
    idiomaAria: "Change language",
  },

  botones: {
    play: "Get it free on Google Play",
    playDetalle: "Android · Free to download and use",
    apk: "Download the APK",
    apkDetalle: "Install directly from this page",
  },

  captura: "SCREENSHOT",

  hero: {
    logoAlt: "CV Belgrano logo",
    nombre: "CV Belgrano",
    subtitulo: "Curriculum Vitae Belgrano",
    etiqueta: "YOUR PROFESSIONAL RÉSUMÉ, FROM YOUR PHONE",
    titulo: "Build a résumé that represents you",
    tituloResalte: "and boost it with AI.",
    texto:
      "Answer 3 questions, fill in your details with examples from your field and choose from 77 designs. The app reviews your résumé, tells you what to improve and, with one tap, boosts it with AI. What you see is exactly what you get in the PDF.",
    chipsAria: "Main benefits",
    chips: ["Download your résumé for free", "No sign-up", "No ads", "Your data stays on your phone"],
    capturas: [
      { archivo: "pantalla_app.png", titulo: "Home · main panel", detalle: "The three steps to create your résumé" },
      { archivo: "pantalla_plantillas.png", titulo: "My templates · light mode", detalle: "Choosing and customizing templates" },
    ],
  },

  numeros: {
    aria: "CV Belgrano in numbers",
    items: [
      { n: "77", t: "résumé designs" },
      { n: "11", t: "job fields" },
      { n: "3", t: "languages: es · en · pt" },
      { n: "30+", t: "free templates" },
    ],
  },

  problema: {
    etiqueta: "SOUND FAMILIAR?",
    titulo: "They want your résumé by tomorrow and you don't know where to start.",
    texto:
      "Writing a résumé from scratch is hard: what to include, how to organize it, which design to use and whether it's well written. CV Belgrano solves all of that from your phone.",
    columnas: [
      { t: "\"I don't know what to write\"", d: "We give you examples for your field in every section." },
      { t: "\"I'm not sure it's good\"", d: "The analyzer tells you what's already good and what you can add." },
      { t: "\"I don't have a computer\"", d: "Build it, edit it and download it as a PDF from your phone." },
      { t: "\"Mine is out of date\"", d: "Your data is saved: add what's new and download it up to date." },
    ],
  },

  pasos: {
    etiqueta: "HOW IT WORKS",
    titulo: "From zero to your PDF résumé in 4 steps.",
    texto: "No accounts, no hassle and no design skills needed.",
    items: [
      { t: "Tell us about you", d: "Your career stage, your field and what you want to add." },
      { t: "Fill in your details", d: "Only the fields you need, with examples alongside." },
      { t: "Choose your design", d: "Try them with your data and see how many pages it takes." },
      { t: "Download and boost", d: "Your PDF ready to send, analyzed and improved with AI." },
    ],
  },

  experiencia: {
    etiqueta: "ENHANCED EXPERIENCE",
    titulo: "Answer 3 questions and the app adapts to you.",
    texto:
      "Choose your career stage, the field you want to work in and what else you want to add to your résumé. Three multiple-choice questions you can answer in under a minute.",
    galeria: [
      {
        archivo: "pantalla_pregunta_momento.png",
        titulo: "Question 1 · career stage",
        detalle: "I have experience, I'm self-employed or it's my first résumé",
        nombre: "Your career stage",
        texto: "I have experience, I work independently or it's my first résumé.",
      },
      {
        archivo: "pantalla_pregunta_area.png",
        titulo: "Question 2 · job field",
        detalle: "Customer service, technology, health, sports…",
        nombre: "Your job field",
        texto: "Customer service, technology, health, hospitality, trades and more.",
      },
      {
        archivo: "pantalla_pregunta_extras.png",
        titulo: "Question 3 · do you have any of these?",
        detalle: "Certifications, languages, driver's license, GitHub…",
        nombre: "What you want to add",
        texto: "Certifications, languages, driver's license, GitHub and more, depending on your field.",
      },
    ],
    desbloqueo: [
      { t: "Examples for your field", d: "Your answers unlock examples for what you're about to fill in." },
      { t: "Forms that fit you", d: "You only see the fields you need, nothing extra." },
      { t: "Under a minute", d: "Three quick questions and your experience is personalized." },
    ],
  },

  formularios: {
    etiqueta: "FILL IN ONLY WHAT MATTERS",
    titulo: "A tidy form that adjusts to your answers.",
    texto:
      "Your details are organized in sections that open and close: contact, professional profile, education, skills, social links and languages. Fill them in one at a time, at your own pace, with an optional profile photo.",
    lista: [
      "Collapsible sections so you never get lost",
      "Examples that guide you as you write",
      "Your own lists and cards to stand out",
      "Manage your enhanced experience anytime",
    ],
    capturas: [
      {
        archivo: "pantalla_panel_experiencia.png",
        titulo: "Main panel · manage enhanced experience",
        detalle: "Enhanced experience turned on",
        pie: "Turn on and manage your experience",
      },
      {
        archivo: "pantalla_datos_personales.png",
        titulo: "Personal details · form",
        detalle: "Contact, profile, education, skills, social links and languages",
        pie: "Personal details, organized by section",
      },
    ],
  },

  hojas: {
    etiqueta: "NO SURPRISES IN THE PDF",
    titulo: "What you see is exactly what you get.",
    texto:
      "The preview marks where each page ends with a line, and the PDF comes out the same: if it says \"1 page\", your résumé fits on one page. If it runs over, the app suggests a smaller font or reordering sections.",
    lista: [
      "Page break line in the preview",
      "Same measurements in the preview, accessible mode and PDF",
      "\"Explore résumé\" with the real PDF of each download",
    ],
    capturas: [
      {
        archivo: "pantalla_vista_hojas.png",
        titulo: "Preview · page line",
        detalle: "The red line marks the end of each page",
        pie: "Know how many pages it takes",
      },
      {
        archivo: "pantalla_explorar_pdf.png",
        titulo: "Explore résumé · real PDF",
        detalle: "The structure on top and the downloaded PDF below",
        pie: "See the PDF exactly as you sent it",
      },
    ],
  },

  plantillas: {
    etiqueta: "DESIGNS THAT STAND OUT",
    titulo: "77 templates designed for every job field.",
    texto:
      "Each of the 11 fields has its ATS version and five designs of its own, and the library adds 11 more. With free use you get the ATS version and two designs per field; Premium unlocks every design with a crown.",
    lista: [
      "Switch designs without retyping anything",
      "Reorder and hide sections as you like",
      "Adjust the font size so everything fits",
      "Free ATS version in every field",
    ],
    capturas: [
      {
        archivo: "pantalla_editor_plantilla.png",
        titulo: "Template editor",
        detalle: "Section order and font size",
        pie: "Customize every detail",
      },
      {
        archivo: "pantalla_premium_corona.png",
        titulo: "Templates · free and premium",
        detalle: "Premium designs have a crown",
        pie: "Free first, premium with a crown",
      },
    ],
  },

  ia: {
    etiqueta: "ANALYZE AND BOOST",
    titulo: "Your résumé reviewed and improved, in one tap.",
    texto:
      "Every résumé you download can be analyzed. The app tells you, in plain words, what's already good and what you can add. And with \"Analyze and boost with AI\", it suggests a stronger version, ready to apply.",
    tarjetas: [
      {
        tag: "FREE · OFFLINE",
        titulo: "Résumé analyzer",
        dorada: false,
        lista: [
          "Achievements without numbers and weak phrases",
          "Action verbs and dates that don't add up",
          "Keywords for your field",
          "How many pages your résumé takes",
        ],
      },
      {
        tag: "PREMIUM · WITH AI",
        titulo: "Boost with AI",
        dorada: true,
        lista: [
          "Rewrites your experience with clear achievements",
          "Adds the keywords employers look for",
          "Apply only the changes you like",
          "\"Go back to previous\" whenever you want",
        ],
      },
    ],
    nota: "Only the text of your résumé goes to the AI: never your photo or contact details. We ask for your permission before the first use.",
    capturas: [
      {
        archivo: "pantalla_analizador.png",
        titulo: "Résumé analyzer",
        detalle: "What's already good and ideas to add",
        pie: "Clear ideas, no scores",
      },
      {
        archivo: "pantalla_potenciar_ia.png",
        titulo: "Analyze and boost with AI",
        detalle: "Before and after, ready to apply",
        pie: "Your résumé boosted with AI",
      },
    ],
  },

  perfiles: {
    etiqueta: "ALWAYS READY",
    titulo: "Never get caught without your résumé.",
    texto:
      "Save several profiles (for example, one for customer service and another for administration) and every résumé you download. When an opportunity comes up, your résumé is already there, as a PDF or in Word.",
    lista: [
      "Several profiles in the same app",
      "Download history in \"My résumés\"",
      "Free PDF and Word (.docx) with Premium",
      "Back up your data to switch phones",
    ],
    capturas: [
      {
        archivo: "pantalla_mis_perfiles.png",
        titulo: "My profiles",
        detalle: "Several profiles saved on your phone",
        pie: "A profile for every job search",
      },
      {
        archivo: "pantalla_mis_cvs.png",
        titulo: "My résumés · downloads",
        detalle: "Your PDFs with the Analyze button",
        pie: "Your résumés always at hand",
      },
    ],
  },

  gratis: {
    etiqueta: "FREE TO USE",
    titulo: "All of this, without paying.",
    texto:
      "The app and your résumés are free. Premium is an extra: new designs and AI, for a small fee, for those who want them.",
    items: [
      { t: "Download your résumés", d: "Your résumés as PDFs, as many times as you want, with no watermarks." },
      { t: "30+ templates", d: "The ATS version and two designs for each of the 11 fields, plus one from the library." },
      { t: "Enhanced experience", d: "3 questions and the app shows only the fields and examples you need." },
      { t: "Automatic layout and order", d: "Sections arrange themselves and you know how many pages your résumé takes." },
      { t: "Résumé analysis", d: "What's already good, ideas to add and keywords for your field." },
      { t: "Recommendations", d: "Concrete tips with examples: lists, cards, achievements and more." },
      { t: "Help chat", d: "Talk to the team and keep a history of recommendations and news." },
      { t: "Polls and community", d: "Vote on designs and share your opinion on what's next." },
      { t: "Profiles and My résumés", d: "Several profiles and a history of everything you downloaded." },
      { t: "Accessible mode", d: "Designed for TalkBack, complete and free." },
      { t: "Dark mode and 3 languages", d: "Spanish, English and Portuguese, day or night." },
      { t: "No sign-up", d: "No accounts or passwords: your data stays on your phone." },
    ],
  },

  planes: {
    etiqueta: "PLANS",
    titulo: "The essentials are free. Premium adds designs and AI.",
    texto:
      "No ads and no fine print: a monthly subscription through Google Play, with \"Cancel subscription\" always in sight.",
    recomendado: "Recommended",
    items: [
      {
        id: "gratis",
        nombre: "Free",
        precio: "Free to use",
        periodo: "",
        resumen: "Create, analyze and download your résumés without paying.",
        incluye: [
          "30+ templates: ATS + 2 designs per field",
          "PDF downloads, with no watermarks",
          "Analysis and recommendations for your résumé",
          "Automatic layout and section order",
          "Help chat with recommendation history",
          "Full accessible mode",
          "One free AI analysis",
        ],
      },
      {
        id: "premium",
        nombre: "Premium",
        precio: "ARS 1,500",
        periodo: "per month",
        resumen: "Every design and AI to polish your résumé.",
        corona: true,
        destacado: true,
        incluye: [
          "Every premium design, no crown",
          "The whole design library",
          "5 \"Analyze and boost\" with AI per month",
          "Export to Word (.docx) too",
          "Works 30 days offline",
        ],
      },
      {
        id: "super",
        nombre: "Super",
        precio: "ARS 2,900",
        periodo: "per month",
        resumen: "For people who apply every week.",
        corona: true,
        incluye: [
          "Everything in Premium",
          "10 \"Analyze and boost\" per week",
          "Up to 3 per day, one for each application",
          "Ideal for tailoring your résumé to each job post",
        ],
      },
      {
        id: "ultra",
        nombre: "Ultra",
        precio: "Coming soon",
        periodo: "",
        resumen: "Your résumé in other languages, translated with AI.",
        corona: true,
        futuro: true,
        incluye: [
          "Everything in Super",
          "Résumé translation with AI (es · en · pt)",
          "To look for work abroad",
        ],
      },
    ],
    garantiasAria: "Plan terms",
    garantias: [
      "Cancel anytime",
      "Downloaded PDFs are yours",
      "Restore purchases on another phone",
      "Discount coupons",
    ],
    nota:
      "Prices in Argentine pesos, renewed monthly. The final price is the one Google Play shows when you subscribe. To subscribe you must be 18 or older, or have permission from a parent or guardian.",
  },

  privacidad: {
    etiqueta: "SIMPLE AND PRIVATE",
    titulo: "Your information is yours.",
    texto: "No accounts, no passwords and no ads. Your personal data is stored on your phone.",
    columnas: [
      { t: "No sign-up", d: "Open the app and start. We don't ask for an email or password." },
      { t: "On your phone", d: "Your profiles and résumés are saved on your phone." },
      { t: "No ads", d: "Nothing standing between you and your next job." },
      { t: "In your language", d: "Use it in Spanish, English or Portuguese, whenever you like." },
    ],
  },

  comunidad: {
    etiqueta: "COMMUNITY AND DARK MODE",
    titulo: "An app that grows with you, day or night.",
    texto:
      "From the help chat you talk to the team, get news and vote in short polls. Your conversation comes back even if you reinstall the app. And with dark mode, everything is easy on the eyes at any hour.",
    lista: [
      "Help chat in your language",
      "Your chat comes back after reinstalling",
      "Polls to share your opinion on designs",
      "Dark mode across the whole app",
    ],
    nota: "Your opinion helps us keep improving: the app grows with its community.",
    capturas: [
      {
        archivo: "pantalla_plantillas_oscuro.png",
        titulo: "My templates · dark mode",
        detalle: "The same app, comfortable at night",
        pie: "Dark mode",
      },
      {
        archivo: "pantalla_chat.png",
        titulo: "Help chat · polls",
        detalle: "A message from the team and a poll with results",
        pie: "Chat with the team",
      },
    ],
  },

  accesibilidad: {
    etiqueta: "DESIGNED FOR EVERYONE",
    titulo: "Accessibility is not an add-on. It's part of the experience.",
    parrafos: [
      "CV Belgrano has an accessible mode for people who use screen readers like TalkBack: you can create, organize, analyze and download your résumés without relying on visual elements.",
      "Because everyone deserves the same opportunities to build their working future.",
    ],
    lista: [
      "Turns on automatically with TalkBack or from Settings",
      "Templates in 3 steps, with the design described in words",
      "\"Explore résumé\": listen to your résumé before sending it",
      "The analyzer and plans are read in short blocks",
      "Accessibility is never charged: it's the same on every plan",
    ],
    capturas: [
      {
        archivo: "pantalla_accesible_ajustes.png",
        titulo: "Settings · Accessible mode",
        detalle: "The switch that turns on the accessible view",
        pie: "Turns on with one tap",
      },
      {
        archivo: "pantalla_accesible_plantillas.png",
        titulo: "Accessible mode · Templates",
        detalle: "Choose a design in 3 steps, with large buttons",
        pie: "Templates in 3 steps",
      },
      {
        archivo: "pantalla_accesible_explorar.png",
        titulo: "Accessible mode · Explore résumé",
        detalle: "The résumé read by section, without opening the PDF",
        pie: "Listen to your résumé",
      },
    ],
  },

  descarga: {
    etiqueta: "INSTALL IT IN 1 MINUTE",
    titulo: "Download CV Belgrano on your Android.",
    texto: "From Google Play, in one tap. If you prefer, you can also install the APK file directly from this page.",
    subtitulo: "Chose the APK? Here's how to install it:",
    pasos: [
      { t: "Download the file", d: "Tap \"Download the APK\" on your phone." },
      { t: "Open it and install", d: "If Android asks, allow installing apps from this source. It's a normal step outside Google Play." },
      { t: "Create your first résumé", d: "Open CV Belgrano, answer the 3 questions and get started." },
    ],
  },

  faq: {
    etiqueta: "FREQUENTLY ASKED QUESTIONS",
    titulo: "What everyone asks.",
    items: [
      {
        p: "What can I do for free?",
        r: "Almost everything. Use the app, build your profiles, download your résumés as PDFs, 30+ templates (the ATS version and two designs per field), résumé analysis and recommendations, automatic section order, the help chat and the full accessible mode. Premium adds new designs and AI, for those who want them.",
      },
      {
        p: "Does it have ads?",
        r: "No, and it never will. CV Belgrano is supported only by the subscriptions of people who choose a plan.",
      },
      {
        p: "Do I need to create an account?",
        r: "No. Open the app and start. We don't ask for an email or password. If you subscribe, the plan is linked to your Google Play account, so you can get it back with \"Restore purchases\" on another phone.",
      },
      {
        p: "How do I cancel my subscription?",
        r: "From Settings → CV Belgrano Premium → \"Cancel subscription\", or from Google Play. The button is always in sight. The PDFs you've already downloaded are yours and stay on your phone.",
      },
      {
        p: "What does \"Analyze and boost with AI\" do?",
        r: "It reviews your résumé and suggests a better-written version: achievements with numbers, action verbs and keywords for your field. You see the changes, apply the ones you like and can go back to the previous version.",
      },
      {
        p: "What data is sent to the AI?",
        r: "Only the text of your résumé: never your photo or contact details. We ask for your permission the first time and the app lets you know it needs internet. The free analyzer, on the other hand, works offline and sends nothing.",
      },
      {
        p: "Where is my data stored?",
        r: "On your phone. Your profiles and résumés are saved on the device, not in an online account. Premium keeps working for up to 30 days offline.",
      },
      {
        p: "Will my résumé pass employers' automatic filters?",
        r: "Every field has a free ATS version: a simple, clean design so applicant tracking systems can read your information correctly.",
      },
      {
        p: "Does it work if it's my first résumé?",
        r: "Yes. Choose \"it's my first résumé\" and the app shows only the fields you need, with examples. The analyzer suggests lists and cards to highlight courses, projects or volunteering.",
      },
    ],
  },

  cierre: {
    titulo: "Your next opportunity could come today.",
    texto: "Have your résumé ready and boosted. Download CV Belgrano for free and build it in minutes.",
    boton: "Download CV Belgrano",
    pie: "CV Belgrano · Free to use · No sign-up · No ads · Android",
  },
};

/* ============================= PORTUGUÊS ============================= */

const pt = {
  meta: {
    titulo: "CV Belgrano · Seu currículo pelo celular",
  },

  barra: {
    enlacesAria: "Seções",
    enlaces: [
      { href: "#funciones", texto: "Recursos" },
      { href: "#gratis", texto: "Grátis" },
      { href: "#ia", texto: "IA" },
      { href: "#planes", texto: "Planos" },
      { href: "#preguntas", texto: "Dúvidas" },
    ],
    descargar: "Baixar",
    idiomaAria: "Mudar idioma",
  },

  botones: {
    play: "Baixe grátis no Google Play",
    playDetalle: "Android · Download e uso grátis",
    apk: "Baixar o APK",
    apkDetalle: "Instalação direta por esta página",
  },

  captura: "CAPTURA",

  hero: {
    logoAlt: "Logo do CV Belgrano",
    nombre: "CV Belgrano",
    subtitulo: "Currículo Belgrano",
    etiqueta: "SEU CURRÍCULO PROFISSIONAL, PELO CELULAR",
    titulo: "Monte um currículo que represente você",
    tituloResalte: "e potencialize com IA.",
    texto:
      "Responda 3 perguntas, preencha seus dados com exemplos da sua área e escolha entre 77 modelos. O app revisa seu currículo, diz o que melhorar e, com um toque, potencializa com IA. O que você vê é exatamente o que sai no PDF.",
    chipsAria: "Principais vantagens",
    chips: ["Baixe seu currículo grátis", "Sem cadastro", "Sem anúncios", "Seus dados no seu celular"],
    capturas: [
      { archivo: "pantalla_app.png", titulo: "Início · painel principal", detalle: "Os três passos para criar seu currículo" },
      { archivo: "pantalla_plantillas.png", titulo: "Meus modelos · modo claro", detalle: "Escolha e personalização de modelos" },
    ],
  },

  numeros: {
    aria: "CV Belgrano em números",
    items: [
      { n: "77", t: "modelos de currículo" },
      { n: "11", t: "áreas de trabalho" },
      { n: "3", t: "idiomas: es · en · pt" },
      { n: "+30", t: "modelos grátis" },
    ],
  },

  problema: {
    etiqueta: "JÁ ACONTECEU COM VOCÊ?",
    titulo: "Pedem seu currículo para amanhã e você não sabe por onde começar.",
    texto:
      "Montar um currículo do zero é difícil: o que colocar, como organizar, que modelo usar e se está bem escrito. O CV Belgrano resolve tudo isso pelo celular.",
    columnas: [
      { t: "\"Não sei o que escrever\"", d: "Damos exemplos pensados para a sua área em cada seção." },
      { t: "\"Não sei se está bom\"", d: "O analisador mostra o que já está bom e o que você pode acrescentar." },
      { t: "\"Não tenho computador\"", d: "Você monta, edita e baixa em PDF pelo celular." },
      { t: "\"Está desatualizado\"", d: "Seus dados ficam salvos: acrescente o que é novo e baixe atualizado." },
    ],
  },

  pasos: {
    etiqueta: "COMO FUNCIONA",
    titulo: "Do zero ao seu currículo em PDF, em 4 passos.",
    texto: "Sem contas, sem complicação e sem precisar entender de design.",
    items: [
      { t: "Conte sobre você", d: "Seu momento profissional, sua área e o que quer acrescentar." },
      { t: "Preencha seus dados", d: "Só os campos que importam, com exemplos ao lado." },
      { t: "Escolha seu modelo", d: "Teste com seus dados e veja quantas páginas ocupa." },
      { t: "Baixe e potencialize", d: "Seu PDF pronto para enviar, analisado e melhorado com IA." },
    ],
  },

  experiencia: {
    etiqueta: "EXPERIÊNCIA APRIMORADA",
    titulo: "Responda 3 perguntas e o app se adapta a você.",
    texto:
      "Escolha seu momento profissional, a área em que quer trabalhar e o que mais quer acrescentar ao currículo. São três perguntas de múltipla escolha que se respondem em menos de um minuto.",
    galeria: [
      {
        archivo: "pantalla_pregunta_momento.png",
        titulo: "Pergunta 1 · momento profissional",
        detalle: "Tenho experiência, trabalho como autônomo ou é meu primeiro currículo",
        nombre: "Seu momento profissional",
        texto: "Tenho experiência, trabalho como autônomo ou é meu primeiro currículo.",
      },
      {
        archivo: "pantalla_pregunta_area.png",
        titulo: "Pergunta 2 · área de trabalho",
        detalle: "Atendimento, tecnologia, saúde, esportes…",
        nombre: "Sua área de trabalho",
        texto: "Atendimento ao cliente, tecnologia, saúde, gastronomia, ofícios e mais.",
      },
      {
        archivo: "pantalla_pregunta_extras.png",
        titulo: "Pergunta 3 · você tem algum destes?",
        detalle: "Certificações, idiomas, CNH, GitHub…",
        nombre: "O que você quer acrescentar",
        texto: "Certificações, idiomas, carteira de motorista, GitHub e mais, conforme a sua área.",
      },
    ],
    desbloqueo: [
      { t: "Exemplos para a sua área", d: "Ao responder, você desbloqueia exemplos para o que vai preencher." },
      { t: "Formulários sob medida", d: "Você vê só os campos que importam, sem dados a mais." },
      { t: "Menos de um minuto", d: "Três perguntas rápidas e sua experiência fica personalizada." },
    ],
  },

  formularios: {
    etiqueta: "PREENCHA SÓ O QUE IMPORTA",
    titulo: "Um formulário organizado, que se ajusta às suas respostas.",
    texto:
      "Seus dados ficam organizados em seções que abrem e fecham: contato, perfil profissional, formação, habilidades, redes e idiomas. Você preenche uma por uma, no seu ritmo, com foto de perfil opcional.",
    lista: [
      "Seções recolhíveis para você não se perder",
      "Exemplos que guiam você enquanto escreve",
      "Listas e cartões próprios para se destacar",
      "Gerencie sua experiência aprimorada quando quiser",
    ],
    capturas: [
      {
        archivo: "pantalla_panel_experiencia.png",
        titulo: "Painel principal · gerenciar experiência aprimorada",
        detalle: "Experiência aprimorada ativada",
        pie: "Ative e gerencie sua experiência",
      },
      {
        archivo: "pantalla_datos_personales.png",
        titulo: "Dados pessoais · formulário",
        detalle: "Contato, perfil, formação, habilidades, redes e idiomas",
        pie: "Dados pessoais, organizados por seções",
      },
    ],
  },

  hojas: {
    etiqueta: "SEM SURPRESAS NO PDF",
    titulo: "O que você vê é exatamente o que sai.",
    texto:
      "A pré-visualização marca com uma linha onde termina cada página, e o PDF sai igual: se diz \"1 página\", seu currículo cabe em uma página. Se passar, o app sugere diminuir a letra ou reordenar as seções.",
    lista: [
      "Linha de quebra de página na pré-visualização",
      "Mesma medida na pré-visualização, no modo acessível e no PDF",
      "\"Explorar currículo\" com o PDF real de cada download",
    ],
    capturas: [
      {
        archivo: "pantalla_vista_hojas.png",
        titulo: "Pré-visualização · linha de página",
        detalle: "A linha vermelha marca o fim de cada página",
        pie: "Saiba quantas páginas ocupa",
      },
      {
        archivo: "pantalla_explorar_pdf.png",
        titulo: "Explorar currículo · PDF real",
        detalle: "A estrutura em cima e o PDF baixado embaixo",
        pie: "Veja o PDF do jeito que você enviou",
      },
    ],
  },

  plantillas: {
    etiqueta: "MODELOS QUE CHAMAM ATENÇÃO",
    titulo: "77 modelos pensados para cada área de trabalho.",
    texto:
      "Cada uma das 11 áreas tem sua versão ATS e cinco modelos próprios, e a biblioteca soma mais 11. No uso grátis você tem a versão ATS e dois modelos por área; com o Premium, todos os que têm coroa são liberados.",
    lista: [
      "Troque de modelo sem digitar nada de novo",
      "Reordene e oculte seções do seu jeito",
      "Ajuste o tamanho da letra para caber tudo",
      "Versão ATS grátis em todas as áreas",
    ],
    capturas: [
      {
        archivo: "pantalla_editor_plantilla.png",
        titulo: "Editor de modelo",
        detalle: "Ordem das seções e tamanho da letra",
        pie: "Personalize cada detalhe",
      },
      {
        archivo: "pantalla_premium_corona.png",
        titulo: "Modelos · grátis e premium",
        detalle: "Os modelos premium têm uma coroa",
        pie: "Grátis primeiro, premium com coroa",
      },
    ],
  },

  ia: {
    etiqueta: "ANALISAR E POTENCIALIZAR",
    titulo: "Seu currículo revisado e melhorado, com um toque.",
    texto:
      "Todo currículo que você baixa pode ser analisado. O app diz, em palavras simples, o que já está bom e o que você pode acrescentar. E com \"Analisar e potencializar com IA\", ele propõe uma versão mais forte, pronta para aplicar.",
    tarjetas: [
      {
        tag: "GRÁTIS · SEM INTERNET",
        titulo: "Analisador de currículo",
        dorada: false,
        lista: [
          "Conquistas sem números e frases fracas",
          "Verbos de ação e datas que não batem",
          "Palavras-chave da sua área",
          "Quantas páginas seu currículo ocupa",
        ],
      },
      {
        tag: "PREMIUM · COM IA",
        titulo: "Potencializar com IA",
        dorada: true,
        lista: [
          "Reescreve sua experiência com conquistas claras",
          "Acrescenta as palavras-chave que as empresas buscam",
          "Você aplica só as mudanças que gostar",
          "\"Voltar à anterior\" quando quiser",
        ],
      },
    ],
    nota: "Para a IA vai só o texto do currículo: nunca sua foto nem seus dados de contato. Pedimos sua permissão antes do primeiro uso.",
    capturas: [
      {
        archivo: "pantalla_analizador.png",
        titulo: "Analisador de currículo",
        detalle: "O que já está bom e ideias para acrescentar",
        pie: "Ideias claras, sem notas",
      },
      {
        archivo: "pantalla_potenciar_ia.png",
        titulo: "Analisar e potencializar com IA",
        detalle: "Antes e depois, pronto para aplicar",
        pie: "Seu currículo potencializado com IA",
      },
    ],
  },

  perfiles: {
    etiqueta: "SEMPRE PRONTO",
    titulo: "Que seu currículo nunca pegue você desprevenido.",
    texto:
      "Salve vários perfis (por exemplo, um para atendimento e outro para administração) e todos os currículos que baixar. Quando aparece uma oportunidade, seu currículo já está lá, em PDF ou em Word.",
    lista: [
      "Vários perfis no mesmo app",
      "Histórico de downloads em \"Meus currículos\"",
      "PDF grátis e Word (.docx) com Premium",
      "Backup dos seus dados para trocar de celular",
    ],
    capturas: [
      {
        archivo: "pantalla_mis_perfiles.png",
        titulo: "Meus perfis",
        detalle: "Vários perfis salvos no celular",
        pie: "Um perfil para cada busca",
      },
      {
        archivo: "pantalla_mis_cvs.png",
        titulo: "Meus currículos · downloads",
        detalle: "Seus PDFs com o botão Analisar",
        pie: "Seus currículos sempre à mão",
      },
    ],
  },

  gratis: {
    etiqueta: "USO GRÁTIS",
    titulo: "Tudo isso você usa sem pagar.",
    texto:
      "O app e seus currículos são grátis. O premium é um extra: modelos novos e a IA, com pagamentos pequenos, para quem quiser.",
    items: [
      { t: "Download dos currículos", d: "Seus currículos em PDF, quantas vezes quiser, sem marca d'água." },
      { t: "Mais de 30 modelos", d: "A versão ATS e dois modelos para cada uma das 11 áreas, mais um da biblioteca." },
      { t: "Experiência aprimorada", d: "3 perguntas e o app mostra só os campos e exemplos que importam." },
      { t: "Montagem e ordem automáticas", d: "As seções se ajustam sozinhas e você sabe quantas páginas o currículo ocupa." },
      { t: "Análise do currículo", d: "O que já está bom, ideias para acrescentar e palavras-chave da sua área." },
      { t: "Recomendações", d: "Dicas concretas com exemplos: listas, cartões, conquistas e mais." },
      { t: "Chat de ajuda", d: "Fale com a equipe e guarde o histórico de recomendações e novidades." },
      { t: "Enquetes e comunidade", d: "Vote em modelos e dê sua opinião sobre o que vem por aí." },
      { t: "Perfis e Meus currículos", d: "Vários perfis e o histórico de tudo o que você baixou." },
      { t: "Modo acessível", d: "Pensado para o TalkBack, completo e sem custo." },
      { t: "Modo escuro e 3 idiomas", d: "Espanhol, inglês e português, de dia ou de noite." },
      { t: "Sem cadastro", d: "Sem contas nem senhas: seus dados ficam no seu celular." },
    ],
  },

  planes: {
    etiqueta: "PLANOS",
    titulo: "O essencial é grátis. O Premium soma modelos e IA.",
    texto:
      "Sem anúncios e sem letras miúdas: assinatura mensal pelo Google Play, com \"Cancelar assinatura\" sempre à vista.",
    recomendado: "Recomendado",
    items: [
      {
        id: "gratis",
        nombre: "Grátis",
        precio: "Uso grátis",
        periodo: "",
        resumen: "Crie, analise e baixe seus currículos sem pagar.",
        incluye: [
          "Mais de 30 modelos: ATS + 2 por área",
          "Download em PDF, sem marca d'água",
          "Análise e recomendações para o seu currículo",
          "Montagem e ordem automáticas das seções",
          "Chat de ajuda com histórico de recomendações",
          "Modo acessível completo",
          "Uma análise com IA de presente",
        ],
      },
      {
        id: "premium",
        nombre: "Premium",
        precio: "ARS 1.500",
        periodo: "por mês",
        resumen: "Todos os modelos e a IA para aprimorar seu currículo.",
        corona: true,
        destacado: true,
        incluye: [
          "Todos os modelos premium, sem coroa",
          "Toda a biblioteca de modelos",
          "5 \"Analisar e potencializar\" com IA por mês",
          "Exporte também em Word (.docx)",
          "Funciona 30 dias sem conexão",
        ],
      },
      {
        id: "super",
        nombre: "Super",
        precio: "ARS 2.900",
        periodo: "por mês",
        resumen: "Para quem se candidata toda semana.",
        corona: true,
        incluye: [
          "Tudo do Premium",
          "10 \"Analisar e potencializar\" por semana",
          "Até 3 por dia, um para cada candidatura",
          "Ideal para adaptar o currículo a cada vaga",
        ],
      },
      {
        id: "ultra",
        nombre: "Ultra",
        precio: "Em breve",
        periodo: "",
        resumen: "Seu currículo em outros idiomas, traduzido com IA.",
        corona: true,
        futuro: true,
        incluye: [
          "Tudo do Super",
          "Tradução do currículo com IA (es · en · pt)",
          "Para buscar trabalho fora do país",
        ],
      },
    ],
    garantiasAria: "Condições dos planos",
    garantias: [
      "Cancele quando quiser",
      "Os PDFs baixados são seus",
      "Restaurar compras em outro celular",
      "Cupons de desconto",
    ],
    nota:
      "Preços em pesos argentinos, com renovação mensal. O preço final é o que o Google Play mostra ao assinar. Para assinar, você precisa ter 18 anos ou mais, ou a permissão da sua mãe, pai ou responsável.",
  },

  privacidad: {
    etiqueta: "SIMPLES E PRIVADO",
    titulo: "Suas informações são suas.",
    texto: "Sem contas, sem senhas e sem anúncios. Seus dados pessoais ficam salvos no seu celular.",
    columnas: [
      { t: "Sem cadastro", d: "Abra o app e comece. Não pedimos e-mail nem senha." },
      { t: "No seu celular", d: "Seus perfis e currículos ficam salvos no aparelho." },
      { t: "Sem anúncios", d: "Nada de propaganda entre você e seu próximo emprego." },
      { t: "No seu idioma", d: "Use em espanhol, inglês ou português, quando quiser." },
    ],
  },

  comunidad: {
    etiqueta: "COMUNIDADE E MODO ESCURO",
    titulo: "Um app que cresce com você, de dia ou de noite.",
    texto:
      "Pelo chat de ajuda você fala com a equipe, recebe novidades e vota em enquetes rápidas. Sua conversa volta mesmo se você reinstalar o app. E com o modo escuro, tudo fica confortável a qualquer hora.",
    lista: [
      "Chat de ajuda no seu idioma",
      "Seu chat volta ao reinstalar",
      "Enquetes para opinar sobre os modelos",
      "Modo escuro no app inteiro",
    ],
    nota: "Sua opinião nos ajuda a continuar melhorando: o app cresce junto com a comunidade.",
    capturas: [
      {
        archivo: "pantalla_plantillas_oscuro.png",
        titulo: "Meus modelos · modo escuro",
        detalle: "O mesmo app, confortável à noite",
        pie: "Modo escuro",
      },
      {
        archivo: "pantalla_chat.png",
        titulo: "Chat de ajuda · enquetes",
        detalle: "Mensagem da equipe e enquete com resultados",
        pie: "Chat com a equipe",
      },
    ],
  },

  accesibilidad: {
    etiqueta: "FEITO PARA TODOS",
    titulo: "Acessibilidade não é um recurso extra. É parte da experiência.",
    parrafos: [
      "O CV Belgrano tem um modo acessível pensado para quem usa leitores de tela como o TalkBack: você pode criar, organizar, analisar e baixar seus currículos sem depender de elementos visuais.",
      "Porque todas as pessoas merecem as mesmas oportunidades para construir seu futuro profissional.",
    ],
    lista: [
      "Ativa sozinho com o TalkBack ou pelas Configurações",
      "Modelos em 3 passos, com o design descrito em palavras",
      "\"Explorar currículo\": ouça seu currículo antes de enviar",
      "O analisador e os planos são lidos em blocos curtos",
      "Acessibilidade não se cobra: é igual em todos os planos",
    ],
    capturas: [
      {
        archivo: "pantalla_accesible_ajustes.png",
        titulo: "Configurações · Modo acessível",
        detalle: "O interruptor que ativa a visualização acessível",
        pie: "Ativa com um toque",
      },
      {
        archivo: "pantalla_accesible_plantillas.png",
        titulo: "Modo acessível · Modelos",
        detalle: "Escolher o modelo em 3 passos, com botões grandes",
        pie: "Modelos em 3 passos",
      },
      {
        archivo: "pantalla_accesible_explorar.png",
        titulo: "Modo acessível · Explorar currículo",
        detalle: "O currículo lido por seções, sem abrir o PDF",
        pie: "Ouça seu currículo",
      },
    ],
  },

  descarga: {
    etiqueta: "INSTALE EM 1 MINUTO",
    titulo: "Baixe o CV Belgrano no seu Android.",
    texto: "Pelo Google Play, com um toque. Se preferir, você também pode instalar o arquivo APK direto por esta página.",
    subtitulo: "Escolheu o APK? Veja como instalar:",
    pasos: [
      { t: "Baixe o arquivo", d: "Toque em \"Baixar o APK\" no seu celular." },
      { t: "Abra e instale", d: "Se o Android pedir, permita instalar apps desta fonte. É um passo normal fora do Google Play." },
      { t: "Crie seu primeiro currículo", d: "Abra o CV Belgrano, responda as 3 perguntas e comece." },
    ],
  },

  faq: {
    etiqueta: "PERGUNTAS FREQUENTES",
    titulo: "O que todo mundo pergunta.",
    items: [
      {
        p: "O que posso fazer de graça?",
        r: "Quase tudo. Usar o app, montar seus perfis, baixar seus currículos em PDF, mais de 30 modelos (a versão ATS e dois por área), a análise e as recomendações do currículo, a ordem automática das seções, o chat de ajuda e todo o modo acessível. O Premium soma modelos novos e a IA, para quem quiser.",
      },
      {
        p: "Tem anúncios?",
        r: "Não, e nunca vai ter. O CV Belgrano se mantém só com as assinaturas de quem escolhe um plano.",
      },
      {
        p: "Preciso criar uma conta?",
        r: "Não. Abra o app e comece. Não pedimos e-mail nem senha. Se você assinar, o plano fica ligado à sua conta do Google Play, e você recupera com \"Restaurar compras\" em outro celular.",
      },
      {
        p: "Como cancelo a assinatura?",
        r: "Em Configurações → CV Belgrano Premium → \"Cancelar assinatura\", ou pelo Google Play. O botão está sempre à vista. Os PDFs que você já baixou são seus e ficam no seu celular.",
      },
      {
        p: "O que faz \"Analisar e potencializar com IA\"?",
        r: "Revisa seu currículo e propõe uma versão mais bem escrita: conquistas com números, verbos de ação e palavras-chave da sua área. Você vê as mudanças, aplica as que gostar e pode voltar à versão anterior.",
      },
      {
        p: "Quais dados são enviados para a IA?",
        r: "Só o texto do seu currículo: nunca sua foto nem seus dados de contato. Pedimos sua permissão na primeira vez e o app avisa que precisa de internet. Já o analisador grátis funciona sem conexão e não envia nada.",
      },
      {
        p: "Onde ficam meus dados?",
        r: "No seu celular. Seus perfis e currículos ficam salvos no aparelho, não numa conta na internet. O Premium continua funcionando até 30 dias sem conexão.",
      },
      {
        p: "Os currículos passam pelos filtros automáticos das empresas?",
        r: "Cada área tem uma versão ATS grátis: um modelo simples e limpo, pensado para que os sistemas de seleção leiam bem suas informações.",
      },
      {
        p: "Serve se for meu primeiro currículo?",
        r: "Sim. Escolha \"é meu primeiro currículo\" e o app mostra só os campos que importam, com exemplos. O analisador sugere listas e cartões para destacar cursos, projetos ou voluntariado.",
      },
    ],
  },

  cierre: {
    titulo: "Sua próxima oportunidade pode chegar hoje.",
    texto: "Tenha seu currículo pronto e potencializado. Baixe o CV Belgrano grátis e monte em minutos.",
    boton: "Baixar o CV Belgrano",
    pie: "CV Belgrano · Uso grátis · Sem cadastro · Sem anúncios · Android",
  },
};

export const TEXTOS = { es, en, pt };
