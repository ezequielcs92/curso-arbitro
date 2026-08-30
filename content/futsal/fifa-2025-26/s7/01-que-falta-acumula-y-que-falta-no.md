---
id: s7-l1
moduleId: s7
discipline: futsal
order: 1
title: "Qué falta acumula y qué falta no"
rulesVersion: "FIFA Futsal 2025-26"
ruleReference: "Ley 13.4, Ley 12.1, Ley 12.4"
status: written
---

# Qué falta acumula y qué falta no

## Regla

**Definición (Ley 13.4):**

> Las faltas acumuladas son aquellas **sancionadas con un tiro libre directo**,
> según se especifica en la Ley 3, la Ley 4 y la Ley 12.

Las faltas acumuladas de cada equipo **en cada período** se registran en el acta
del partido.

**La excepción (Ley 12.1):**

> **No se registra falta acumulada cuando se concede un penal.**

**La extensión (Ley 12.4):**

> Si un **suplente, un jugador expulsado o un oficial de equipo** comete una
> infracción de tiro libre directo, **cuenta como falta acumulada** contra su
> equipo.

**En la prórroga (Ley 13.4):** las faltas acumuladas del **segundo período**
siguen contando durante la prórroga.

## En palabras simples

La regla es de una sola línea:

> **Acumula todo lo que se sanciona con tiro libre directo. Nada más, y nada
> menos.**

De ahí salen las cuatro consecuencias que hay que tener automatizadas:

**1. Acumula aunque no haya tarjeta.** Una falta imprudente, sin amonestación,
acumula igual. El conteo no mide gravedad: mide tipo de reanudación.

**2. No acumula el tiro libre indirecto.** Juego peligroso, obstaculizar sin
contacto, ofensas verbales, los cuatro segundos del arquero: nada de eso acumula.

**3. No acumula el penal.** Aunque la infracción sea de tiro libre directo, si
terminó en penal, no se registra.

**4. Acumula lo que hace el banco.** Un suplente o un oficial que comete una
infracción de tiro libre directo le suma una acumulada a su equipo.

### La tabla de decisión

| Situación | ¿Acumula? |
|---|---|
| Entrada imprudente, sin tarjeta | **Sí** |
| Entrada temeraria, amarilla | **Sí** |
| Mano deliberada fuera del área | **Sí** |
| Sujetar a un adversario | **Sí** |
| Falta de tiro libre directo dentro del área → penal | **No** |
| Juego peligroso (indirecto) | **No** |
| Los cuatro segundos del arquero (indirecto) | **No** |
| Protesta / ofensa verbal (indirecto) | **No** |
| Suplente que patea un objeto a un rival | **Sí** |

Memorizar esta tabla es, en la práctica, saber arbitrar futsal.

## Ejemplo

Primer período, equipo B. Secuencia de faltas:

1. Minuto 3 — entrada imprudente fuera del área → TLD → **acumulada 1**.
2. Minuto 7 — juego peligroso, sin contacto → TLI → **no acumula**.
3. Minuto 11 — sujeta a un rival → TLD → **acumulada 2**.
4. Minuto 14 — protesta → TLI + amarilla → **no acumula**.
5. Minuto 16 — derriba a un rival **dentro de su área** → **penal** → **no
   acumula**.
6. Minuto 18 — el arquero retiene cinco segundos → TLI → **no acumula**.
7. Minuto 19 — un suplente patea una botella hacia un rival → TLD → **acumulada
   3**.

Al final del primer período, B tiene **tres acumuladas**, aunque cometió siete
infracciones. Y una de las tres la cometió alguien que no estaba jugando.

## Error común

**Contar solo las faltas con tarjeta.** La mayoría de las acumuladas no llevan
tarjeta.

**Contar los indirectos.** No acumulan.

**Contar el penal.** Es la excepción expresa.

**Olvidar las del banco.** Suplentes, expulsados y oficiales suman a su equipo.

**Reiniciar el conteo en la prórroga.** Las del segundo período siguen contando.

## Mini test

**1. Cobrás una falta imprudente fuera del área, sin mostrar tarjeta. ¿Acumula?**

A. No: sin tarjeta no acumula
B. Sí: acumula toda falta sancionada con tiro libre directo
C. Solo si el equipo ya tiene tres
D. Solo en el segundo período

<details>
<summary>Respuesta</summary>

**B.** El conteo depende del tipo de reanudación, no de la sanción
disciplinaria.
</details>

**2. Concedés un penal por una entrada dentro del área. ¿Acumula?**

A. Sí
B. No: no se registra falta acumulada cuando se concede penal
C. Sí, y cuenta doble
D. Solo si el penal se convierte

<details>
<summary>Respuesta</summary>

**B.** Es la excepción expresa de la Ley 12.1.
</details>

**3. Un oficial del equipo A comete una infracción de tiro libre directo desde el
área técnica. ¿Qué efecto tiene sobre el conteo?**

A. Ninguno: no es jugador
B. Suma una falta acumulada al equipo A
C. Suma media falta acumulada
D. Solo suma si es expulsado

<details>
<summary>Respuesta</summary>

**B.** La Ley 12.4 extiende el conteo a suplentes, expulsados y oficiales de
equipo.
</details>
