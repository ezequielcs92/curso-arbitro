# ÁRBITRO AMATEUR — Especificación completa de la app

## 1. Resumen del proyecto

**Nombre provisional:** Árbitro Amateur  
**Tipo de producto:** Aplicación web responsive / PWA de formación interactiva  
**Objetivo principal:** Formar a una persona desde cero para poder dirigir partidos amateur y torneos privados de fútbol 5, 7, 8 y 11, futsal y fútbol playa.

Las tres disciplinas y sus fuentes reglamentarias se detallan en la sección 6.1.

La aplicación no busca formar árbitros profesionales ni reemplazar cursos oficiales de asociaciones o federaciones. Su objetivo es enseñar reglamento, criterio arbitral, posicionamiento, señalización, comunicación, manejo de partido y adaptación a reglamentos particulares de ligas privadas.

La experiencia debe sentirse más como un **entrenador personal de arbitraje** que como un curso tradicional.

---

# 2. Problema a resolver

La mayoría de los cursos online de arbitraje tienen tres problemas:

1. Mucha teoría y poca interacción.
2. No obligan al alumno a tomar decisiones arbitrales reales.
3. No preparan específicamente para las particularidades de torneos amateur y privados.

La app debe resolver esto mediante:

- progresión por niveles;
- microlecciones;
- decisiones situacionales;
- exámenes;
- análisis de jugadas;
- simulaciones;
- práctica en cancha;
- seguimiento del progreso;
- repetición inteligente de errores;
- reglamentos personalizados por torneo;
- checklist previo al partido;
- evaluación posterior al partido.

---

# 3. Usuario principal

Persona que:

- nunca arbitró o tiene poca experiencia;
- quiere dirigir fútbol amateur;
- quiere trabajar en ligas privadas;
- no necesita homologación profesional;
- busca aprender desde su casa;
- puede complementar con práctica presencial.

Ejemplos de competiciones:

- fútbol 5;
- fútbol 6;
- fútbol 7;
- fútbol 8;
- fútbol 9;
- fútbol 11 amateur;
- futsal;
- fútbol playa;
- torneos empresariales;
- torneos barriales;
- ligas universitarias;
- campeonatos privados;
- campeonatos recreativos.

---

# 4. Objetivo de aprendizaje

Al completar el curso, el usuario debería poder:

- preparar correctamente un partido;
- inspeccionar cancha, jugadores y equipamiento;
- dominar las 17 Reglas de Juego;
- reconocer faltas;
- reconocer sanciones disciplinarias;
- distinguir imprudencia, temeridad y fuerza excesiva;
- aplicar ventaja;
- comprender fuera de juego;
- administrar tiros libres;
- administrar penales;
- controlar protestas;
- manejar situaciones conflictivas;
- usar correctamente silbato y tarjetas;
- posicionarse correctamente;
- administrar tiempo;
- registrar goles, tarjetas e incidencias;
- completar planillas y redactar informes arbitrales;
- interpretar reglamentos propios de ligas privadas;
- dirigir fútbol 5, 7, 8 y 11;
- dirigir futsal y fútbol playa según su reglamento propio;
- realizar una autoevaluación después de cada partido.

---

# 5. Principio pedagógico

La aplicación debe enseñar siempre mediante esta secuencia:

## VER → DECIDIR → EXPLICAR → CORREGIR → REPETIR

No alcanza con leer reglas.

El usuario debe enfrentarse a situaciones como:

> Un defensor derriba temerariamente a un atacante fuera del área.

Y responder:

### Decisión técnica
Tiro libre directo.

### Decisión disciplinaria
Tarjeta amarilla.

### Reanudación
Desde el lugar de la infracción.

La app debe evaluar cada componente de la respuesta de forma independiente.

---

# 6. Fuente reglamentaria

Para fútbol, la referencia principal será la edición vigente de las **Reglas de Juego de IFAB**. Futsal y fútbol playa tienen reglamento propio de FIFA: ver sección 6.1.

Para esta versión inicial:

**IFAB 2026/27**

La aplicación debe almacenar qué versión del reglamento utiliza.

Ejemplo:

```ts
rulesVersion = "IFAB 2026/27"
```

Esto permitirá actualizar el contenido cada temporada.

La app debe diferenciar claramente entre:

### REGLA IFAB

Reglas generales del fútbol.

### REGLA DE COMPETICIÓN

Modificaciones permitidas por la organización.

### REGLA PRIVADA

Reglas particulares de un torneo amateur.

Nunca presentar una regla privada como si fuera reglamento oficial.

---
# 6.1 Las tres disciplinas y sus fuentes

El producto contiene **tres cursos independientes**:

| Curso | Formatos | Reglamento | Vigente desde |
| --- | --- | --- | --- |
| Fútbol | F5, F6, F7, F8, F9, F11 | IFAB — Reglas de Juego 2026/27 | 2026 |
| Futsal | Futsal | FIFA — Futsal Laws of the Game 2025-26 | 5/9/2025 |
| Fútbol playa | Fútbol playa | FIFA — Beach Soccer Laws of the Game 2025-26 | 17/12/2025 |

## Advertencia estructural

Los formatos reducidos de fútbol —F5, F7, F8, F9— **no son deportes distintos**.
Son fútbol jugado con menos jugadores, bajo las Reglas de Juego de IFAB con las
modificaciones que la organización tiene permitido aplicar. Comparten fuente.

**Futsal y fútbol playa sí son deportes distintos.** Tienen reglamento propio,
publicado por FIFA en documentos separados, con ciclo de edición independiente
del de IFAB. No son "fútbol 5 con algunos cambios": difieren en cantidad de
períodos, cronometraje, sistema disciplinario, reanudaciones, rol del arquero y
tratamiento de las faltas.

Consecuencia práctica: no son dos módulos más. Son **dos cursos más**, cada uno
con su banco de preguntas, sus señales y su criterio arbitral. Es el cambio de
alcance más grande que tuvo el proyecto.

Las tres comparten la numeración de 17 Leyes, lo que induce a error: la Ley 15
es saque de banda con las manos en fútbol, saque con el pie en futsal, y con el
pie o la mano en fútbol playa. Mismo número, tres reanudaciones distintas.

## Tres fuentes, tres versiones

Cada disciplina versiona por separado. Al día de hoy:

```ts
rulesVersions = {
  football:    "IFAB 2026/27",
  futsal:      "FIFA Futsal 2025-26",
  beachSoccer: "FIFA Beach Soccer 2025-26"
}
```

Fuentes oficiales:

- **Fútbol** — IFAB, Reglas de Juego 2026/27:
  https://www.theifab.com/laws-of-the-game-documents/
- **Futsal** — FIFA, Futsal Laws of the Game 2025-26:
  https://digitalhub.fifa.com/m/20d52e6779b53321/original/FUTSAL-Laws-of-the-Game-2025-2026.pdf
- **Fútbol playa** — FIFA, Beach Soccer Laws of the Game 2025-26. FIFA lo publica
  en inglés, árabe, francés y español.

Ninguna afirmación reglamentaria de futsal o fútbol playa puede escribirse por
analogía con el fútbol. Se lee del documento correspondiente o no se escribe.

## Eje de disciplina en el modelo de datos

Se agrega un eje transversal que atraviesa lecciones, preguntas, ligas y
partidos:

```ts
type Discipline = "football" | "futsal" | "beach_soccer"
```

Este campo se introduce **desde el inicio**, aunque el contenido de futsal y
playa llegue después. Agregarlo ahora cuesta un campo; agregarlo con doscientas
preguntas escritas obliga a reclasificarlas todas a mano.

La combinación que identifica el contexto reglamentario de cualquier contenido
es:

```ts
{ discipline, rulesVersion, ruleSource }
```

donde `ruleSource` es `official | competition | private`. `official` significa el
reglamento base de la disciplina: IFAB para fútbol, FIFA para futsal y playa.

## Tres cursos independientes

