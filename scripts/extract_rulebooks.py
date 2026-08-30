# -*- coding: utf-8 -*-
"""
Extrae el texto de los reglamentos oficiales a .txt, para poder consultarlos
al redactar las lecciones.

Los .txt son material de trabajo derivado de documentos con copyright: no se
versionan en git, igual que los PDF. Se regeneran con este script.

Uso:  python scripts/extract_rulebooks.py
"""

import os
import re
import sys

from pypdf import PdfReader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BOOKS = [
    ("docs/ifab-2026-27-es.pdf", "docs/text/ifab-2026-27-es.txt"),
    ("docs/fifa-futsal-2025-26.pdf", "docs/text/fifa-futsal-2025-26.txt"),
    ("docs/fifa-beach-soccer-2025-26.pdf", "docs/text/fifa-beach-soccer-2025-26.txt"),
]


def extract(src, dst):
    src_path = os.path.join(ROOT, src)
    dst_path = os.path.join(ROOT, dst)

    if not os.path.exists(src_path):
        print("FALTA: %s" % src)
        return False

    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    reader = PdfReader(src_path)

    with open(dst_path, "w", encoding="utf-8", newline="\n") as fh:
        for i, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            text = re.sub(r"\n{3,}", "\n\n", text).strip()
            fh.write("\n\n===== PAGINA %d =====\n" % i)
            fh.write(text)

    size = os.path.getsize(dst_path)
    print("%-40s %3d paginas  %6.1f KB" % (dst, len(reader.pages), size / 1024.0))
    return True


if __name__ == "__main__":
    ok = all([extract(s, d) for s, d in BOOKS])
    sys.exit(0 if ok else 1)
