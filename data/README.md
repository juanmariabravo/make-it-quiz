# ¿Cómo añado mis preguntas?

_Puedes añadir tus preguntas en formato JSON o TXT._
Cada archivo puede contener varias preguntas, y puedes crear tantos archivos como quieras. Cada archivo aparecerá en el jueg como una categoría diferente, que se podrá seleccionar al inicio del juego.

Aquí tienes un ejemplo de cómo estructurarlas:

#### JSON

```json
{
  "questions": [
    {
      "question": "¿Cuál es la capital de Francia?",
      "options": ["París", "Londres", "Berlín"],
      "answer": 0 // Índice de la respuesta correcta (0 para la primera opción, en este caso "París"),
      "points": 2 // Opcional: puntos que vale la pregunta (en este caso 2)
    },
    {
      "question": "¿Qué es Python?",
      "options": ["Un instrumento musical", "Un lenguaje de programación", "Una serpiente", "Un tipo de comida"],
      "answer": 1 // Índice de la respuesta correcta (1 -> "Un lenguaje de programación")
      // Opcional: puntos que vale la pregunta (como no se especifica, por defecto será 1)
    }
  ]
}
```

#### TXT

```txt
¿Cuál es la capital de Francia?
a) París
b) Londres
c) Berlín
d) Madrid
Solución: a)
Puntos: 2

¿Qué es Python?
a) Un instrumento musical
b) Un lenguaje de programación
c) Una serpiente
d) Un tipo de comida
Solución: b)
// Opcional: puntos que vale la pregunta (si no se especifica, por defecto será 1)

```