No es un curso con ramas. Son **tres cursos separados**, uno por disciplina,
cada uno con su reglamento, su progresión, su banco de preguntas y su
certificado.

| Curso | Módulos | Reglamento |
| --- | ---: | --- |
| Fútbol (F5 a F11) | 8 | IFAB 2026/27 |
| Futsal | 10 | FIFA Futsal 2025-26 |
| Fútbol playa | 10 | FIFA Beach Soccer 2025-26 |

Se cursan y se aprueban por separado. Completar fútbol no acredita nada en
futsal.

Se descartó la alternativa de un tronco común con ramas de conversión por dos
motivos. El primero es pedagógico: un módulo que enseña "en futsal esto es
distinto" obliga a saber fútbol para entender futsal, y quien solo quiere
dirigir futsal no tiene por qué estudiar el fuera de juego. El segundo es que lo
compartido es menos de lo que parece: la escala de imprudencia, temeridad y
fuerza excesiva sí es común, pero la consecuencia de una falta no lo es. En
futsal una falta más es una falta acumulada que puede terminar en un tiro libre
sin barrera desde diez metros; en fútbol es un tiro libre y nada más.

Lo que se comparte es **infraestructura, no contenido**: el motor de
cuestionarios, la puntuación por componentes, los entrenadores, el diario de
partidos y las herramientas de cancha son los mismos para los tres. La
disciplina es un filtro sobre el contenido, no una copia del código.

El diseño curricular completo —los 28 módulos y sus 145 lecciones— está en
`docs/cursos.md`.

## Módulos que solo existen en una disciplina

Tres módulos no tienen equivalente en el curso de fútbol y son la razón por la
que futsal y playa no entran como capítulos de un curso general:

- **Futsal, faltas acumuladas y DFKSAF.** Acumulan las faltas sancionadas con
  tiro libre directo, se cuentan por equipo y por período, y a partir de la
  sexta se concede un tiro libre directo desde el punto de 10 m. Cambia qué se
  cobra, cuándo conviene dar ventaja y qué se comunica a la mesa (Ley 13.4 y
  13.5).
- **Futsal, tiempo efectivo y tiempo muerto.** Dos períodos de 20 minutos de
  reloj detenido, con cronometrador y señal acústica, más un tiempo muerto de un
  minuto por equipo y período (Ley 7).
- **Fútbol playa, tiros libres sin barrera.** Está prohibido formar barrera; el
  tiro lo ejecuta cualquier jugador que estuviera en cancha, dentro de cuatro
  segundos contados visiblemente por el árbitro, y se permite hacer un montículo
  de arena para elevar el balón (Ley 13.1 y 13.2).

## Lo que no existe en futsal ni en fútbol playa

**No hay fuera de juego en ninguna de las dos.** La Ley 11 existe en ambos
reglamentos y consiste en una sola frase que lo declara. Merece lección propia
igual: quien viene del fútbol arrastra el reflejo de mirar la línea y hay que
desmontarlo de forma explícita.

## Efecto sobre el resto del producto

- **Onboarding**: la primera pregunta pasa a ser qué disciplina se quiere
  dirigir. Determina la rama que se abre por defecto.
- **Banco de preguntas**: cada pregunta lleva `discipline`. Un examen de fútbol
  nunca sortea una pregunta de futsal.
- **Habilidades**: las puntuaciones 0-100 se registran por disciplina. Ser sólido
  en faltas de fútbol no acredita criterio en faltas de futsal, donde el sistema
  de acumuladas cambia la consecuencia de cada falta.
- **Señales**: cada disciplina tiene su repertorio. El entrenador de señales
  filtra por disciplina.
- **Ficha de liga y registro de partido**: incorporan el campo de disciplina, que
  condiciona qué campos del formulario tienen sentido.
- **Certificado interno**: declara para qué disciplinas se completó la formación.
  No se acredita futsal por haber completado fútbol.

## Orden de construcción

1. Fútbol completo, incluidos los formatos reducidos. Es la base y el tronco.
2. Futsal como primera rama de conversión, una vez validado el formato.
3. Fútbol playa al final, por ser el de menor uso previsible en torneos amateur.

Levantar las tres disciplinas en paralelo triplicaría el trabajo de contenido
antes de tener una sola completa y usable.

---

# 7. Estructura general del curso

Duración sugerida:

**8 semanas**

Carga:

**35 a 40 horas**

La duración real dependerá del progreso del usuario.

No debe existir obligación de completar una semana cada siete días.

Cada semana funciona como un nivel.

---

# 8. Sistema de progresión

El usuario comienza en:

## NIVEL 0 — Aspirante

Después avanza:

1. Aspirante
2. Árbitro en Formación
3. Árbitro Inicial
4. Árbitro Amateur
5. Árbitro de Liga

Cada nivel requiere:

- módulos completados;
- porcentaje mínimo;
- ejercicios prácticos;
- examen.

---

# 9. Regla de desbloqueo

Un módulo se considera aprobado con:

**80 %**

Si el usuario obtiene menos:

- puede revisar errores;
- recibe explicación;
- vuelve a intentarlo;
- las preguntas deben rotar.

Los módulos críticos pueden requerir:

**85 %**

Ejemplo:

- Regla 11 — Fuera de juego;
- Regla 12 — Faltas y conducta incorrecta.

---

# 10. Dashboard principal

Pantalla inicial.

Debe mostrar:

## Estado

- Nivel actual.
- % del curso.
- Racha.
- XP.
- Último módulo.
- Próxima lección.

## Estadísticas

- precisión general;
- precisión faltas;
- precisión tarjetas;
- precisión offside;
- precisión reanudaciones;
- precisión posicionamiento;
- precisión reglamento privado.

## Botones principales

- CONTINUAR CURSO
- ENTRENAR JUGADAS
- EXAMEN RÁPIDO
- PREPARAR PARTIDO
- MIS PARTIDOS
- REGLAMENTOS
- ESTADÍSTICAS

---

# 11. Gamificación

La gamificación debe motivar sin convertir el curso en un juego infantil.

## XP

Ejemplo:

- completar lección: +20 XP;
- respuesta correcta: +5 XP;
- examen perfecto: +100 XP;
- práctica registrada: +150 XP;
- partido dirigido: +300 XP.

## Rachas

Días consecutivos practicando.

## Insignias

Ejemplos:

### Primer Silbato
Completar el módulo inicial.

### Regla 12
Superar 90 % en faltas.

### Línea Perfecta
10 decisiones correctas de offside seguidas.

### Sangre Fría
Resolver correctamente cinco conflictos.

### Primer Partido
Registrar el primer partido dirigido.

### Cien Jugadas
Analizar 100 jugadas.

### Árbitro Amateur
Completar todo el curso.

---

# 12. SEMANA 1 — EL TRABAJO DEL ÁRBITRO

---

## Módulo 1 — Qué significa ser árbitro

Temas:

- autoridad;
- imparcialidad;
- seguridad;
- espíritu del juego;
- decisiones arbitrales;
- control del partido;
- relación con jugadores;
- relación con organizadores.

### Microlecciones

1. Qué hace un árbitro.
2. Qué NO hace un árbitro.
3. Autoridad.
4. Criterio.
5. Espíritu del juego.
6. Seguridad.

### Ejercicio

Mostrar situaciones y preguntar:

> ¿Qué debería hacer el árbitro?

Ejemplo:

Un jugador discute educadamente una decisión.

Opciones:

A. Amarilla inmediata.  
B. Escucharlo brevemente y continuar.  
C. Ignorarlo siempre.  
D. Expulsarlo.

Respuesta:

B.

---

# 13. Módulo 2 — Preparación del partido

Checklist previo.

## Cancha

- superficie;
- líneas;
- arcos;
- redes;
- elementos peligrosos.

## Balón

- estado;
- cantidad;
- tamaño.

## Jugadores

- cantidad;
- equipamiento;
- identificación;
- arquero.

