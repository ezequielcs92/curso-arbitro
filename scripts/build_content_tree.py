"""
Genera el árbol de contenido de los tres cursos.

Crea, para cada disciplina:
  - content/<disciplina>/<edicion>/curso.json  con la estructura de módulos
  - content/<disciplina>/<edicion>/<modulo>/<leccion>.md  con el andamio

Es idempotente: no pisa un archivo .md que ya tenga contenido escrito. El
curso.json sí se regenera siempre, porque es la estructura y vive acá.

Uso:  python scripts/build_content_tree.py
"""

import json
import os
import re
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DISCIPLINES = {
    "football": {
        "name": "Fútbol",
        "edition": "ifab-2026-27",
        "rules_version": "IFAB 2026/27",
        "source_pdf": "docs/ifab-2026-27-es.pdf",
        "dir": "football",
    },
    "futsal": {
        "name": "Futsal",
        "edition": "fifa-2025-26",
        "rules_version": "FIFA Futsal 2025-26",
        "source_pdf": "docs/fifa-futsal-2025-26.pdf",
        "dir": "futsal",
    },
    "beach_soccer": {
        "name": "Fútbol playa",
        "edition": "fifa-2025-26",
        "rules_version": "FIFA Beach Soccer 2025-26",
        "source_pdf": "docs/fifa-beach-soccer-2025-26.pdf",
        "dir": "beach-soccer",
    },
}

