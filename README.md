# Árbitro Amateur

Aplicación de formación en arbitraje amateur. **Tres cursos independientes**:
fútbol (F5 a F11), futsal y fútbol playa.

No forma árbitros profesionales ni otorga habilitación oficial. Entrena la toma
de decisiones de cancha.

> VER → DECIDIR → EXPLICAR → CORREGIR → REPETIR

## Estado

**Contenido completo.** Las 174 lecciones de los tres cursos están escritas
contra los reglamentos oficiales. Todavía no hay aplicación.

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

## Lo que falta

1. Los tres bancos de preguntas (480 en total).
2. La aplicación Next.js.
3. Despliegue.

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