## Organización

Preguntar:

- duración;
- cantidad de jugadores;
- cambios;
- offside;
- barridas;
- laterales;
- faltas acumuladas;
- distancia de barrera;
- tarjetas;
- desempate;
- suspensiones.

---

# 14. Herramienta: Checklist de partido

Crear sección:

## PREPARAR PARTIDO

Formulario:

### Competencia
Texto.

### Fecha

### Hora

### Lugar

### Formato

- F5
- F6
- F7
- F8
- F9
- F11

### Duración

### Cambios

- ilimitados;
- limitados;
- reingreso permitido;
- sin reingreso.

### Offside

- completo;
- reducido;
- no existe.

### Lateral

- mano;
- pie.

### Barridas

- permitidas;
- prohibidas;
- solo bloqueo;
- regla personalizada.

### Faltas acumuladas

Sí / No.

### Tarjeta azul

Sí / No.

### Exclusión temporal

Sí / No.

### Distancia barrera

Número.

### Reglas especiales

Texto libre.

Al guardar:

**GENERAR FICHA RÁPIDA**

La app crea una tarjeta con todas las reglas del torneo.

---

# 15. SEMANA 2 — REGLAS 1 A 6

---

## Regla 1 — Terreno de juego

Contenido:

- superficie;
- marcación;
- dimensiones;
- áreas;
- arcos;
- seguridad.

No priorizar memorizar medidas exactas durante la primera etapa.

Priorizar:

> ¿Puede jugarse el partido de forma segura?

---

# 16. Regla 2 — Balón

Temas:

- características;
- sustitución;
- balón defectuoso;
- balones adicionales.

---

# 17. Regla 3 — Jugadores

Temas:

- número de jugadores;
- mínimo;
- sustituciones;
- jugadores adicionales;
- ingreso;
- salida.

---

# 18. Regla 4 — Equipamiento

Temas:

- equipamiento obligatorio;
- seguridad;
- joyería;
- elementos prohibidos;
- colores.

---

# 19. Regla 5 — Árbitro

Módulo crítico.

Temas:

- autoridad;
- decisiones;
- ventaja;
- medidas disciplinarias;
- lesiones;
- interferencias;
- reanudaciones;
- cambio de decisión.

---

# 20. Regla 6 — Otros miembros arbitrales

Temas:

- árbitros asistentes;
- cuarto árbitro;
- comunicación;
- responsabilidades.

Para amateur:

explicar especialmente cómo trabajar con un asistente sin intercomunicadores.

---

# 21. Entrenador de señales

Crear pantalla:

## SEÑALES ARBITRALES

Mostrar ilustración / animación.

El usuario debe identificar:

- tiro libre directo;
- indirecto;
- ventaja;
- penal;
- saque de esquina;
- saque de meta;
- amarilla;
- roja.

Modo inverso:

La app dice:

> TIRO LIBRE INDIRECTO

El usuario debe seleccionar la señal correcta.

---

# 22. Entrenador de silbato

Pantalla educativa.

Situaciones:

- comienzo;
- falta común;
- falta fuerte;
- penal;
- final.

La app puede reproducir ejemplos auditivos.

No establecer códigos rígidos inexistentes.

Objetivo:

- claridad;
- presencia;
- consistencia.

---

# 23. SEMANA 3 — REGLAS 7 A 10

---

## Regla 7 — Duración

Temas:

- períodos;
- entretiempo;
- tiempo añadido;
- recuperación.

---

# 24. Regla 8 — Inicio y reanudación

Temas:

- saque inicial;
- balón a tierra.

---

# 25. Regla 9 — Balón en juego y fuera

Pregunta fundamental:

> ¿El balón salió COMPLETAMENTE?

Crear ejercicios visuales con líneas.

---

# 26. Regla 10 — Resultado

Temas:

- gol;
- ganador;
- desempates;
- penales cuando corresponda.

---

# 27. SEMANA 4 — FUERA DE JUEGO

Módulo crítico.

Separar:

## Posición de fuera de juego

de

## Infracción de fuera de juego

---

# 28. Entrenador de Offside

Crear modo específico:

## OFFSIDE TRAINER

Funcionamiento:

1. Mostrar imagen congelada.
2. Usuario toca jugador.
3. Pregunta:

> ¿Está en posición de fuera de juego?

4. Después:

> ¿Comete infracción?

5. Mostrar explicación.

---

# 29. Tipos de casos de offside

Entrenar:

- interferir en juego;
- interferir adversario;
- obtener ventaja;
- rebote;
- desvío;
- salvada;
- juego deliberado;
- saque de meta;
- saque lateral;
- corner.

---

# 30. Sistema de línea virtual

Para imágenes:

Agregar herramienta visual:

- línea del penúltimo defensor;
- posición del balón;
- atacante.

El usuario puede mover una línea.

Después comparar con respuesta correcta.

---

# 31. Meta Offside

Antes de aprobar:

30 casos.

Aprobación:

**24/30**

Si obtiene menos:

nuevo set.

---

# 32. SEMANA 5 — FALTAS Y TARJETAS

Módulo principal.

---

# 33. Regla 12

Crear árbol de decisión.

Pregunta 1:

> ¿Existe infracción?

Sí / No.

Pregunta 2:

> ¿Es tiro libre directo o indirecto?

Pregunta 3:

> ¿Dónde ocurrió?

Pregunta 4:

> ¿Qué intensidad?

- imprudente;
- temeraria;
- fuerza excesiva.

Pregunta 5:

> ¿Corresponde tarjeta?

- ninguna;
- amarilla;
- roja.

---

# 34. Entrenador de faltas

## FOUL TRAINER

Mostrar clips o secuencias ilustradas.

Usuario responde:

### Falta
Sí / No.

### Reanudación

- TLD;
- TLI;
- penal;
- balón a tierra;
- continuar.

### Disciplina

- ninguna;
- amarilla;
- roja.

### Motivo

Seleccionar.

---

# 35. Categorías

- patada;
- zancadilla;
- entrada;
- empujón;
- carga;
- sujetar;
- mano;
- juego peligroso;
- conducta violenta;
- juego brusco grave;
- DOGSO;
- SPA;
- protestas;
- retrasar reanudación.

---

# 36. Medidor de intensidad

Mostrar un control:

IMPRUDENTE ← TEMERARIA → FUERZA EXCESIVA

Usuario clasifica.

Después explicación.

---

# 37. Entrenador de ventaja

Mostrar:

1. falta;
2. situación posterior;
3. posiciones.

Pregunta:

> ¿Aplicar ventaja?

Sí / No.

Luego:

> ¿Qué hacer disciplinariamente después?

---

# 38. SEMANA 6 — PELOTA PARADA

---

# 39. Regla 13 — Tiros libres

Entrenar:

- directos;
- indirectos;
- barrera;
- ejecución rápida;
- distancia;
- señal.

---

# 40. Regla 14 — Penal

Modo:

## PENAL TRAINER

Mostrar posición de:

- balón;
- ejecutor;
- arquero;
- jugadores.

Usuario debe señalar quién está mal ubicado.

---

# 41. Casos de penal

- invasión;
- arquero adelantado;
- ejecutor se detiene ilegalmente;
- doble toque;
- rebote;
- compañero invade;
- defensor invade.

---

# 42. Regla 15 — Saque de banda

Entrenar ejecución correcta / incorrecta.

---

# 43. Regla 16 — Saque de meta

Entrenar:

- posición;
- balón en juego;
- adversarios.

---

# 44. Regla 17 — Saque de esquina

Entrenar:

- posición;
- distancia;
- gol directo;
- ejecución.

---

# 45. SEMANA 7 — MANEJO DEL PARTIDO

Esta semana es principalmente situacional.

---

# 46. Simulador de conflictos

## MATCH CONTROL

La app presenta diálogos.

Ejemplo:

Jugador:

> “¡Fue falta, árbitro! ¡Cobrá una!”

