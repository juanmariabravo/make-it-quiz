En este documento encontrarás una lista de tareas pendientes y mejoras que se pueden implementar en el proyecto en el futuro. Estas tareas están organizadas por categorías y priorizadas según su importancia y complejidad.

# TODO

### Mayor prioridad

- [ ] Completar el desarrollo de las funcionalidades básicas de los 4 modos de juego. Por hacer queda:
- [ ] Modo CLI
- [ ] Modo Kahoot (llamarlo modo Fiesta)

##### Correcciones de errores

- [ ] Al pasar a la siguiente pregunta, la opción seleccionada en la pregunta anterior no se deselecciona.
- [ ] Al desplazarse a preguntas anteriormente contestadas, en ocasiones se "olvida" la respuesta indicada y se permite volver a seleccionar una respuesta. Esto hace que la suma de puntos sea incorrecta. No se debería permitir volver a responder a una pregunta ya contestada, y si se hace, se debería restar la puntuación obtenida anteriormente.

##### Nuevas funcionalidades prácticas

- [ ] Añadir un botón de "Ayuda" en cada pregunta para consultar antes o después de contestar en el modo Estudio, o después de contestar en el modo Examen. Esto implica cambiar el formato de los archivos de preguntas para incluir una línea o clave del json que contenga la ayuda para cada pregunta. Aprovechando esta modificación, se puede añadir otro campo para incluir una imagen o vídeo que acompañe a la pregunta, y también se puede añadir un campo para incluir una pista o sugerencia que se muestre al usuario antes de responder.
- [ ] Permitir calificaciones más restrictivas como que se aplique penalización (parametrizada y elegible) por cada respuesta incorrecta, o que se aplique un ajuste en la calificación final para corregir el factor de aleatoriedad de las respuestas.
- [ ] Opción de guardar resultados en un archivo de texto o JSON al finalizar el juego, para que el usuario pueda revisar sus respuestas y puntuación posteriormente.
- [ ] Poder modificar el tiempo en cada categoría de preguntas. Actualmente, el tiempo se calcula con 30 segundos por pregunta (línea 57 de `src\app\play\exam\page.tsx`).

### Mejoras futuras menos urgentes

##### Funcionalidades adicionales

- [ ] Implementar nuevos modos de juego o adaptar el modo Kahoot (llamarlo modo Fiesta).
- [ ] Modo "Adivina la respuesta" (pregunta con opciones múltiples).
- [ ] Modo "Completa la frase" (pregunta con una palabra o frase a completar).
- [ ] Modo "Ordena las respuestas" (pregunta con varias respuestas que deben ordenarse).
- [ ] Modo "Verdadero o falso" (pregunta con dos opciones: verdadero o falso).
- [ ] Permitir a los usuarios personalizar sus categorías de preguntas y crear nuevas categorías. Permitir a los usuarios añadir sus propias preguntas desde la interfaz del juego, tanto de forma manual como importando archivos JSON o TXT. Esto implica crear un formulario para añadir preguntas y un sistema para validar y almacenar las preguntas añadidas por los usuarios.
- [ ] Añadir una opción para revisar las respuestas al final del juego.
- [ ] Implementar un sistema de logros o recompensas.
