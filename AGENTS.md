# Árbitro Amateur — reglas del proyecto

App de formación en arbitraje amateur para **tres disciplinas**: fútbol (F5 a
F11), futsal y fútbol playa. Especificación completa en
`arbitro_amateur_app_especificacion.md`; el alcance por disciplina está en su
sección 6.1.

**Proyecto de uso propio**, no comercial. No hay clientes, ni multiusuario, ni
panel de administración. El usuario final es el desarrollador.

## Reglas no negociables del dominio

Estas no son preferencias de estilo. Romperlas produce una app que enseña mal
el reglamento, que es el único fracaso irrecuperable de este producto.

1. **No inventar reglas.** Toda afirmación reglamentaria sale del PDF oficial de
   la disciplina que corresponda, listados más abajo. Si un dato no está en esa
   fuente, no se escribe. Ante la duda, dejar el hueco explícito con `TODO:` en
   vez de completarlo de memoria.

2. **Distinguir siempre el origen de la regla.** Tres categorías, nunca
   mezcladas ni en datos ni en interfaz:
   - `official` — reglamento base de la disciplina (IFAB para fútbol, FIFA para
     futsal y fútbol playa).
   - `competition` — modificaciones que el reglamento base permite aplicar a la
     organización.
   - `private` — reglas particulares de un torneo amateur.

   Una regla privada jamás se presenta como si fuera reglamento oficial.

3. **No afirmar habilitación oficial.** La app no certifica, no matricula y no
   habilita. El certificado es interno y debe decirlo. Copy permitido:
   "preparado para comenzar arbitraje amateur supervisado". Copy prohibido:
   "árbitro certificado", "habilitado", cualquier logo de AFA, FIFA o IFAB.

4. **Versionar el reglamento y marcar la disciplina.** Todo contenido lleva
   `discipline` y `rulesVersion`. Sin esos campos el contenido no se puede
   actualizar la temporada siguiente ni filtrar por deporte sin revisarlo entero
   a mano.

5. **Futsal y fútbol playa son deportes distintos, no variantes.** Tienen
   reglamento propio de FIFA, en documentos separados y con ciclo de versión
   independiente del de IFAB. Nunca deducir una regla de futsal o de playa por
   analogía con el fútbol: se lee del documento de esa disciplina o no se
   escribe.

6. **El feedback explica, no juzga.** "REVISAR JUGADA" con la explicación del
   criterio, nunca "MAL" a secas. Cada error corregido es el mecanismo central
   de aprendizaje del producto.

## Principio pedagógico

VER → DECIDIR → EXPLICAR → CORREGIR → REPETIR

Cada regla termina convertida en una decisión de cancha. Las respuestas se
evalúan por componentes separados y con crédito parcial:

| Componente | Puntos |
| --- | ---: |
| ¿Hay infracción? | 3 |
| Decisión técnica | 3 |
| Decisión disciplinaria | 2 |
| Reanudación | 2 |

## Fuentes reglamentarias

Tres disciplinas, tres documentos, tres ciclos de versión independientes.
Ninguno se versiona en git: pesan y tienen copyright de terceros. Van en `docs/`.

| Disciplina | Edición | Archivo |
| --- | --- | --- |
| Fútbol | IFAB 2026/27 | `docs/ifab-2026-27-es.pdf` |
| Futsal | FIFA Futsal 2025-26 | `docs/fifa-futsal-2025-26.pdf` |
| Fútbol playa | FIFA Beach Soccer 2025-26 | `docs/fifa-beach-soccer-2025-26.pdf` |

Descargas oficiales:

- Fútbol: https://www.theifab.com/laws-of-the-game-documents/
- Futsal: https://digitalhub.fifa.com/m/20d52e6779b53321/original/FUTSAL-Laws-of-the-Game-2025-2026.pdf
- Fútbol playa: FIFA lo publica en inglés, árabe, francés y español.

Cambios entre ediciones de fútbol: https://www.theifab.com/law-changes/latest/

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Supabase · PWA
mobile-first.

## Organización del código

Por dominio, no por tipo de archivo: `course`, `training`, `competitions`,
`matches`, `profile`. Las lecciones van en Markdown bajo
`content/<discipline>/<rules-version>/`, para poder actualizar el reglamento de
una disciplina sin tocar componentes ni las otras dos.

## Idioma

Interfaz y contenido en español rioplatense. Código, nombres de variables y
commits en inglés.