Opciones:

A. Expulsarlo.  
B. Ignorar siempre.  
C. Responder brevemente y seguir.  
D. Discutir la jugada.

La respuesta puede depender del contexto y reiteración.

---

# 47. Escala de intervención

Enseñar:

1. presencia;
2. palabra;
3. advertencia;
4. sanción.

Aclaración:

Si la infracción requiere disciplinariamente una tarjeta, hablar no reemplaza la sanción.

---

# 48. Situaciones de conflicto

Banco inicial:

- protestas;
- protestas masivas;
- capitán exaltado;
- técnico entra;
- jugador insulta;
- pelea;
- amenaza;
- agresión;
- lesión grave;
- invasión;
- público ingresa;
- falta de seguridad.

---

# 49. Simulador de diálogo

La app muestra conversación.

Usuario selecciona respuesta.

Ejemplo:

Jugador:

> “¡Siempre cobrás para ellos!”

Opciones:

- “Callate.”
- “Te escuché. Seguimos.”
- “¿Qué querés que haga?”
- “Si no te gusta andate.”

Respuesta preferida:

> “Te escuché. Seguimos.”

---

# 50. Informe arbitral

Crear:

## GENERADOR DE INFORME

Campos:

- minuto;
- equipo;
- jugador;
- dorsal;
- situación;
- conducta;
- sanción;
- observaciones.

La app ayuda a transformar notas en un informe objetivo.

No usar opiniones.

Ejemplo correcto:

> Minuto 63. El jugador Nº8 del equipo Azul fue expulsado por conducta violenta tras golpear deliberadamente con el puño a un adversario con el balón detenido.

Evitar:

> El jugador se volvió loco y pegó brutalmente.

---

# 50.1 Documentación del partido

El informe es la mitad del trabajo administrativo. La otra mitad es la
**planilla**, y hasta esta versión la especificación no la mencionaba.

## Por qué importa

En arbitraje amateur el papeleo mal hecho genera más conflictos que las
decisiones discutibles. Un gol anotado en el período equivocado, un dorsal que
no coincide con la lista de buena fe o una expulsión sin informe terminan en
partidos impugnados y en fallos de mesa.

## Qué es oficial y qué no

Distinción que hay que respetar en el contenido y en la interfaz:

- **El deber de informar es oficial.** La Ley 5, entre los poderes y deberes del
  árbitro, obliga a entregar a las autoridades correspondientes un informe con
  las sanciones impuestas a jugadores u oficiales y cualquier otro incidente
  ocurrido **antes, durante o después** del partido. Esa última precisión es la
  que más se olvida: lo que pasa en el vestuario o en la salida también va.
- **La planilla no es oficial.** No la define IFAB ni FIFA: la define cada
  organización. No existe *la* planilla, y por eso la app no puede enseñar un
  formulario concreto como si fuera norma. Su contenido se clasifica como
  `competition` o `private`.

Consecuencia pedagógica: se enseña el **método** para completar cualquier
planilla —qué verificar, qué no omitir, en qué orden— no un formulario.

## Módulo por curso

Cada uno de los tres cursos tiene su módulo de documentación: F9, S11 y P11.
Comparten el esqueleto y difieren en lo que la disciplina agrega a la planilla.

- **Futsal:** faltas acumuladas de cada equipo en cada período y tiempos muertos
  usados. Llevar mal esa cuenta cambia el partido, porque determina cuándo se
  concede un DFKSAF.
- **Fútbol playa:** tres períodos en vez de dos y, si la competición exige
  ganador, si se llegó por prórroga o por penales, de lo que depende el reparto
  de puntos.

## Herramienta

La sección PREPARAR PARTIDO ya genera la ficha del reglamento del torneo. Se le
suma un bloque de documentación:

- **Antes:** verificación de lista, identidades y dorsales.
- **Durante:** el registro rápido de la sección 113 alimenta la planilla.
- **Después:** la app arma un borrador del informe a partir de los incidentes
  registrados, y el árbitro lo revisa y corrige.

El borrador nunca se envía solo. La redacción final es responsabilidad del
árbitro, y la app debe decirlo.

## Criterio de redacción

El de la sección 50: hechos observables, sin opiniones ni adjetivos. La app
señala cuando el texto contiene valoraciones en vez de descripciones.

---

# 51. SEMANA 8 — ARBITRAJE AMATEUR

---

# 52. Adaptación a reglamentos privados

Crear módulo:

## LEER UNA LIGA

La app muestra reglamentos ficticios.

Ejemplo:

### Liga Norte F7

- 7 jugadores;
- 2 × 25;
- lateral con pie;
- sin offside;
- cambios ilimitados;
- barrida prohibida;
- amarilla;
- roja con reemplazo a los 5 minutos.

Luego realizar examen.

---

# 53. Extractor de reglamento

Función futura:

El usuario pega texto o sube PDF.

La IA extrae:

- formato;
- duración;
- cambios;
- offside;
- barridas;
- laterales;
- tarjetas;
- faltas acumuladas;
- distancia;
- desempate;
- reglas especiales.

Después muestra:

## FICHA RÁPIDA DEL TORNEO

Importante:

Siempre indicar:

> Verificar contra el reglamento original.

La IA puede equivocarse.

---

# 54. Entrenamiento de posicionamiento

Crear simulador 2D.

Vista cenital.

Elementos:

- cancha;
- balón;
- jugadores;
- árbitro.

La app pregunta:

> ¿Dónde te posicionarías?

Usuario toca zona.

Luego compara con zona recomendada.

---

# 55. Principios de posicionamiento

Enseñar:

- ángulo;
- distancia;
- anticipación;
- línea visual;
- no perseguir pelota;
- evitar quedar tapado;
- movimiento diagonal cuando corresponda.

No enseñar una coordenada rígida.

---

# 56. Prácticas presenciales

La app debe pedir:

## PRÁCTICA 1

Observar un partido.

Registrar:

- minutos observados;
- posicionamiento;
- comunicación;
- silbato;
- decisiones.

---

# 57. PRÁCTICA 2

Dirigir partido informal.

Recomendación:

- 5v5;
- 6v6;
- 7v7.

Registrar:

- duración;
- goles;
- faltas;
- tarjetas;
- incidentes.

---

# 58. PRÁCTICA 3

Dirigir otro partido y filmar al menos 10 minutos.

Checklist:

- postura;
- distancia;
- señales;
- desplazamiento;
- uso silbato;
- control.

---

# 59. Diario arbitral

Crear sección:

## MIS PARTIDOS

Cada partido contiene:

- fecha;
- liga;
- cancha;
- formato;
- equipos;
- resultado;
- goles;
- amarillas;
- rojas;
- incidentes;
- errores propios;
- decisiones difíciles;
- evaluación personal;
- observación externa.

---

# 60. Autoevaluación posterior

Después de partido:

Puntuar 1-5:

- reglamento;
- posicionamiento;
- físico;
- señales;
- silbato;
- comunicación;
- disciplina;
- ventaja;
- control;
- concentración.

Pregunta:

> ¿Qué decisión cambiarías?

Texto libre.

Pregunta:

> ¿Qué hiciste mejor?

Texto libre.

Pregunta:

> ¿Qué vas a entrenar?

Texto libre.

---

# 61. Historial

Mostrar gráficos:

- partidos dirigidos;
- minutos arbitrados;
- amarillas;
- rojas;
- precisión cuestionarios;
- puntos débiles;
- evolución.

---

# 62. Preparación física

Crear módulo opcional.

Dos sesiones semanales.

Ejemplo:

### Sesión A

10 min trote suave.

10 ×:
- 30 segundos rápido;
- 60 segundos suave.

5 min trote.

### Sesión B

- movilidad;
- aceleraciones;
- desplazamientos laterales;
- cambios de dirección;
- recuperación.

---

# 63. Registro físico

Guardar:

- entrenamiento;
- minutos;
- distancia opcional;
- RPE 1-10;
- sensación.