# (id, título, leyes cubiertas, crítico, [lecciones])
CURRICULUM = {
    "football": [
        ("f1", "El trabajo del árbitro", [5], False, [
            "Qué hace y qué no hace un árbitro",
            "Autoridad e imparcialidad",
            "Criterio y espíritu del juego",
            "Seguridad como prioridad",
            "Preparación del partido y checklist previo",
        ]),
        ("f2", "Reglas 1 a 4: el escenario", [1, 2, 3, 4], False, [
            "Regla 1 — Terreno de juego",
            "Regla 2 — Balón",
            "Regla 3 — Jugadores y sustituciones",
            "Regla 4 — Equipamiento y seguridad",
            "Adaptación a canchas de F5, F7, F8 y F9",
        ]),
        ("f3", "Reglas 5 y 6: el equipo arbitral", [5, 6], True, [
            "Regla 5 — Autoridad y decisiones del árbitro",
            "Regla 5 — Ventaja",
            "Regla 5 — Lesiones, interferencias y cambio de decisión",
            "Regla 6 — Otros miembros del equipo arbitral",
            "Trabajar con un asistente sin intercomunicadores",
        ]),
        ("f4", "Reglas 7 a 10: tiempo, balón y resultado", [7, 8, 9, 10], False, [
            "Regla 7 — Duración y tiempo añadido",
            "Regla 8 — Inicio y reanudación, balón a tierra",
            "Regla 9 — Balón dentro y fuera: ¿salió completamente?",
            "Regla 10 — Gol, resultado y desempates",
        ]),
        ("f5", "Regla 11: fuera de juego", [11], True, [
            "Posición de fuera de juego",
            "Infracción de fuera de juego",
            "Interferir en el juego, interferir a un adversario, obtener ventaja",
            "Rebote, desvío, salvada y juego deliberado",
            "Reanudaciones que no generan fuera de juego",
            "El fuera de juego en formatos reducidos",
        ]),
        ("f6", "Regla 12: faltas y conducta incorrecta", [12], True, [
            "¿Existe infracción?",
            "Tiro libre directo o indirecto",
            "Imprudencia, temeridad y fuerza excesiva",
            "Mano",
            "Juego brusco grave y conducta violenta",
            "DOGSO y SPA",
            "Protestas, retrasar la reanudación y conducta antideportiva",
            "El árbol de decisión completo",
        ]),
        ("f7", "Reglas 13 a 17: pelota parada", [13, 14, 15, 16, 17], False, [
            "Regla 13 — Tiros libres, barrera y ejecución rápida",
            "Regla 14 — Penal",
            "Regla 15 — Saque de banda",
            "Regla 16 — Saque de meta",
            "Regla 17 — Saque de esquina",
        ]),
        ("f8", "Manejo del partido y arbitraje amateur", [5, 12], False, [
            "Escala de intervención: presencia, palabra, advertencia, sanción",
            "Protestas, capitán y cuerpo técnico",
            "Situaciones de riesgo y seguridad del árbitro",
            "Señalización y uso del silbato",
            "Posicionamiento y desplazamiento",
            "Leer un reglamento de liga privada",
            "El informe arbitral",
        ]),
    ],
    "futsal": [
        ("s1", "El futsal y el equipo arbitral", [5, 6], False, [
            "Qué es el futsal y en qué se diferencia del fútbol 5",
            "El equipo arbitral: árbitro, segundo, tercero y cronometrador",
            "Autoridad, criterio y seguridad",
            "Preparación del partido",
        ]),
        ("s2", "Leyes 1 a 4: pista, balón, jugadores, equipamiento", [1, 2, 3, 4], False, [
            "Ley 1 — La pista, sus marcas y el punto de 10 m",
            "Ley 1 — Zonas de sustitución y área técnica",
            "Ley 2 — El balón",
            "Ley 3 — Cinco jugadores, mínimo tres, sustituciones ilimitadas",
            "Ley 3 — Procedimiento de sustitución y reingreso indebido",
            "Ley 4 — Equipamiento",
        ]),
        ("s3", "Leyes 5 y 6: los árbitros", [5, 6], True, [
            "Ley 5 — Autoridad y decisiones",
            "Ley 5 — Poderes y deberes",
            "Ley 5 — Ventaja y su interacción con las faltas acumuladas",
            "Ley 6 — Segundo árbitro, tercer árbitro y cronometrador",
            "Arbitrar de a dos: reparto de responsabilidades y comunicación",
        ]),
        ("s4", "Ley 7: tiempo efectivo y tiempo muerto", [7], True, [
            "Dos períodos de 20 minutos de tiempo efectivo",
            "Cuándo se detiene y se reanuda el cronómetro",
            "El cronometrador y la señal acústica",
            "El tiempo muerto de un minuto",
            "Prolongar el período para completar un DFKSAF o un penal",
        ]),
        ("s5", "Leyes 8 a 11: reanudación, balón y resultado", [8, 9, 10, 11], False, [
            "Ley 8 — Saque inicial y balón a tierra",
            "Ley 9 — Balón dentro y fuera, y el techo de la instalación",
            "Ley 10 — Gol, ganador y penales",
            "Ley 11 — No hay fuera de juego en futsal",
        ]),
        ("s6", "Ley 12: faltas y conducta incorrecta", [12], True, [
            "Tiro libre directo",
            "Tiro libre indirecto",
            "Imprudencia, temeridad y fuerza excesiva",
            "Medidas disciplinarias",
            "Reanudación después de faltas y conducta incorrecta",
        ]),
        ("s7", "Faltas acumuladas y el tiro libre desde la sexta", [13], True, [
            "Qué falta acumula y qué falta no",
            "Llevar la cuenta y comunicarla al cronometrador",
            "La ventaja cuando el equipo ya lleva cinco acumuladas",
            "El DFKSAF: procedimiento desde el punto de 10 m",
            "Elegir entre el punto de 10 m y el lugar de la infracción",
            "Posiciones de los jugadores y del arquero",
        ]),
        ("s8", "Leyes 13 y 14: pelota parada y penal", [13, 14], False, [
            "Ley 13 — Tipos de tiro libre y procedimiento",
            "Ley 13 — La regla de los cuatro segundos",
            "Ley 14 — El penal",
            "Barrera y distancias",
        ]),
        ("s9", "Leyes 15 a 17: reanudaciones propias del futsal", [15, 16, 17], False, [
            "Ley 15 — El saque de banda con el pie",
            "Ley 16 — El saque de meta",
            "Ley 17 — El saque de esquina",
            "Los cuatro segundos en cada reanudación",
        ]),
        ("s10", "Señalización, posicionamiento y manejo del partido", [5, 6, 12], True, [
            "Señales obligatorias del futsal",
            "Señales hacia el cronometrador y el tercer árbitro",
            "Posicionamiento del arbitraje a dos",
            "Rotación y cobertura de la pista",
            "Manejo del partido, protestas y área técnica",
            "Seguridad del árbitro",
            "Leer un reglamento de liga privada de futsal",
        ]),
    ],
    "beach_soccer": [
        ("p1", "El fútbol playa y el equipo arbitral", [5, 6], False, [
            "Qué es el fútbol playa y qué lo diferencia",
            "La arena como condición de juego",
            "El equipo arbitral y el cronometrador",
            "Preparación del partido y seguridad en cancha abierta",
        ]),
        ("p2", "Leyes 1 a 4: arena, balón, jugadores, equipamiento", [1, 2, 3, 4], False, [
            "Ley 1 — La superficie de arena y las marcas",
            "Ley 1 — Área penal, zona de sustitución y banderines",
            "Ley 2 — El balón",
            "Ley 3 — Cinco jugadores, mínimo tres, sustituciones ilimitadas",
            "Ley 3 — Salida autorizada y no autorizada de la cancha, refrigerios",
            "Ley 4 — Equipamiento: se juega descalzo",
        ]),
        ("p3", "Leyes 5 y 6: los árbitros", [5, 6], True, [
            "Ley 5 — Autoridad y decisiones",
            "Ley 5 — Poderes y deberes",
            "Ley 5 — Sistema de revisión de tiempo y apoyo por video",
            "Ley 6 — Asistentes, tercer árbitro y cuarto árbitro",
            "Arbitrar de a dos sobre arena",
        ]),
        ("p4", "Ley 7: tres períodos y cronómetro", [7], True, [
            "Tres períodos de 12 minutos de tiempo efectivo",
            "El cronómetro y qué hacer si falla",
            "Los descansos de tres minutos",
            "Paradas médicas y pausas de hidratación",
            "Prolongar el período para completar un tiro libre o un penal",
        ]),
        ("p5", "Leyes 8 a 11: reanudación, balón y resultado", [8, 9, 10, 11], True, [
            "Ley 8 — Saque inicial y balón a tierra",
            "Ley 9 — Balón dentro y fuera",
            "Ley 10 — Gol y la línea de meta imaginaria",
            "Ley 10 — Empate, prórroga y penales",
            "Ley 11 — No hay fuera de juego en fútbol playa",
        ]),
        ("p6", "Ley 12: faltas y conducta incorrecta", [12], True, [
            "Faltas por contacto y la escala de intensidad",
            "Mano, sujetar e impedir con contacto",
            "Impedir ilegalmente una chilena o tijera",
            "Arrojar arena, morder o escupir",
            "Medidas disciplinarias",
            "Dónde se ejecuta el tiro libre resultante",
        ]),
        ("p7", "Ley 13: tiros libres sin barrera", [13], True, [
            "Los dos tipos de tiro libre según la mitad de la cancha",
            "Está prohibido formar barrera",
            "Los cuatro segundos",
            "Quién puede ejecutar",
            "El montículo de arena y el levantamiento del balón",
            "Posicionamiento de los árbitros en cada tipo",
        ]),
        ("p8", "Ley 14: el penal", [14], False, [
            "Procedimiento",
            "Infracciones y sanciones",
            "El punto penal imaginario",
        ]),
        ("p9", "Leyes 15 a 17: reanudaciones propias del fútbol playa", [15, 16, 17], False, [
            "Ley 15 — Saque de banda con el pie o con la mano",
            "Ley 16 — El saque de meta",
            "Ley 17 — El saque de esquina",
            "Los cuatro segundos en cada reanudación",
        ]),
        ("p10", "Señalización, posicionamiento y manejo del partido", [5, 6, 12], True, [
            "Señales del fútbol playa",
            "El conteo visible de los cuatro segundos",
            "Posicionamiento sobre arena y desplazamiento",
            "Manejo del partido y área técnica",
            "Seguridad del árbitro en cancha abierta",
            "Leer un reglamento de torneo privado de fútbol playa",
        ]),
    ],
}

