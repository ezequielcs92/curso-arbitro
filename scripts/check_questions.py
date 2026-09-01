# -*- coding: utf-8 -*-
"""
Valida los bancos de preguntas y reporta el avance.

Comprueba, para cada archivo:

- que el módulo exista en el `curso.json` de su disciplina;
- que los identificadores no se repitan;
- que la respuesta correcta apunte a una opción que existe;
- que toda pregunta tenga explicación y referencia reglamentaria, porque una
  pregunta sin explicación no enseña nada (especificación § 64);
- que las decisiones de partido repartan los 10 puntos por componentes.

Uso:  python scripts/check_questions.py
"""

import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

COURSES = [
    ("Fútbol", "football", "content/football/ifab-2026-27", 220),
    ("Futsal", "futsal", "content/futsal/fifa-2025-26", 140),
    ("Fútbol playa", "beach_soccer", "content/beach-soccer/fifa-2025-26", 120),
]

# Reparto por módulo. Sigue el peso de cada bloque en `docs/cursos.md`: pesa más
# lo que más se cobra y más se equivoca en cada disciplina.
TARGETS = {
    "football": {
        "f1": 20, "f2": 25, "f3": 20, "f4": 20, "f5": 30,
        "f6": 40, "f7": 30, "f8": 20, "f9": 15,
    },
    "futsal": {
        "s1": 10, "s2": 15, "s3": 12, "s4": 15, "s5": 12, "s6": 18,
        "s7": 20, "s8": 12, "s9": 12, "s10": 8, "s11": 6,
    },
    "beach_soccer": {
        "p1": 8, "p2": 14, "p3": 10, "p4": 14, "p5": 12, "p6": 14,
        "p7": 16, "p8": 8, "p9": 10, "p10": 8, "p11": 6,
    },
}

# Composicion del examen final, seccion 70-73 de la especificacion.
EXAM_TARGETS = {
    "football": {"jugadas": 30, "reglamentos": 10},
    "futsal": {"jugadas": 25, "reglamentos": 10},
    "beach_soccer": {"jugadas": 25, "reglamentos": 10},
}

VALID_TYPES = {"multiple_choice", "true_false", "decision"}
VALID_TECHNICAL = {
    "direct_free_kick", "indirect_free_kick", "free_kick", "penalty_kick", "dropped_ball",
    "play_on", "advantage", "corner_kick", "goal_kick", "throw_in", "dfksaf",
}
VALID_DISCIPLINARY = {"none", "caution", "send_off"}
VALID_RESTART = {
    "no_restart", "place_of_offence", "penalty_mark", "ten_metre_mark", "centre_of_pitch",
    "penalty_area_line", "goal_line", "corner",
}

errors = []
seen_ids = set()


def fail(where, message):
    errors.append("%s: %s" % (where, message))


def check_question(where, q, discipline, module_id):
    qid = q.get("id")
    if not qid:
        fail(where, "pregunta sin id")
        return
    if qid in seen_ids:
        fail(where, "id repetido: %s" % qid)
    seen_ids.add(qid)

    at = "%s [%s]" % (where, qid)

    qtype = q.get("type")
    if qtype not in VALID_TYPES:
        fail(at, "tipo inválido: %r" % qtype)

    if not q.get("question", "").strip():
        fail(at, "sin enunciado")

    if not q.get("explanation", "").strip():
        fail(at, "sin explicación")

    if not q.get("ruleReference", "").strip():
        fail(at, "sin referencia reglamentaria")

    difficulty = q.get("difficulty")
    if difficulty not in (1, 2, 3, 4, 5):
        fail(at, "dificultad inválida: %r" % difficulty)

    if not q.get("tags"):
        fail(at, "sin etiquetas")

    answer = q.get("correctAnswer")

    if qtype == "multiple_choice":
        options = q.get("options")
        if not isinstance(options, list) or len(options) < 3:
            fail(at, "necesita al menos tres opciones")
        elif not isinstance(answer, int) or not (0 <= answer < len(options)):
            fail(at, "correctAnswer fuera de rango: %r" % answer)
        elif len(set(options)) != len(options):
            fail(at, "opciones repetidas")

    elif qtype == "true_false":
        if not isinstance(answer, bool):
            fail(at, "correctAnswer debe ser booleano")

    elif qtype == "decision":
        if not isinstance(answer, dict):
            fail(at, "una decisión necesita sus cuatro componentes")
        else:
            if not isinstance(answer.get("isOffence"), bool):
                fail(at, "isOffence debe ser booleano")
            if answer.get("technical") not in VALID_TECHNICAL:
                fail(at, "technical inválido: %r" % answer.get("technical"))
            if answer.get("disciplinary") not in VALID_DISCIPLINARY:
                fail(at, "disciplinary inválido: %r" % answer.get("disciplinary"))
            if answer.get("restart") not in VALID_RESTART:
                fail(at, "restart inválido: %r" % answer.get("restart"))

            # `dfksaf` es el tiro libre desde la sexta falta acumulada: solo
            # existe en futsal.
            if answer.get("technical") == "dfksaf" and discipline != "futsal":
                fail(at, "dfksaf solo existe en futsal")

            # El fútbol playa no distingue directo de indirecto, y las otras dos
            # disciplinas sí: usar el término de la otra enseñaría mal.
            tech = answer.get("technical")
            if discipline == "beach_soccer" and tech in (
                    "direct_free_kick", "indirect_free_kick"):
                fail(at, "en fútbol playa el tiro libre no se divide en directo "
                         "e indirecto: usar 'free_kick'")
            if discipline != "beach_soccer" and tech == "free_kick":
                fail(at, "'free_kick' es solo de fútbol playa")

    if q.get("moduleId") != module_id:
        fail(at, "moduleId no coincide con el archivo: %r" % q.get("moduleId"))