---

# 64. Banco de preguntas

Arquitectura.

Cada pregunta debe contener:

```ts
type Question = {
  id: string
  moduleId: string
  discipline: "football" | "futsal" | "beach_soccer"
  rulesVersion: string
  type:
    | "multiple_choice"
    | "true_false"
    | "decision_tree"
    | "image_case"
    | "video_case"
    | "positioning"
  difficulty: 1 | 2 | 3 | 4 | 5
  question: string
  options?: string[]
  correctAnswer: unknown
  explanation: string
  ruleReference?: string
  tags: string[]
}
```

---

# 65. Banco mínimo MVP

Crear inicialmente:

- 50 preguntas generales;
- 30 de faltas;
- 30 de tarjetas;
- 30 de offside;
- 20 de reanudaciones;
- 20 de penal;
- 20 de manejo de partido;
- 20 de reglamentos privados.

Total inicial:

**200 preguntas**

---

# 66. Repetición inteligente

La app debe detectar errores frecuentes.

Ejemplo:

Usuario falla 6 veces:

`reckless_tackle`

Entonces aumentar frecuencia de preguntas:

- entradas temerarias;
- amarilla;
- diferencia imprudente/temeraria.

---

# 67. Modelo de dominio de habilidades

Cada usuario tiene puntuación 0-100.

```ts
skills = {
  rules: 0,
  fouls: 0,
  discipline: 0,
  offside: 0,
  restarts: 0,
  penalties: 0,
  positioning: 0,
  communication: 0,
  matchControl: 0,
  privateRules: 0
}
```

Las habilidades se registran **por disciplina**, no de forma global. Dominar las
faltas en fútbol no acredita criterio en futsal, donde el sistema de faltas
acumuladas cambia la consecuencia de cada infracción.

```ts
skillsByDiscipline: Record<Discipline, Skills>
```

---

# 68. Exámenes rápidos

Crear:

## 5 PREGUNTAS

## 10 PREGUNTAS

## 20 PREGUNTAS

## SOLO MIS ERRORES

## REGLA 12

## OFFSIDE

## PARTIDO COMPLETO

---

# 69. Modo partido completo

Simular cronología.

Ejemplo:

### Minuto 3
Saque lateral.

### Minuto 11
Entrada fuerte.

### Minuto 18
Posible penal.

### Minuto 23
Protesta.

### Minuto 29
Offside.

### Minuto 36
Lesión.

El usuario toma decisiones y al final recibe:

## INFORME DE DESEMPEÑO

---

# 70. Examen final

Cuatro partes.

---

# 71. Examen A — Reglamento

60 preguntas.

Aprobación:

**48/60**

---

# 72. Examen B — Jugadas

30 situaciones.

Debe responder:

- infracción;
- reanudación;
- disciplina.

Aprobación:

**24/30**

---

# 73. Examen C — Liga privada

La app genera reglamento.

Usuario tiene 10 minutos.

Debe extraer reglas principales.

Luego:

10 situaciones.

Aprobación:

**8/10**

---

# 74. Examen D — Práctica

Registro obligatorio de:

**2 partidos**

El segundo debe evaluarse.

---

# 75. Rúbrica

| Área | Máximo |
|---|---:|
| Reglamento | 10 |
| Posicionamiento | 10 |
| Señales | 10 |
| Silbato | 10 |
| Disciplina | 10 |
| Comunicación | 10 |
| Ventaja | 10 |
| Seguridad | 10 |
| Control | 10 |
| Informe | 10 |

Aprobación:

**75/100**

---

# 76. Certificado interno

La app puede generar:

## CERTIFICADO DE FINALIZACIÓN

Importante:

Debe decir:

> Certificado interno de finalización del programa de formación “Árbitro Amateur”.

Y agregar:

> Este certificado no constituye una licencia, matrícula, habilitación federativa ni certificación oficial de AFA, IFAB u otra asociación.

No usar logos de instituciones externas.

---

# 77. Credencial digital

Después de completar:

### ÁRBITRO AMATEUR — NIVEL COMPLETADO

Datos:

- nombre;
- fecha;
- versión reglamentaria;
- puntuación examen;
- cantidad de ejercicios;
- partidos prácticos.

Puede incluir QR verificable dentro de la propia app.

---

# 78. Primer kit

Checklist dentro de la app.

- silbato principal;
- silbato secundario;
- amarilla;
- roja;
- cronómetro;
- moneda;
- libreta;
- lápiz;
- indumentaria;
- agua.

Botón:

**KIT COMPLETO**

---

# 79. Checklist día del partido

### 30 minutos
Llegar.

### 25 minutos
Revisar cancha.

### 20 minutos
Confirmar reglamento.

### 15 minutos
Revisar equipos.

### 10 minutos
Hablar con organización.

### 5 minutos
Preparar reloj, silbato, tarjetas y moneda.

---

# 80. Pantalla "Estoy listo"

Mostrar diez competencias.

Checkbox:

- faltas;
- penal;
- tarjetas;
- imprudencia/temeridad/fuerza excesiva;
- mano;
- offside;
- ventaja;
- reanudaciones;
- posicionamiento;
- reglamento particular.

Cuando están todas:

> Estás preparado para realizar tus primeras prácticas.

No afirmar:

> Sos árbitro oficial.

---

# 81. Asistente IA

Crear un tutor.

Nombre provisional:

## CUARTO ÁRBITRO

Funciones:

- explicar reglas;
- crear preguntas;
- analizar situaciones descritas;
- comparar decisiones;
- preparar examen;
- generar escenarios.

---

# 82. Prompt base del tutor

```txt
Sos un tutor especializado en formación de árbitros de fútbol amateur.

Tu referencia reglamentaria principal es IFAB [VERSIÓN].

Tu objetivo es enseñar, no simplemente dar respuestas.

Cuando el usuario describa una jugada:

1. identificá los hechos relevantes;
2. determiná si existe infracción;
3. indicá decisión técnica;
4. indicá decisión disciplinaria;
5. indicá reanudación;
6. explicá brevemente el motivo;
7. citá la regla correspondiente.

Diferenciá siempre entre:
- Reglas IFAB;
- reglas de competición;
- reglamentos privados.

Si falta información, indicá qué detalle cambia la decisión.

No inventes reglas.

No presentes una recomendación como una norma reglamentaria.
```

---

# 83. Modo examen IA

Prompt:

```txt
Actuá como examinador arbitral.

No reveles la respuesta antes de que el usuario responda.

Presentá una sola situación por vez.

Después de la respuesta evaluá por separado:

- decisión técnica;
- decisión disciplinaria;
- reanudación;
- explicación.

Puntaje total: 10.

Después explicá el criterio correcto.

Aumentá o disminuí dificultad según rendimiento.
```

---

# 84. Modo simulador

Prompt:

```txt
Simulá un partido amateur.

Generá acontecimientos cronológicamente.

No anticipes la decisión correcta.

El usuario actúa como árbitro.

Cada evento debe incluir únicamente la información que el árbitro podría percibir.

Esperá la decisión del usuario.

Después continuá el partido.

Al finalizar, evaluá:

- reglamento;
- disciplina;
- posicionamiento conceptual;
- control del partido;
- coherencia de criterio.
```

---

# 85. Arquitectura técnica recomendada

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

Opción simple:

- Supabase

Incluye:

- PostgreSQL;
- autenticación;
- storage;
- realtime.

Alternativa:

- Firebase.

---

# 86. PWA

La app debería instalarse como aplicación.

Funciones offline futuras:

- reglas descargadas;
- checklist;
- ficha de liga;
- registro del partido.

Esto es especialmente útil en canchas con mala señal.

---

# 87. Autenticación

Opciones:

- email;
- Google;
- modo invitado.

Para MVP:

Google + email.

---

# 88. Base de datos

## users

```sql
id
name
email
created_at
```

## profiles