LESSON_TEMPLATE = """---
id: {lesson_id}
moduleId: {module_id}
discipline: {discipline}
order: {order}
title: "{title}"
rulesVersion: "{rules_version}"
ruleReference: ""
status: draft
---

# {title}

## Regla

<!-- TODO: redactar desde {source_pdf}. No escribir de memoria. -->

## En palabras simples

<!-- TODO -->

## Ejemplo

<!-- TODO -->

## Error común

<!-- TODO -->

## Mini test

<!-- TODO: 3 a 5 preguntas, con explicación en cada una. -->
"""


def slugify(text):
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:60]


def build():
    created = skipped = 0

    for discipline, meta in DISCIPLINES.items():
        base = os.path.join(ROOT, "content", meta["dir"], meta["edition"])
        modules_json = []

        for order, (mod_id, title, laws, critical, lessons) in enumerate(
            CURRICULUM[discipline], start=1
        ):
            mod_dir = os.path.join(base, mod_id)
            os.makedirs(mod_dir, exist_ok=True)

            lessons_json = []
            for l_order, l_title in enumerate(lessons, start=1):
                slug = "%02d-%s" % (l_order, slugify(l_title))
                lesson_id = "%s-l%d" % (mod_id, l_order)
                path = os.path.join(mod_dir, slug + ".md")
                rel = os.path.relpath(path, ROOT).replace("\\", "/")

                lessons_json.append({
                    "id": lesson_id,
                    "moduleId": mod_id,
                    "order": l_order,
                    "title": l_title,
                    "contentPath": rel,
                })

                if os.path.exists(path):
                    skipped += 1
                    continue

                with open(path, "w", encoding="utf-8", newline="\n") as fh:
                    fh.write(LESSON_TEMPLATE.format(
                        lesson_id=lesson_id,
                        module_id=mod_id,
                        discipline=discipline,
                        order=l_order,
                        title=l_title,
                        rules_version=meta["rules_version"],
                        source_pdf=meta["source_pdf"],
                    ))
                created += 1

            modules_json.append({
                "id": mod_id,
                "discipline": discipline,
                "order": order,
                "title": title,
                "laws": laws,
                "critical": critical,
                "requiredScore": 85 if critical else 80,
                "lessons": lessons_json,
            })

        course = {
            "discipline": discipline,
            "title": meta["name"],
            "rulesVersion": meta["rules_version"],
            "sourcePdf": meta["source_pdf"],
            "modules": modules_json,
        }

        os.makedirs(base, exist_ok=True)
        with open(os.path.join(base, "curso.json"), "w", encoding="utf-8", newline="\n") as fh:
            json.dump(course, fh, ensure_ascii=False, indent=2)
            fh.write("\n")

        # Catálogo de videos complementarios, vacío hasta que se curen.
        videos_path = os.path.join(base, "videos.json")
        if not os.path.exists(videos_path):
            with open(videos_path, "w", encoding="utf-8", newline="\n") as fh:
                json.dump({"discipline": discipline, "videos": []}, fh,
                          ensure_ascii=False, indent=2)
                fh.write("\n")

        n_lessons = sum(len(m["lessons"]) for m in modules_json)
        print("%-13s %2d módulos, %3d lecciones" % (meta["name"], len(modules_json), n_lessons))

    print("\nArchivos de lección creados: %d, ya existentes: %d" % (created, skipped))


if __name__ == "__main__":
    build()
