# Árbitro Amateur

Aplicación de formación en arbitraje amateur. **Tres cursos independientes**:
fútbol (F5 a F11), futsal y fútbol playa.

No forma árbitros profesionales ni otorga habilitación oficial. Entrena la toma
de decisiones de cancha.

> VER → DECIDIR → EXPLICAR → CORREGIR → REPETIR

## Estado

En construcción. Fase 0 y 1 completas: cimientos, arquitectura de los tres
cursos y árbol de contenido. Todavía no hay aplicación.

| Curso | Módulos | Lecciones | Contenido escrito |
| --- | ---: | ---: | ---: |
| Fútbol | 9 | 54 | 0 |
| Futsal | 11 | 60 | 0 |
| Fútbol playa | 11 | 60 | 0 |

Las 174 lecciones existen como andamio con su estructura y su referencia de
Ley. El texto se redacta leyendo el PDF oficial de cada disciplina.

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