```sql
user_id
current_level
xp
streak
rules_version
```

## modules

```sql
id
title
order
required_score
```

## lessons

```sql
id
module_id
title
content
order
```

## questions

```sql
id
module_id
type
difficulty
question
options
correct_answer
explanation
rule_reference
tags
rules_version
```

## attempts

```sql
id
user_id
question_id
answer
correct
created_at
```

## module_progress

```sql
user_id
module_id
score
completed
completed_at
```

## matches

```sql
id
user_id
date
competition
venue
format
team_a
team_b
score_a
score_b
notes
```

## match_incidents

```sql
id
match_id
minute
type
team
player
description
decision
```

## competitions

```sql
id
user_id
name
format
rules_json
```

## practices

```sql
id
user_id
type
date
duration
notes
```

## achievements

```sql
id
name
description
condition
```

## user_achievements

```sql
user_id
achievement_id
earned_at
```

---

# 89. Estructura de contenido

Guardar lecciones en Markdown.

Ejemplo:

```txt
/content
  /ifab-2026-27
    /module-01
      lesson-01.md
      lesson-02.md
    /module-02
```

Ventaja:

actualizar reglas sin tocar componentes.

---
# 89.1 Videos complementarios de YouTube

Cada lección puede acompañarse con videos de YouTube que expliquen el mismo
tema. Si el usuario está viendo fuera de juego, la lección ofrece los videos
disponibles sobre fuera de juego.

## Principio rector

Un video de YouTube es **material de terceros no verificado**. Puede estar
desactualizado, puede explicar mal una regla o puede referirse al reglamento de
otra federación. Esto entra en conflicto directo con la regla del proyecto de no
enseñar reglamento sin fuente oficial.

La resolución es jerárquica y no se negocia:

> La lección es la fuente. El video es apoyo.

En consecuencia:

- Ningún video reemplaza el texto de la lección.
- Ninguna pregunta del banco evalúa contenido que solo aparece en un video.
- Un video nunca se presenta como fuente reglamentaria.
- Si un video contradice a IFAB, se retira del catálogo o se anota la
  discrepancia de forma visible.

## Catálogo curado, no búsqueda en vivo

Los videos se guardan en un catálogo verificado por lección. **No se hace una
búsqueda automática de YouTube en tiempo de ejecución.** Motivos:

1. Una búsqueda en vivo devolvería, tarde o temprano, un video que enseña la
   regla mal. En una app de reglamento eso es inaceptable.
2. La app es PWA pensada para canchas con mala señal. Un catálogo estático
   funciona sin conexión; una búsqueda en vivo, no.
3. La cuota de la API de YouTube se consumiría en cada visita a una lección.

La búsqueda automatizada sí se usa, pero **en tiempo de autoría**: como
herramienta para encontrar candidatos que después se revisan a mano.

## Modelo de datos

```ts
type LessonVideo = {
  youtubeId: string
  title: string
  channel: string
  language: "es" | "en" | "pt"
  durationSeconds: number

  // Recorte opcional: si el tema empieza en el minuto 7 de un video largo,
  // el reproductor arranca ahí en vez de obligar a buscarlo.
  startSeconds?: number
  endSeconds?: number

  // Vinculación con el curso.
  discipline: "football" | "futsal" | "beach_soccer"
  lessonIds: string[]
  tags: string[]

  // Confiabilidad. Sin revisión manual, el video no se muestra.
  reviewed: boolean
  reviewedAt?: string
  rulesVersionAtReview: string

  // Si el video es correcto salvo en un punto, se aclara en vez de descartarlo.
  caveat?: string

  // Verificación de disponibilidad: los videos se borran o se vuelven privados.
  lastCheckedAt?: string
  available: boolean
}
```

Campo clave: `rulesVersionAtReview`. Si el video se revisó contra IFAB 2026/27 y
después cambia la regla, el catálogo puede marcar automáticamente todos los
videos de los temas afectados como pendientes de re-verificación, en vez de
arrastrar contenido viejo en silencio.

## Almacenamiento

Un archivo por versión reglamentaria, junto al contenido:

```txt
/content
  /ifab-2026-27
    /module-04
      lesson-01.md
      lesson-02.md
    videos.json
```

Ventaja: el catálogo se actualiza sin tocar componentes ni base de datos, igual
que las lecciones.

## Presentación en la lección

Al pie de la lección, después del contenido propio, nunca antes:

```txt
─────────────────────────────
VER TAMBIÉN

┌───────────────────────────┐
│  [ miniatura ]     8:42   │
│  Fuera de juego explicado │
│  Canal · español          │
└───────────────────────────┘

Material de terceros. Ante cualquier
diferencia, vale la lección.
─────────────────────────────
```

La etiqueta de material de terceros es obligatoria y siempre visible. Si el
video tiene `caveat`, se muestra junto a la tarjeta, no escondido detrás de un
clic.

## Implementación del reproductor

- Embeber contra `youtube-nocookie.com`, no `youtube.com`. Evita cookies de
  seguimiento antes de que el usuario decida mirar.
- **Fachada con miniatura**: la lección carga solo la imagen y el iframe real se
  monta al hacer clic. Un iframe de YouTube pesa cientos de kilobytes y son
  varios por lección; cargarlos todos arruinaría el tiempo de carga en datos
  móviles.
- Sin reproducción automática.
- `startSeconds` se pasa como parámetro `start` del embed.
- Preferir videos con subtítulos, por accesibilidad y para poder mirarlos sin
  audio.

## Herramienta de autoría

Script de línea de comandos, fuera de la app:

1. Buscar candidatos por tema con la YouTube Data API v3 (`search.list`, filtrado
   por idioma y duración).
2. Volcar los resultados a una lista de revisión.
3. La persona mira el video y decide: aprobar, aprobar con salvedad, descartar.
4. Solo lo aprobado entra en `videos.json`.

La cuota gratuita de la API es de 10.000 unidades diarias y cada búsqueda cuesta
100, así que el uso en autoría es holgado. Requiere una API key gratuita de
Google Cloud.

## Chequeo de disponibilidad

Los videos desaparecen. Un segundo script recorre el catálogo contra el endpoint
público de oEmbed de YouTube —que no consume cuota ni requiere clave— y marca
`available: false` en los que ya no responden. La interfaz oculta los no
disponibles en vez de mostrar un reproductor roto.

## Alcance por versión

- **MVP**: catálogo manual con unos pocos videos por módulo, tarjeta con fachada
  y etiqueta de terceros.
- **V2**: script de búsqueda asistida y chequeo de disponibilidad automático.
- **V3**: sugerencia de videos según los errores frecuentes del usuario. Si falla
  seis veces en entradas temerarias, la app le ofrece los videos etiquetados con
  ese tema.

---

# 90. Componentes principales

```txt
Dashboard
CourseMap
ModuleCard
LessonViewer
Quiz
QuestionCard
DecisionTreeQuestion
VideoCase
ImageCase
OffsideTrainer
FoulTrainer
PositioningTrainer
MatchSimulator
PrivateRulesForm
CompetitionCard
MatchLog
IncidentEditor
PostMatchReview
SkillRadar
AchievementCard
FinalExam
Certificate
```

---

# 91. Navegación

Mobile first.

Barra inferior:

- Inicio
- Curso
- Entrenar
- Partido
- Perfil

---

# 92. Diseño visual

Inspiración:

- arbitraje;
- cancha;
- pizarras tácticas;
- apps deportivas profesionales.

Evitar estética infantil.

Características:

- fondo oscuro opcional;
- tarjetas grandes;
- buena legibilidad;
- iconografía;
- jerarquía clara;
- poco texto por pantalla.

---

# 93. Código de interfaz

Usar términos:

### Correcto
DECISIÓN CORRECTA

### Parcial
DECISIÓN PARCIALMENTE CORRECTA

### Incorrecto
REVISAR JUGADA

Evitar:

❌ “MAL”

El feedback debe explicar.

