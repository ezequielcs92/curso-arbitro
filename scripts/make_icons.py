# -*- coding: utf-8 -*-
"""
Genera los iconos PNG de la PWA sin dependencias externas.

Pillow no se puede instalar en esta maquina (pip bloqueado) y `sharp` es un
modulo nativo que el Control de aplicaciones de Windows tambien bloquea, asi
que el PNG se escribe a mano: se dibuja en un buffer RGBA con supermuestreo y
se comprime con zlib, que viene en la biblioteca estandar.

El icono repite la marca de la app: cuadrado redondeado, una diagonal y dos
puntos.

Uso:  python scripts/make_icons.py
"""

import math
import os
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public")

# Verde de marca, el mismo `--color-brand-strong` del tema claro.
BG = (11, 89, 65)
FG = (255, 255, 255)

SS = 4  # supermuestreo: se dibuja a 4x y se promedia, para bordes suaves


def rounded_rect(x, y, w, h, r, px, py):
    """Distancia con signo a un rectangulo redondeado (negativa = adentro)."""
    cx = abs(px - (x + w / 2.0)) - (w / 2.0 - r)
    cy = abs(py - (y + h / 2.0)) - (h / 2.0 - r)
    dx, dy = max(cx, 0.0), max(cy, 0.0)
    return math.hypot(dx, dy) + min(max(cx, cy), 0.0) - r


def segment_distance(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    length = vx * vx + vy * vy
    t = 0.0 if length == 0 else max(0.0, min(1.0, (wx * vx + wy * vy) / length))
    return math.hypot(px - (ax + t * vx), py - (ay + t * vy))


def draw(size, maskable):
    """
    Dibuja el icono y devuelve las filas RGBA.

    Con `maskable` en True el fondo llena todo el lienzo y la marca se dibuja
    dentro de la zona segura: Android recorta el icono con su propia forma y
    cualquier transparencia dejaria un borde raro.
    """
    big = size * SS

    if maskable:
        box_x = box_y = 0.0
        box_w = box_h = float(big)
        # La marca se encoge para quedar dentro del 80 % central.
        mark_x, mark_y = big * 0.125, big * 0.125
        mark_w = mark_h = big * 0.75
    else:
        box_x = box_y = 0.0
        box_w = box_h = float(big)
        mark_x, mark_y = 0.0, 0.0
        mark_w = mark_h = float(big)

    radius = box_w * 0.235

    m = mark_w * 0.235
    ax, ay = mark_x + m, mark_y + mark_h - m
    bx, by = mark_x + mark_w - m, mark_y + m
    stroke = mark_w * 0.072

    dot_r = mark_w * 0.088
    d1x, d1y = mark_x + m * 1.06, mark_y + m * 1.06
    d2x, d2y = mark_x + mark_w - m * 1.06, mark_y + mark_h - m * 1.06

    dim_r = int(BG[0] + (FG[0] - BG[0]) * 0.45)
    dim_g = int(BG[1] + (FG[1] - BG[1]) * 0.45)
    dim_b = int(BG[2] + (FG[2] - BG[2]) * 0.45)

    acc = [[0] * (size * 4) for _ in range(size)]

    for gy in range(big):
        py = gy + 0.5
        row = acc[gy // SS]
        for gx in range(big):
            px = gx + 0.5

            if not maskable and rounded_rect(box_x, box_y, box_w, box_h, radius, px, py) > 0:
                continue  # esquina redondeada: queda transparente

            r, g, b = BG

            if segment_distance(px, py, ax, ay, bx, by) <= stroke / 2:
                r, g, b = FG
            elif math.hypot(px - d1x, py - d1y) <= dot_r:
                r, g, b = FG
            elif math.hypot(px - d2x, py - d2y) <= dot_r:
                r, g, b = dim_r, dim_g, dim_b

            i = (gx // SS) * 4
            row[i] += r
            row[i + 1] += g
            row[i + 2] += b
            row[i + 3] += 255

    samples = SS * SS
    rows = []
    for y in range(size):
        out = bytearray(size * 4)
        src = acc[y]
        for i in range(size * 4):
            out[i] = min(255, src[i] // samples)
        rows.append(bytes(out))
    return rows


def write_png(path, size, rows):
    raw = b"".join(b"\x00" + row for row in rows)

    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")

    with open(path, "wb") as fh:
        fh.write(png)
    return len(png)


def main():
    if not os.path.isdir(OUT):
        os.makedirs(OUT)

    # El icono de Apple va a sangre completa: iOS le aplica su propia mascara
    # y un PNG con esquinas transparentes se veria con halo.
    targets = [
        ("icon-192.png", 192, False),
        ("icon-512.png", 512, False),
        ("icon-maskable-512.png", 512, True),
        ("apple-touch-icon.png", 180, True),
    ]

    for name, size, maskable in targets:
        rows = draw(size, maskable)
        n = write_png(os.path.join(OUT, name), size, rows)
        print("%-26s %4dpx  %6.1f KB" % (name, size, n / 1024.0))


if __name__ == "__main__":
    main()