def check_exam(base, discipline, name):
    """Valida el pozo de jugadas y los reglamentos privados de un curso."""
    targets = EXAM_TARGETS[discipline]
    lines = []

    # Parte B: jugadas
    path = os.path.join(ROOT, base, "examen", "jugadas.json")
    count = 0
    if os.path.exists(path):
        data = json.load(io.open(path, encoding="utf-8"))
        if data.get("discipline") != discipline:
            fail(path, "disciplina incorrecta")
        for q in data.get("questions", []):
            check_question("examen/jugadas.json", q, discipline, "examen")
            if q.get("type") != "decision":
                fail("examen/jugadas.json [%s]" % q.get("id"),
                     "la parte B son decisiones completas")
        count = len(data.get("questions", []))
    lines.append("jugadas %d/%d" % (count, targets["jugadas"]))

    # Parte C: reglamentos privados, cada uno con sus situaciones
    path = os.path.join(ROOT, base, "examen", "reglamentos.json")
    books = 0
    if os.path.exists(path):
        data = json.load(io.open(path, encoding="utf-8"))
        if data.get("discipline") != discipline:
            fail(path, "disciplina incorrecta")

        for book in data.get("rulebooks", []):
            books += 1
            where = "examen/reglamentos.json [%s]" % book.get("id")

            if not book.get("articles"):
                fail(where, "reglamento sin articulos")
            if not book.get("name"):
                fail(where, "reglamento sin nombre")

            questions = book.get("questions", [])
            if len(questions) != targets["reglamentos"]:
                fail(where, "tiene %d situaciones, se esperan %d"
                     % (len(questions), targets["reglamentos"]))
            for q in questions:
                check_question(where, q, discipline, "examen")

    lines.append("reglamentos %d" % books)
    print("%14s examen: %s" % ("", ", ".join(lines)))


def main():
    grand_have = grand_want = 0
    print("%-14s %-6s %8s %8s  %s" % ("CURSO", "MOD", "ESCRITAS", "META", "AVANCE"))
    print("-" * 64)

    for name, discipline, base, total_target in COURSES:
        with io.open(os.path.join(ROOT, base, "curso.json"), encoding="utf-8") as fh:
            course = json.load(fh)

        module_ids = [m["id"] for m in course["modules"]]
        targets = TARGETS[discipline]

        have = 0
        pending = []

        for module_id in module_ids:
            want = targets.get(module_id, 0)
            path = os.path.join(ROOT, base, "preguntas", module_id + ".json")

            count = 0
            if os.path.exists(path):
                try:
                    with io.open(path, encoding="utf-8") as fh:
                        data = json.load(fh)
                except ValueError as exc:
                    fail(path, "JSON inválido: %s" % exc)
                    data = None

                if data:
                    if data.get("moduleId") != module_id:
                        fail(path, "moduleId del archivo no coincide")
                    if data.get("discipline") != discipline:
                        fail(path, "disciplina incorrecta")

                    questions = data.get("questions", [])
                    count = len(questions)
                    for q in questions:
                        check_question(os.path.basename(path), q, discipline, module_id)

            have += count
            if count < want:
                pending.append("%s %d/%d" % (module_id, count, want))

        grand_have += have
        grand_want += total_target
        pct = 100.0 * have / total_target if total_target else 0
        bar = "#" * int(pct / 5) + "." * (20 - int(pct / 5))
        print("%-14s %-6d %8d %8d  %s %5.1f%%" % (
            name, len(module_ids), have, total_target, bar, pct))

        if pending:
            print("%14s faltan: %s" % ("", ", ".join(pending)))

        check_exam(base, discipline, name)

    print("-" * 64)
    pct = 100.0 * grand_have / grand_want if grand_want else 0
    print("%-14s %-6s %8d %8d  %20s %5.1f%%" % (
        "TOTAL", "", grand_have, grand_want, "", pct))

    if errors:
        print("\n%d problema(s):\n" % len(errors))
        for e in errors[:40]:
            print("  -", e)
        if len(errors) > 40:
            print("  ... y %d más" % (len(errors) - 40))
        return 1

    print("\nSin errores de validación.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