---

# 94. Accesibilidad

- botones grandes;
- contraste;
- subtítulos en videos;
- no depender exclusivamente de color;
- navegación teclado;
- responsive.

---

# 95. MVP — VERSIÓN 1

Construir primero:

1. autenticación;
2. dashboard;
3. módulos;
4. lecciones;
5. cuestionarios;
6. progreso;
7. XP;
8. estadísticas;
9. reglamentos privados;
10. checklist partido;
11. registro partidos;
12. examen final básico.

No empezar con simulador de video complejo.

---

# 96. MVP — Contenido inicial

Módulos:

1. Introducción.
2. Reglas 1-6.
3. Reglas 7-10.
4. Offside.
5. Faltas.
6. Reanudaciones.
7. Manejo.
8. Amateur.

Preguntas:

**200**

---

# 97. VERSIÓN 2

Agregar:

- imágenes;
- entrenador offside;
- simulador posicionamiento;
- repetición inteligente;
- diario avanzado;
- PDF reglas privadas.

---

# 98. VERSIÓN 3

Agregar:

- clips;
- simulación partido;
- IA;
- análisis de video;
- ranking personal;
- estadísticas avanzadas.

---

# 99. Flujo de onboarding

Pantalla 1:

> ¿Para qué querés aprender arbitraje?

Opciones:

- F5;
- F7;
- F8;
- F11;
- todavía no sé.

Pantalla 2:

> ¿Tenés experiencia?

- ninguna;
- jugué fútbol;
- dirigí informalmente;
- ya arbitré torneos.

Pantalla 3:

> ¿Cuánto querés entrenar?

- 10 min/día;
- 20;
- 30;
- libre.

Pantalla 4:

Mini diagnóstico.

10 preguntas.

No bloquea contenido.

Sirve para línea base.

---

# 100. Home inicial

Ejemplo:

```txt
BUENAS, EZEQUIEL

Árbitro en Formación — Nivel 2

████████░░░ 43 %

Continuar:
REGLA 12 — FALTAS

Precisión esta semana
82 %

Punto a mejorar
FUERA DE JUEGO

[ CONTINUAR CURSO ]

Entrenamiento rápido
[ 5 JUGADAS ]

Próxima práctica
SIN REGISTRAR
```

---

# 101. Pantalla de caso

```txt
MINUTO 34

Un defensor intenta disputar el balón,
llega tarde y golpea al delantero en el
tobillo con intensidad moderada.

¿HAY FALTA?

[ SÍ ]
[ NO ]
```

Luego:

```txt
¿SANCIÓN?

[ NINGUNA ]
[ AMARILLA ]
[ ROJA ]
```

Luego explicación.

---

# 102. Motor de puntuación

Ejemplo jugada:

- infracción: 3 pts;
- técnica: 3;
- disciplina: 2;
- reanudación: 2.

Total:

10.

Esto permite dar crédito parcial.

---

# 103. Dificultad adaptativa

Nivel 1:

situaciones claras.

Nivel 2:

un factor dudoso.

Nivel 3:

decisión disciplinaria.

Nivel 4:

varios elementos.

Nivel 5:

casos límite.

---

# 104. Sistema de favoritos

Botón:

⭐ GUARDAR JUGADA

Crear sección:

## JUGADAS GUARDADAS

Útil para revisar dudas.

---

# 105. Sistema de errores

Sección:

## MIS ERRORES

Agrupar:

- offside;
- mano;
- DOGSO;
- ventaja;
- barrera;
- penal;
- tarjetas.

Botón:

**ENTRENAR MIS ERRORES**

---

# 106. Modo estudio

Mostrar:

### REGLA

### EXPLICACIÓN SIMPLE

### EJEMPLO

### ERROR COMÚN

### MINI TEST

Esto debe repetirse en todas las lecciones.

---

# 107. Método de explicación

Ejemplo:

## Posición de fuera de juego

### Regla

Estar adelantado no es una infracción por sí solo.

### En palabras simples

Un jugador puede estar adelantado sin que debas cobrar nada.

### Ejemplo

Está adelantado, pero el pase va hacia otro compañero y no interviene.

### Error común

Levantar/bajar el juego apenas ves un atacante adelantado.

### Pregunta

¿Cobrás?

---

# 108. Botón "Explicámelo fácil"

Cada lección puede tener:

**EXPLICÁMELO FÁCIL**

La IA reformula sin cambiar la regla.

---

# 109. Botón "Dame un ejemplo"

Generar caso nuevo.

---

# 110. Botón "Tomame examen"

Generar 5 preguntas relacionadas.

---

# 111. Modo cancha

Antes de partido:

## MODO CANCHA

Interfaz simplificada.

Mostrar:

- reloj;
- marcador;
- amarillas;
- rojas;
- notas;
- reglamento rápido.

No sustituir un reloj arbitral dedicado, pero servir como apoyo.

---

# 112. Cronómetro

Funciones:

- comenzar;
- pausar;
- primer tiempo;
- entretiempo;
- segundo tiempo;
- tiempo agregado.

Importante:

evitar interacciones complejas durante el partido.

---

# 113. Registro rápido

Botones:

⚽ GOL

🟨 AMARILLA

🟥 ROJA

⚠ INCIDENTE

Al tocar:

- equipo;
- dorsal;
- minuto automático.

---

# 114. Privacidad

Los datos de jugadores deben minimizarse.

Permitir usar:

- dorsal;
- iniciales.

No exigir nombres completos.

---

# 115. Seguridad

La app debe incluir un módulo específico:

## SEGURIDAD DEL ÁRBITRO

Temas:

- detectar clima hostil;
- hablar con organizador;
- identificar responsable;
- no enfrentar público;
- suspender si existe riesgo;
- priorizar integridad física.

Nunca enseñar al árbitro a escalar conflictos.

---

# 116. Disclaimer

Mostrar al registrarse:

> Esta aplicación es una herramienta educativa independiente para formación en arbitraje amateur. No está afiliada a IFAB, FIFA, AFA ni a una asociación arbitral salvo que se indique expresamente. Las reglas particulares de cada competencia deben verificarse con su organizador.

---

# 117. Fuentes

Crear sección:

## FUENTES OFICIALES

Principal:

- IFAB — Laws of the Game.

Guardar siempre:

- versión;
- fecha de actualización.

---

# 118. Sistema de actualización reglamentaria

Cada temporada:

```txt
IFAB 2026/27
IFAB 2027/28
```

Cuando existe actualización:

> Hay una nueva edición del reglamento.

Mostrar:

## QUÉ CAMBIÓ

Luego mini examen de actualización.

---

# 119. Administración

Crear panel admin.

Funciones:

- crear módulo;
- editar lección;
- crear pregunta;
- editar pregunta;
- subir imagen;
- etiquetar;
- definir dificultad;
- definir versión IFAB;
- revisar reportes.

---

# 120. Importador de preguntas

Permitir JSON.

Ejemplo:

```json
{
  "module": "rule_12",
  "difficulty": 2,
  "question": "Un jugador realiza una entrada temeraria...",
  "options": [
    "Sin falta",
    "TLD sin tarjeta",
    "TLD + amarilla",
    "TLD + roja"
  ],
  "answer": 2,
  "explanation": "Una entrada temeraria requiere amonestación.",
  "ruleReference": "Regla 12"
}
```

---

# 121. Analítica

Eventos:

```txt
lesson_started
lesson_completed
question_answered
question_failed
module_passed
module_failed
practice_logged
match_logged
exam_started
exam_passed
```

---

# 122. Métricas importantes

- tasa finalización;
- preguntas más falladas;
- módulos difíciles;
- tiempo de estudio;
- mejora por habilidad;
- retorno semanal;
- usuarios que llegan a práctica.

---

# 123. Backlog futuro

- comunidad;
- entrenador humano;
- ligas;
- bolsa de trabajo;
- directorio de torneos;
- árbitros asistentes;
- futsal;
- fútbol infantil;
- arbitraje femenino;
- preparación física avanzada.

