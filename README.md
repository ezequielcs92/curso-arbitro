# Árbitro Amateur

Aplicación de formación en arbitraje amateur. **Tres cursos independientes**:
fútbol (F5 a F11), futsal y fútbol playa.

No forma árbitros profesionales ni otorga habilitación oficial. Entrena la toma
de decisiones de cancha.

> VER → DECIDIR → EXPLICAR → CORREGIR → REPETIR

## Estado

**Contenido completo y aplicación en pie.** Las 174 lecciones de los tres
cursos están escritas contra los reglamentos oficiales, y la aplicación las
sirve como PWA.

| Curso | Módulos | Lecciones | Escritas |
| --- | ---: | ---: | ---: |
| Fútbol — IFAB 2026/27 | 9 | 54 | **54** |
| Futsal — FIFA 2025-26 | 11 | 60 | **60** |
| Fútbol playa — FIFA 2025-26 | 11 | 60 | **60** |

Cada lección sigue la misma estructura: la regla con su referencia, una
explicación en lenguaje llano, un ejemplo de cancha amateur, los errores
comunes y un mini test con respuestas desplegables.

```bash
python scripts/progress.py
```

## Fichas de formato

F5 a F11 son el mismo deporte bajo las mismas Reglas, así que comparten el
curso de fútbol. Lo que cambia por formato vive en cuatro fichas de consulta
previa al partido, en `content/football/ifab-2026-27/formatos/`: **F5, F7, F8 y
F9**.

IFAB no fija ninguna medida para los formatos reducidos —solo enumera qué puede
adaptar cada federación—, así que las fichas contrastan contra F11, que es el
único formato que las Reglas sí especifican, y dejan en blanco lo que define cada
torneo.

## La aplicación

Next.js 16 (App Router) + TypeScript + Tailwind 4. El contenido son los mismos
archivos Markdown del repositorio, leídos en tiempo de compilación: **las 186
páginas quedan prerenderizadas**, sin base de datos ni servidor de aplicación.

```bash
npm install
npm run dev
```

| Ruta | Qué hay |
| --- | --- |
| `/` | Los tres cursos y las fichas |
| `/curso/[slug]` | Portada del curso, con sus módulos |
| `/curso/[slug]/[lessonId]` | La lección, con índice y navegación |
| `/formatos`, `/formatos/[format]` | Las fichas de F5, F7, F8 y F9 |

Detalles que importan:

- **Es PWA y funciona sin conexión.** Lo que se abrió una vez queda disponible
  al costado de una cancha sin señal, que es donde se usa.
- **El avance se guarda en el navegador**, en `localStorage`. Todavía no hay
  cuentas ni servidor: el único estado propio es qué lecciones se leyeron.
- **Tema claro y oscuro**, aplicado antes del primer pintado para que no
  parpadee.
- **Las opciones del mini test se reescriben al renderizar.** En el Markdown son
  cuatro líneas seguidas, que sin ese paso quedarían corridas en un solo párrafo.

### Compilación en Windows

Los scripts usan `--webpack`. El binario nativo de SWC está bloqueado por el
Control de aplicaciones de Windows en la máquina de desarrollo, y Turbopack lo
exige; con webpack, además, lo que se verifica local es idéntico a lo que
despliega Vercel.

```bash
npm run build
npm run typecheck
```

Los iconos de la PWA se regeneran con `python scripts/make_icons.py`, que
escribe los PNG sin dependencias externas.

## Bancos de preguntas

**480 preguntas**, escritas contra los mismos reglamentos que las lecciones y
guardadas junto a ellas, en `content/<disciplina>/<version>/preguntas/`.

| Curso | Preguntas |
| --- | ---: |
| Fútbol | 220 |
| Futsal | 140 |
| Fútbol playa | 120 |

Cada pregunta lleva su referencia reglamentaria y una explicación: una pregunta
sin explicación no enseña nada. Hay tres tipos: opción múltiple, verdadero o
falso, y **decisión completa de partido**, que se puntúa por componentes
—si hay infracción, decisión técnica, disciplinaria y reanudación— para que
acertar la falta y errar la reanudación no valga lo mismo que errar todo.

```bash
python scripts/check_questions.py
```

Valida identificadores únicos, que la respuesta apunte a una opción existente,
que toda pregunta tenga explicación y referencia, y que las decisiones traigan
sus cuatro componentes.

## Lo que falta

1. Conectar los bancos a la aplicación: hoy son datos, y todavía no hay una
   interfaz para responderlos.

## Mapa del repositorio

| Ruta | Qué hay |
| --- | --- |
| `AGENTS.md` | Reglas no negociables del dominio. Leer primero. |
| `arbitro_amateur_app_especificacion.md` | Especificación completa del producto. |
| `docs/cursos.md` | Diseño curricular de los tres cursos, módulo por módulo. |
| `docs/*.pdf` | Reglamentos oficiales. No versionados: ver `AGENTS.md`. |
| `content/<disciplina>/<edicion>/` | Lecciones en Markdown, `curso.json` y `videos.json`. |
| `src/domain/types.ts` | Tipos del dominio. |
| `db/schema.sql` | Esquema Postgres con RLS. |
| `scripts/` | Utilidades de contenido. |

## Regenerar el árbol de contenido

Recrea `curso.json` y agrega los archivos de lección que falten. No pisa
lecciones ya escritas.

```bash
python scripts/build_content_tree.py
```

## Antes de escribir contenido

Hay que tener los tres reglamentos en `docs/`. Las URL oficiales están en
`AGENTS.md`. Ninguna afirmación reglamentaria se escribe de memoria.
