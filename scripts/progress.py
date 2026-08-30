# -*- coding: utf-8 -*-
"""
Informa cuánto contenido está escrito, leyendo el campo `status` del frontmatter
de cada lección: `draft` (andamio) o `written` (redactada).

Uso:  python scripts/progress.py
"""

import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

COURSES = [
    ("Fútbol", "content/football/ifab-2026-27"),
    ("Futsal", "content/futsal/fifa-2025-26"),
    ("Fútbol playa", "content/beach-soccer/fifa-2025-26"),
]


def status_of(path):
    with io.open(path, encoding="utf-8") as fh:
        head = fh.read(600)
    m = re.search(r"^status:\s*(\w+)", head, re.MULTILINE)
    return m.group(1) if m else "draft"


def main():
    grand_written = grand_total = 0
    print("%-14s %-6s %8s %8s  %s" % ("CURSO", "MOD", "ESCRITAS", "TOTAL", "AVANCE"))
    print("-" * 62)

    for name, base in COURSES:
        with io.open(os.path.join(ROOT, base, "curso.json"), encoding="utf-8") as fh:
            course = json.load(fh)

        written = total = 0
        pending = []

        for module in course["modules"]:
            m_written = 0
            for lesson in module["lessons"]:
                total += 1
                if status_of(os.path.join(ROOT, lesson["contentPath"])) == "written":
                    written += 1
                    m_written += 1
            if m_written < len(module["lessons"]):
                pending.append("%s %d/%d" % (module["id"], m_written, len(module["lessons"])))

        grand_written += written
        grand_total += total
        pct = 100.0 * written / total if total else 0
        bar = "#" * int(pct / 5) + "." * (20 - int(pct / 5))
        print("%-14s %-6d %8d %8d  %s %5.1f%%" % (
            name, len(course["modules"]), written, total, bar, pct))

        if pending:
            print("%14s pendientes: %s" % ("", ", ".join(pending)))

    print("-" * 62)
    pct = 100.0 * grand_written / grand_total if grand_total else 0
    print("%-14s %-6s %8d %8d  %20s %5.1f%%" % (
        "TOTAL", "", grand_written, grand_total, "", pct))


if __name__ == "__main__":
    main()