---

# 124. Posible módulo "Buscar trabajo"

Futuro.

Registrar:

- zona;
- disponibilidad;
- formatos;
- experiencia;
- cantidad partidos.

No afirmar habilitación oficial.

---

# 125. Flujo ideal completo

```txt
REGISTRO
↓
DIAGNÓSTICO
↓
MÓDULO 1
↓
EJERCICIO
↓
QUIZ
↓
APROBAR
↓
SIGUIENTE MÓDULO
↓
ENTRENADORES ESPECÍFICOS
↓
PRÁCTICA 1
↓
PRÁCTICA 2
↓
EXAMEN FINAL
↓
CERTIFICADO INTERNO
↓
PRIMER PARTIDO
↓
DIARIO ARBITRAL
↓
ENTRENAMIENTO CONTINUO
```

---

# 126. Criterio para considerar al alumno preparado

Debe:

- completar curso;
- aprobar módulos;
- superar examen reglamentario;
- superar jugadas;
- superar reglamento privado;
- registrar dos prácticas;
- obtener 75/100 en evaluación práctica.

La app debe decir:

> Preparado para comenzar arbitraje amateur supervisado / inicial.

No:

> Árbitro certificado oficialmente.

---

# 127. Objetivo final del producto

La aplicación no debe sentirse como:

> “Leé 150 páginas y respondé 20 preguntas.”

Debe sentirse como:

> “Entrená para tomar decisiones dentro de una cancha.”

Cada regla debe terminar convertida en una decisión.

Cada error debe generar nuevo entrenamiento.

Cada partido debe generar aprendizaje.

---

# 128. PROMPT MAESTRO PARA CODEX

Copiar desde aquí cuando se quiera iniciar el desarrollo:

```txt
Quiero construir una aplicación web llamada provisionalmente "Árbitro Amateur".

OBJETIVO

Crear una plataforma interactiva para formar árbitros de fútbol amateur y de torneos privados desde cero.

No busca otorgar una certificación oficial ni formar árbitros profesionales.

La app debe enseñar:
- reglamento IFAB;
- faltas;
- disciplina;
- offside;
- reanudaciones;
- posicionamiento;
- comunicación;
- manejo del partido;
- reglas particulares de fútbol 5, 7, 8 y 11;
- preparación previa;
- registro y análisis posterior de partidos.

STACK

Usá:

- Next.js con App Router
- TypeScript
- Tailwind
- shadcn/ui
- Supabase
- PostgreSQL
- autenticación Supabase

La aplicación debe ser mobile-first y PWA.

DISEÑO

Debe sentirse como una aplicación deportiva profesional.

Evitar estética infantil.

La navegación inferior móvil tendrá:

- Inicio
- Curso
- Entrenar
- Partido
- Perfil

MVP

Construir:

1. autenticación;
2. onboarding;
3. dashboard;
4. mapa del curso;
5. módulos;
6. lecciones Markdown;
7. cuestionarios;
8. progreso;
9. XP;
10. estadísticas;
11. sección Mis errores;
12. reglamentos de ligas;
13. checklist previo;
14. registro de partidos;
15. autoevaluación posterior;
16. examen final;
17. certificado interno.

CURSO

Crear 8 módulos:

1. Rol del árbitro y preparación.
2. Reglas 1-6.
3. Reglas 7-10.
4. Regla 11 — Offside.
5. Regla 12 — Faltas y disciplina.
6. Reglas 13-17.
7. Manejo del partido.
8. Arbitraje amateur.

Cada módulo debe tener:

- lecciones;
- ejemplos;
- errores comunes;
- mini tests;
- examen.

Aprobación mínima:

80 %.

Offside y faltas:

85 % recomendado.

PREGUNTAS

Tipos:

- multiple choice;
- true/false;
- decisión técnica + disciplinaria;
- casos de partido;
- imágenes;
- posicionamiento.

Guardar por cada pregunta:

- módulo;
- dificultad;
- versión IFAB;
- tags;
- respuesta;
- explicación;
- referencia reglamentaria.

SISTEMA DE HABILIDADES

Guardar 0-100:

- rules;
- fouls;
- discipline;
- offside;
- restarts;
- penalties;
- positioning;
- communication;
- matchControl;
- privateRules.

ENTRENAMIENTO

Crear modos:

- 5 preguntas;
- 10;
- 20;
- faltas;
- offside;
- tarjetas;
- mis errores.

REGLAMENTOS PRIVADOS

Crear formulario donde el usuario guarde:

- formato;
- duración;
- jugadores;
- cambios;
- offside;
- laterales;
- barridas;
- faltas acumuladas;
- barrera;
- tarjetas;
- exclusiones;
- desempate;
- reglas especiales.

Generar una ficha rápida.

PARTIDOS

Crear registro:

- fecha;
- liga;
- cancha;
- formato;
- equipos;
- resultado;
- goles;
- amarillas;
- rojas;
- incidentes;
- notas.

Después del partido pedir evaluación 1-5:

- reglamento;
- posicionamiento;
- físico;
- señales;
- silbato;
- comunicación;
- disciplina;
- ventaja;
- control;
- concentración.

GAMIFICACIÓN

- XP;
- niveles;
- racha;
- insignias.

No hacerlo infantil.

EXAMEN FINAL

A:
60 preguntas.
48 correctas para aprobar.

B:
30 jugadas.
24 correctas.

C:
reglamento privado + 10 casos.
8 correctas.

D:
registro de dos prácticas.

CERTIFICADO

Generar certificado interno.

Debe aclarar:

"Este certificado acredita únicamente la finalización del programa educativo y no constituye matrícula, licencia o habilitación oficial de AFA, IFAB, FIFA u otra entidad."

ARQUITECTURA

Organizar el código por dominios.

No crear un único componente gigante.

Separar:

- course;
- training;
- competitions;
- matches;
- analytics;
- profile.

CONTENIDO

Las lecciones deben almacenarse en Markdown.

Preparar el sistema para diferentes versiones reglamentarias:

IFAB 2026/27
IFAB 2027/28
etc.

IMPORTANTE

No inventar reglas de fútbol.

Diferenciar explícitamente:

- regla IFAB;
- regla de competición;
- regla privada.

Construí primero el esqueleto funcional completo del MVP con datos mock.

Después reemplazaremos los mocks por contenido real y Supabase.

Creá:

1. estructura del proyecto;
2. esquema de base de datos;
3. tipos TypeScript;
4. navegación;
5. componentes UI;
6. dashboard funcional;
7. flujo de un módulo completo;
8. un cuestionario funcional;
9. sistema de progreso;
10. formulario de liga;
11. registro de partido.

Usá datos ficticios suficientes para poder probar toda la navegación.
```

---

# 129. Orden recomendado de desarrollo

## Fase 1

- crear Next.js;
- layout;
- navegación;
- mock data.

## Fase 2

- curso;
- lecciones;
- quizzes;
- progreso.

## Fase 3

- dashboard;
- estadísticas;
- XP.

## Fase 4

- reglamentos privados;
- partidos;
- diario.

## Fase 5

- autenticación;
- Supabase.

## Fase 6

- entrenadores específicos.

## Fase 7

- IA.

---

# 130. Primera entrega funcional esperada

Al terminar la primera etapa debería poder hacerse:

1. registrarse;
2. realizar onboarding;
3. entrar al dashboard;
4. comenzar Módulo 1;
5. leer una lección;
6. contestar preguntas;
7. aprobar;
8. desbloquear lección;
9. ver estadísticas;
10. crear una liga;
11. registrar un partido.

Esto constituye el **MVP inicial**.

---

# 131. Filosofía del proyecto

> NO ESTUDIAR PARA RECORDAR REGLAS.

> ENTRENAR PARA TOMAR DECISIONES.

Esa debe ser la idea central de toda la aplicación.
